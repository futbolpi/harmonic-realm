import { format } from "date-fns";
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
    // STEP 1: AGGRESSIVE CLEANUP (Enhanced)
    // =====================================================================
    const cleanupResult = await step.run("aggressive-cleanup", async () => {
      logger.info("Starting aggressive cleanup of expired Surge data...");

      // 1a. Find expired unstabilized Surge nodes eligible for deletion
      // A node is eligible if it has NO stakes in PROCESSING or COMPLETED status
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

        // Identify nodes that have active (PROCESSING/COMPLETED) lore stakes — must be preserved
        const protectedNodes = await prisma.locationLoreStake.findMany({
          where: {
            nodeId: { in: candidateNodeIds },
            paymentStatus: { in: ["PROCESSING", "COMPLETED"] },
          },
          select: { nodeId: true },
        });

        const protectedNodeIds = new Set(protectedNodes.map((s) => s.nodeId));
        const deletableNodeIds = candidateNodeIds.filter(
          (id) => !protectedNodeIds.has(id),
        );

        logger.info(
          `Deletable nodes: ${deletableNodeIds.length} (protected: ${protectedNodeIds.size})`,
        );

        if (deletableNodeIds.length > 0) {
          // FIX: Explicitly delete PENDING/FAILED lore stakes BEFORE deleting nodes.
          // The location_lore_stakes FK (ON DELETE RESTRICT → location_lore.nodeId)
          // blocks the Node → LocationLore cascade even for non-active stakes.
          await prisma.locationLoreStake.deleteMany({
            where: {
              nodeId: { in: deletableNodeIds },
              paymentStatus: { notIn: ["PROCESSING", "COMPLETED"] },
            },
          });

          // Also clean up any pending lore generation jobs for these nodes
          await prisma.loreGenerationJob.deleteMany({
            where: {
              nodeId: { in: deletableNodeIds },
              status: { in: ["PENDING", "FAILED"] },
            },
          });

          // Now safe to delete nodes — LocationLore cascades cleanly
          const result = await prisma.node.deleteMany({
            where: { id: { in: deletableNodeIds } },
          });

          nodesDeleted = result.count;
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
      // Customize announcement based on edge cases
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
        // Cleanup stats
        cleanup: {
          nodesDeleted: cleanupResult.nodesDeleted,
          snapshotsDeleted: cleanupResult.snapshotsDeleted,
          logsDeleted: cleanupResult.logsDeleted,
        },
        // Activity stats
        activity: {
          totalHexes: snapshotResult.totalHexes,
          totalScore: snapshotResult.totalActivityScore,
        },
        // Spawn stats
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
