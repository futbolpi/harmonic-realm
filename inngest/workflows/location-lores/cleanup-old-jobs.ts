import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";
import { subDays } from "date-fns";

/**
 * WORKFLOW: Clean Up Old Job Records
 *
 * Removes old job records to maintain database performance
 */
export const cleanupOldJobs = inngest.createFunction(
  {
    id: "cleanup-old-lore-jobs",
    name: "Clean Up Old Lore Generation Jobs",
  },
  {
    cron: "TZ=UTC 0 2 * * *", // Daily at 2 AM UTC
  },
  async ({ step, logger }) => {
    logger.info("Starting cleanup of old lore generation jobs");

    const cleanupResult = await step.run("cleanup-jobs", async () => {
      const cutoffDate = subDays(new Date(), 30); // Keep 30 days of history

      const deletedJobs = await prisma.loreGenerationJob.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
          status: {
            in: ["COMPLETED", "FAILED"],
          },
        },
      });

      return deletedJobs.count;
    });

    logger.info(`Cleanup completed: ${cleanupResult} old jobs removed`);

    return {
      deletedJobs: cleanupResult,
    };
  }
);
