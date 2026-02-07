import { format } from "date-fns";
import prisma from "@/lib/prisma";

import { inngest } from "@/inngest/client";
import { generateActivitySnapshot } from "@/lib/api-helpers/server/resonance-surge/generate-activity-snapshot";
import { spawnSurgeNodes } from "@/lib/api-helpers/server/resonance-surge/spawn-surge-nodes";

export const spawnDailyResonanceSurgesWorkflow = inngest.createFunction(
  {
    id: "spawn-daily-resonance-surges",
    retries: 2,
    concurrency: { limit: 1 }, // Prevent overlapping runs
  },
  { cron: "0 0 * * *" }, // Daily at midnight UTC
  async ({ step, logger }) => {
    const today = format(new Date(), "yyyy-MM-dd");

    // Step 1: Cleanup expired unmined Surge nodes
    const cleanupResult = await step.run("cleanup-expired-surges", async () => {
      // Find expired unstabilized nodes
      const expiredSurges = await prisma.resonanceSurge.findMany({
        where: {
          spawnCycle: { lt: today }, // Older than today
          isStabilized: false, // Not mined
        },
        select: { nodeId: true },
      });

      logger.info(
        `Found ${expiredSurges.length} expired Surge nodes to cleanup`,
      );

      // Delete nodes (cascade deletes ResonanceSurge records)
      if (expiredSurges.length > 0) {
        await prisma.node.deleteMany({
          where: {
            id: { in: expiredSurges.map((s) => s.nodeId) },
          },
        });
      }

      return { deletedCount: expiredSurges.length };
    });

    // Step 2: Generate activity snapshot (7-day window)
    const snapshotResult = await step.run(
      "generate-activity-snapshot",
      async () => {
        return await generateActivitySnapshot(today);
      },
    );

    logger.info(
      `Activity snapshot: ${snapshotResult.totalHexes} hexes, ${snapshotResult.totalActivityScore} total score`,
    );

    // Step 3: Spawn new Surge nodes
    const spawnResult = await step.run("spawn-surge-nodes", async () => {
      return await spawnSurgeNodes(today);
    });

    logger.info(
      `Spawned ${spawnResult.nodesSpawned} Surge nodes across ${spawnResult.hexesUsed} hexes`,
    );

    // Step 4: Send Herald announcement
    await step.run("announce-surge-spawn", async () => {
      await inngest.send({
        name: "cosmic-herald-announcement",
        data: {
          content: `🌊 Daily Resonance Surge! ${spawnResult.nodesSpawned} high-yield nodes spawned in active zones. Mine one to anchor it permanently!`,
          messageType: "announcement",
        },
      });
    });

    return {
      success: true,
      summary: {
        date: today,
        nodesSpawned: spawnResult.nodesSpawned,
        hexesUsed: spawnResult.hexesUsed,
        nodesDeleted: cleanupResult.deletedCount,
        activityScore: snapshotResult.totalActivityScore,
      },
    };
  },
);
