import { inngest } from "@/inngest/client";
import { LoreLevel } from "@/lib/node-lore/location-lore";
import prisma from "@/lib/prisma";

/**
 * WORKFLOW: Batch Process Location Lore Queue
 *
 * Processes queued lore generation requests in batches for efficiency
 */
export const processBatchLoreGeneration = inngest.createFunction(
  {
    id: "process-batch-lore-generation",
    name: "Process Batch Lore Generation",
  },
  {
    cron: "TZ=UTC */5 * * * *", // Every 5 minutes
  },
  async ({ step, logger }) => {
    logger.info("Starting batch lore generation processing");

    // Get pending jobs
    const pendingJobs = await step.run("get-pending-jobs", async () => {
      const jobs = await prisma.loreGenerationJob.findMany({
        where: {
          status: "PENDING",
        },
        orderBy: {
          createdAt: "asc", // FIFO processing
        },
        take: 10, // Process up to 10 jobs per batch
      });

      logger.info(`Found ${jobs.length} pending lore generation jobs`);
      return jobs;
    });

    if (pendingJobs.length === 0) {
      logger.info("No pending jobs to process");
      return { processed: 0 };
    }

    // Process each job
    for (const job of pendingJobs) {
      await step.sendEvent(`process-job-${job.id}`, [
        {
          name: "lore/generation.started",
          data: {
            nodeId: job.nodeId,
            targetLevel: job.targetLevel as LoreLevel,
            jobId: job.id,
          },
        },
      ]);
    }

    logger.info(`Triggered processing for ${pendingJobs.length} jobs`);

    return {
      processed: pendingJobs.length,
    };
  }
);
