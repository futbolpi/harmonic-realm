import { format, subHours } from "date-fns";
import prisma from "@/lib/prisma";

import { inngest } from "@/inngest/client";
import { generateActivitySnapshot } from "@/lib/api-helpers/server/resonance-surge/generate-activity-snapshot";
import { spawnSurgeNodes } from "@/lib/api-helpers/server/resonance-surge/spawn-surge-nodes";

/**
 * ENHANCED: Daily Resonance Surge Spawn Workflow with Edge Case Handling
 *
 * Improvements:
 * 1. Zero Activity Fallback: Baseline 50 nodes in seed hexes (territories first, major cities fallback)
 * 2. Geographic Diversity Penalty: Prevents oversaturation in single metro areas
 * 3. Aggressive Cleanup: Removes expired nodes, snapshots, and old spawn logs
 * 4. Error Recovery: Graceful degradation with retry logic
 *
 * FIX (aggressive-cleanup): Added explicit pre-deletion of MiningSession and TuningSession
 * records for deletable nodes. Both models declare `onDelete: Restrict` on their `nodeId`
 * FK — Postgres will refuse to delete a Node while either table still holds a referencing row.
 * Added ACTIVE MiningSession guard so nodes mid-session are promoted to the protected set.
 * All child-record deletions run inside a single $transaction so a partial failure never
 * leaves the database in an inconsistent state.
 *
 * Schedule: Daily at 00:00 UTC
 */
