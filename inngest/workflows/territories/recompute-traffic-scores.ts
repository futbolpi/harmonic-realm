import { subDays } from "date-fns";

import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";

/**
 * WORKFLOW: Recompute territory traffic scores daily
 * Cron: daily at 03:00 UTC
 * Logic: for each territory, calculate avg daily unique miners over last 7 days
 */
export const recomputeTrafficScores = inngest.createFunction(
  {
    id: "recompute-traffic-scores",
    name: "Recompute Territory Traffic Scores",
  },
  {
    cron: "TZ=UTC 0 3 * * *", // daily 03:00 UTC
  },
  async ({ step, logger }) => {
    logger.info("Recomputing territory traffic scores");

    const since = subDays(new Date(), 7);

    const territories = await step.run("fetch-territories", async () => {
      return await prisma.territory.findMany({
        select: { id: true, hexId: true },
      });
    });

    for (const t of territories) {
      await step.run(`compute-${t.id}`, async () => {
        // Count unique users who had mining sessions in the last 7 days at nodes in this hex
        const uniqueUsers = await prisma.miningSession.findMany({
          where: {
            createdAt: { gte: since },
            node: { territoryHexId: t.hexId },
            status: "COMPLETED",
          },
          select: { userId: true },
        });

        const uniqueSet = new Set(uniqueUsers.map((s) => s.userId));
        const avgDaily = uniqueSet.size / 7;

        await prisma.territory.update({
          where: { id: t.id },
          data: { trafficScore: Math.max(0, Math.round(avgDaily)) },
          select: { trafficScore: true },
        });

        logger.info(
          `Updated territory ${t.hexId} (${t.id}) trafficScore=${Math.round(
            avgDaily
          )}`
        );
      });
    }

    return { territoriesProcessed: territories.length };
  }
);
