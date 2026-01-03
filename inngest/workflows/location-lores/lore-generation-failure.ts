import { Decimal } from "@prisma/client/runtime/client";

import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";

/**
 * WORKFLOW: Handle Lore Generation Failures
 *
 * Processes failed lore generation attempts with intelligent retry logic
 */
export const handleLoreGenerationFailure = inngest.createFunction(
  {
    id: "handle-lore-generation-failure",
    name: "Handle Lore Generation Failure",
  },
  {
    event: "lore/generation.failed",
  },
  async ({ event, step, logger }) => {
    const {
      nodeId,
      targetLevel,
      userId,
      jobId,
      error,
      retryCount = 0,
    } = event.data;

    logger.error("Handling lore generation failure", {
      nodeId,
      error,
      retryCount,
    });

    // Update job with error
    await step.run("update-job-with-error", async () => {
      await prisma.loreGenerationJob.update({
        where: { id: jobId },
        data: {
          status: "FAILED",
          error: error.message || "Unknown error",
          retryCount: retryCount + 1,
          completedAt: new Date(),
        },
      });
    });

    // Intelligent retry logic
    const shouldRetry = await step.run("determine-retry", async () => {
      const maxRetries = 3;

      if (retryCount >= maxRetries) {
        logger.info("Max retries exceeded, not retrying");
        return false;
      }

      // Don't retry certain error types
      const nonRetryableErrors = [
        "INVALID_LEVEL",
        "INSUFFICIENT_PAYMENT",
        "CONTENT_POLICY_VIOLATION",
      ];

      if (
        nonRetryableErrors.some((errorType) =>
          error.message?.includes(errorType)
        )
      ) {
        logger.info("Non-retryable error, not retrying", {
          errorType: error.message,
        });
        return false;
      }

      return true;
    });

    if (shouldRetry) {
      // Wait before retry with exponential backoff
      await step.sleep(
        "retry-delay",
        `${Math.min(300 * Math.pow(2, retryCount), 3600)}s`
      );

      // Trigger retry
      await step.sendEvent("trigger-retry", [
        {
          name: "lore/generation.started",
          data: {
            nodeId,
            targetLevel,
            userId,
            jobId, // Use same job ID for tracking
          },
        },
      ]);

      logger.info("Scheduled retry for lore generation", {
        retryCount: retryCount + 1,
        delay: Math.min(300 * Math.pow(2, retryCount), 3600),
      });
    } else {
      // Update location lore status to failed
      await step.run("mark-lore-as-failed", async () => {
        await prisma.locationLore.upsert({
          where: { nodeId },
          create: {
            nodeId,
            generationStatus: "FAILED",
            generationError: error.message,
            currentLevel: 0,
            totalPiStaked: new Decimal(0),
          },
          update: {
            generationStatus: "FAILED",
            generationError: error.message,
          },
        });
      });

      // Notify user of permanent failure
      await step.sendEvent("send-failure-notification", [
        {
          name: "lore/generation.permanently-failed",
          data: {
            nodeId,
            targetLevel,
            userId,
            jobId,
            error: error.message,
            retryCount,
          },
        },
      ]);
    }

    return {
      nodeId,
      retried: shouldRetry,
      retryCount: retryCount + 1,
    };
  }
);
