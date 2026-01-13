import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";

/**
 * WORKFLOW: Expire territory control either when a territory.claimed event schedules the wait
 * or as a daily cron safety net.
 */
export const territoryClaimedScheduler = inngest.createFunction(
  {
    id: "territory-claimed-scheduler",
    name: "Territory Claimed Scheduler (schedules expiry)",
  },
  {
    event: "territory/claimed",
  },
  async ({ event, step, logger }) => {
    const { territoryId, controlEndsAt } = event.data;

    logger.info("Scheduling territory expiry", { territoryId, controlEndsAt });

    const target = new Date(controlEndsAt);

    await step.sleepUntil("wait-until-expiry", target);

    await step.run("expire-check", async () => {
      const t = await prisma.territory.findUnique({
        where: { id: territoryId },
        select: { controlEndsAt: true, hexId: true },
      });
      if (!t) return { skipped: true };
      if (!t.controlEndsAt || t.controlEndsAt > new Date()) return { skipped: true };

      // Expire territory and clear node assignments atomically
      await prisma.$transaction(async (tx) => {
        await tx.territory.update({
          where: { id: territoryId },
          data: {
            guildId: null,
            currentStake: 0,
            controlledAt: null,
            controlEndsAt: null,
          },
        });

        if (t.hexId) {
          await tx.node.updateMany({ where: { territoryHexId: t.hexId }, data: { territoryHexId: null } });
        }
      });

      logger.info(`Territory ${territoryId} expired and control cleared`);
      return { expired: territoryId };
    });

    return { scheduled: territoryId };
  }
);

export const expireTerritoriesCron = inngest.createFunction(
  {
    id: "expire-territories-cron",
    name: "Expire Territories (daily safety net)",
  },
  {
    cron: "TZ=UTC 0 4 * * *",
  },
  async ({ step, logger }) => {
    logger.info("Running daily territory expiry sweep");

    const expired = await step.run("find-expired", async () => {
      // Find expired territories to get their hexIds so we can clear node assignments
      const territories = await prisma.territory.findMany({
        where: { controlEndsAt: { lt: new Date() }, guildId: { not: null } },
        select: { id: true, hexId: true },
      });

      if (territories.length === 0) return { count: 0 };

      const hexIds = territories.map((t) => t.hexId).filter(Boolean) as string[];

      await prisma.$transaction(async (tx) => {
        // Expire territories
        await tx.territory.updateMany({
          where: { id: { in: territories.map((t) => t.id) } },
          data: { guildId: null, currentStake: 0, controlledAt: null, controlEndsAt: null },
        });

        // Clear territory assignment from nodes
        if (hexIds.length > 0) {
          await tx.node.updateMany({ where: { territoryHexId: { in: hexIds } }, data: { territoryHexId: null } });
        }
      });

      return { count: territories.length };
    });

    return { expiredCount: expired.count };
  }
);