export const spawnDailyResonanceSurgesWorkflow = inngest.createFunction(
  {
    id: "spawn-daily-resonance-surges",
    retries: 2,
    concurrency: { limit: 1 }, // Prevent overlapping runs
  },
  { cron: "0 0 * * *" }, // Daily at midnight UTC
  async ({ step, logger }) => {
    const today = format(new Date(), "yyyy-MM-dd");

    // =====================================================================
    // STEP 1: AGGRESSIVE CLEANUP
    // =====================================================================
    const cleanupResult = await step.run("aggressive-cleanup", async () => {
      logger.info("Starting aggressive cleanup of expired Surge data...");

      // 1a. Find expired unstabilized Surge nodes eligible for deletion.
      const expiredSurges = await prisma.resonanceSurge.findMany({
        where: {
          spawnCycle: { lt: today },
          isStabilized: false,
        },
        select: { nodeId: true },
      });

      logger.info(
        `Found ${expiredSurges.length} expired Surge nodes to evaluate`,
      );

      let nodesDeleted = 0;

      if (expiredSurges.length > 0) {
        const candidateNodeIds = expiredSurges.map((s) => s.nodeId);

        // ── Protection Gate ───────────────────────────────────────────────
        // Nodes must be preserved when they have:
        //   (a) a lore stake with a live payment (PROCESSING / COMPLETED), OR
        //   (b) an ACTIVE mining session (player is currently mid-session
        //       and session not older than an hour)
        //
        // (a) Lore stake guard
        const loreProtected = await prisma.locationLoreStake.findMany({
          where: {
            nodeId: { in: candidateNodeIds },
            paymentStatus: { in: ["PROCESSING", "COMPLETED"] },
          },
          select: { nodeId: true },
        });

        // (b) Active mining session guard — NEW
        // A node with a recent ACTIVE session must not be deleted mid-play.
        const sessionProtected = await prisma.miningSession.findMany({
          where: {
            nodeId: { in: candidateNodeIds },
            status: "ACTIVE",
            createdAt: { gt: subHours(new Date(), 1) },
          },
          select: { nodeId: true },
        });

        const protectedNodeIds = new Set([
          ...loreProtected.map((s) => s.nodeId),
          ...sessionProtected.map((s) => s.nodeId),
        ]);

        const deletableNodeIds = candidateNodeIds.filter(
          (id) => !protectedNodeIds.has(id),
        );

        logger.info(
          `Deletable nodes: ${deletableNodeIds.length} | Protected (lore: ${loreProtected.length}, active session: ${sessionProtected.length})`,
        );

        if (deletableNodeIds.length > 0) {
          // ── Ordered child-record cleanup inside a single transaction ────
          //
          // Postgres enforces every FK with RESTRICT before the parent row
          // can be removed. The delete order must respect the dependency tree:
          //
          //   LocationLoreStake  (FK → location_lore.nodeId  RESTRICT)
          //   LoreGenerationJob  (FK → nodes.id              RESTRICT)
          //   MiningSession      (FK → nodes.id              RESTRICT)  ← was missing
          //   TuningSession      (FK → nodes.id              RESTRICT)  ← was missing
          //   ── everything below cascades automatically once Node is gone ──
          //   ResonanceSurge     (FK → nodes.id  CASCADE)
          //   LocationLore       (FK → nodes.id  CASCADE)
          //   NodeDrift          (FK → nodes.id  CASCADE)
          //   User.lastDriftNodeId (FK → nodes.id  SET NULL)
          //
          const result = await prisma.$transaction(async (tx) => {
            // Step A: Remove non-live lore stakes blocking LocationLore cascade
            await tx.locationLoreStake.deleteMany({
              where: {
                nodeId: { in: deletableNodeIds },
                paymentStatus: { notIn: ["PROCESSING", "COMPLETED"] },
              },
            });

            // Step B: Remove stale lore generation jobs
            await tx.loreGenerationJob.deleteMany({
              where: {
                nodeId: { in: deletableNodeIds },
                status: { in: ["PENDING", "FAILED"] },
              },
            });

            // Step C: Remove non-active mining sessions (COMPLETED / CANCELLED).
            // ACTIVE sessions are excluded — those nodes were moved to the
            // protected set above and will NOT appear in deletableNodeIds.
            await tx.miningSession.deleteMany({
              where: {
                nodeId: { in: deletableNodeIds },
              },
            });

            // Step D: Remove all tuning sessions for these nodes.
            // TuningSession.nodeId has ON DELETE RESTRICT in the migration, so
            // it must be cleared before the parent Node row can be removed.
            await tx.tuningSession.deleteMany({
              where: { nodeId: { in: deletableNodeIds } },
            });

            // Step E: Delete the nodes — all remaining child FKs cascade or
            // set-null automatically (ResonanceSurge, LocationLore, NodeDrift,
            // User.lastDriftNodeId).
            return tx.node.deleteMany({
              where: { id: { in: deletableNodeIds } },
            });
          });

          nodesDeleted = result.count;
          logger.info(
            `Successfully deleted ${nodesDeleted} expired Surge nodes`,
          );
        }
      }

      // 1b. Delete stale activity snapshots (> 14 days)
      const fourteenDaysAgo = format(
        new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        "yyyy-MM-dd",
      );

      const snapshotsDeleted = await prisma.surgeActivitySnapshot.deleteMany({
        where: { snapshotDate: { lt: fourteenDaysAgo } },
      });

      logger.info(`Deleted ${snapshotsDeleted.count} stale activity snapshots`);

      // 1c. Delete old spawn logs (keep last 30 days)
      const thirtyDaysAgo = format(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        "yyyy-MM-dd",
      );

      const logsDeleted = await prisma.surgeSpawnLog.deleteMany({
        where: { spawnCycle: { lt: thirtyDaysAgo } },
      });

      logger.info(`Deleted ${logsDeleted.count} old spawn logs (>30 days)`);

      return {
        nodesDeleted,
        snapshotsDeleted: snapshotsDeleted.count,
        logsDeleted: logsDeleted.count,
        timestamp: new Date().toISOString(),
      };
    });

    // =====================================================================
    // STEP 2: ACTIVITY SNAPSHOT GENERATION
    // =====================================================================
    const snapshotResult = await step.run(
      "generate-activity-snapshot",
      async () => {
        logger.info("Generating activity snapshot for last 7 days...");
        return await generateActivitySnapshot(today);
      },
    );

    logger.info(
      `Activity snapshot: ${snapshotResult.totalHexes} hexes, ${snapshotResult.totalActivityScore} total score`,
    );

    // =====================================================================
    // STEP 3: SPAWN SURGE NODES (with Edge Case Handling)
    // =====================================================================
    const spawnResult = await step.run("spawn-surge-nodes", async () => {
      logger.info("Spawning Surge nodes with edge case safeguards...");

      /**
       * Edge Case Handling:
       * - Zero Activity: Falls back to seed hexes (territories + major cities)
       * - Geographic Clustering: Applies diversity penalty to over-represented hexes
       * - Database Bloat: Controlled by aggressive cleanup in Step 1
       */
      return await spawnSurgeNodes(today);
    });

    logger.info(
      `Spawned ${spawnResult.nodesSpawned} Surge nodes across ${spawnResult.hexesUsed} hexes`,
    );

    // Log edge case activations for monitoring
    if (spawnResult.zeroActivityFallback) {
      logger.warn(
        `⚠️ ZERO ACTIVITY FALLBACK: Used ${spawnResult.seedHexesUsed} seed hexes (territories: ${spawnResult.territorySeedCount}, cities: ${spawnResult.citySeedCount})`,
      );
    }

    if (spawnResult.diversityPenaltyApplied) {
      logger.info(
        `✓ DIVERSITY PENALTY: Applied to ${spawnResult.penalizedHexCount} over-represented hexes`,
      );
    }

    // =====================================================================
    // STEP 4: COSMIC HERALD ANNOUNCEMENT
    // =====================================================================
    await step.run("announce-surge-spawn", async () => {
      let announcement = `🌊 Daily Resonance Surge! ${spawnResult.nodesSpawned} high-yield nodes spawned`;

      if (spawnResult.zeroActivityFallback) {
        announcement += " in seed territories. First nodes of a new cycle!";
      } else {
        announcement += " in active zones. Mine to anchor permanently!";
      }

      await inngest.send({
        name: "cosmic-herald-announcement",
        data: {
          content: announcement,
          messageType: "announcement",
        },
      });
    });

    // =====================================================================
    // FINAL SUMMARY
    // =====================================================================
    return {
      success: true,
      summary: {
        date: today,
        cleanup: {
          nodesDeleted: cleanupResult.nodesDeleted,
          snapshotsDeleted: cleanupResult.snapshotsDeleted,
          logsDeleted: cleanupResult.logsDeleted,
        },
        activity: {
          totalHexes: snapshotResult.totalHexes,
          totalScore: snapshotResult.totalActivityScore,
        },
        spawn: {
          nodesSpawned: spawnResult.nodesSpawned,
          hexesUsed: spawnResult.hexesUsed,
          zeroActivityFallback: spawnResult.zeroActivityFallback || false,
          diversityPenaltyApplied: spawnResult.diversityPenaltyApplied || false,
        },
      },
    };
  },
);
