import { subHours } from "date-fns";

import { inngest } from "@/inngest/client";
import { aiLoreGenerator } from "@/lib/node-lore/ai-lore-generator";
import { locationIQ } from "@/lib/node-lore/locationiq";
import prisma from "@/lib/prisma";

/**
 * WORKFLOW: Health Check for Lore Generation System
 *
 * Monitors system health and alerts on issues
 */
export const loreGenerationHealthCheck = inngest.createFunction(
  {
    id: "lore-generation-health-check",
    name: "Lore Generation Health Check",
  },
  {
    cron: "TZ=UTC */15 * * * *", // change to every 3 hours
  },
  async ({ step, logger }) => {
    logger.info("Running lore generation health check");

    // Check AI service health
    const aiHealth = await step.run("check-ai-health", async () => {
      return await aiLoreGenerator.getHealthStatus();
    });

    // Check LocationIQ service
    const locationHealth = await step.run("check-location-health", async () => {
      try {
        await locationIQ.reverseGeocode(40.7128, -74.006, {
          retries: 1,
          timeout: 5000,
          useCache: true,
        });
        return { status: "healthy", error: null };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Location IQ error";
        return { status: "unhealthy", error: errorMessage };
      }
    });

    // Check job queue health
    const queueHealth = await step.run("check-queue-health", async () => {
      const stats = await prisma.loreGenerationJob.groupBy({
        by: ["status"],
        _count: {
          status: true,
        },
        where: {
          createdAt: {
            gte: subHours(Date.now(), 24), // Last 24 hours
          },
        },
      });

      const failedCount =
        stats.find((s) => s.status === "FAILED")?._count.status || 0;
      const totalCount = stats.reduce((sum, s) => sum + s._count.status, 0);
      const failureRate = totalCount > 0 ? failedCount / totalCount : 0;

      return {
        status:
          failureRate > 0.2
            ? "unhealthy"
            : failureRate > 0.1
            ? "degraded"
            : "healthy",
        failureRate,
        totalJobs: totalCount,
        failedJobs: failedCount,
      };
    });

    // Overall health determination
    const overallHealth = await step.run(
      "determine-overall-health",
      async () => {
        const services = [
          aiHealth.status,
          locationHealth.status,
          queueHealth.status,
        ];
        const unhealthyCount = services.filter((s) => s === "unhealthy").length;
        const degradedCount = services.filter((s) => s === "degraded").length;

        let status = "healthy";
        if (unhealthyCount > 0) {
          status = "unhealthy";
        } else if (degradedCount > 0) {
          status = "degraded";
        }

        return {
          status,
          aiHealth,
          locationHealth,
          queueHealth,
        };
      }
    );

    logger.info("Health check completed", {
      status: overallHealth.status,
      details: overallHealth,
    });

    // Send alert if system is unhealthy
    if (overallHealth.status === "unhealthy") {
      await step.sendEvent("send-health-alert", [
        {
          name: "system/health.alert",
          data: {
            component: "lore-generation",
            status: overallHealth.status,
            details: overallHealth,
            timestamp: new Date().toISOString(),
          },
        },
      ]);
    }

    return overallHealth;
  }
);
