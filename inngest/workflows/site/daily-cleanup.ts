import { subDays, subMonths } from "date-fns";

import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";

/**
 * WORKFLOW: Daily DB Cleanup
 * - Runs every day at 00:00 UTC
 * - Deletes old pending payments and stale records to prevent DB bloat
 */
export const dailyCleanUp = inngest.createFunction(
  { id: "daily-cleanup", name: "Daily DB Cleanup", retries: 1 },
  { cron: "TZ=UTC 0 0 * * *" },
  async ({ step, logger }) => {
    logger.info("Starting daily cleanup");

    const sevenDaysAgo = subDays(new Date(), 7);
    const oneMonthAgo = subMonths(new Date(), 1);

    // AwakeningContribution (createdAt older than 7 days, paymentStatus is PENDING)
    const awakeningRes = await step.run("delete-old-awakening-contributions", async () => {
      const res = await prisma.awakeningContribution.deleteMany({
        where: { createdAt: { lt: sevenDaysAgo }, paymentStatus: "PENDING" },
      });
      logger.info("Deleted old AwakeningContributions", { count: res.count });
      return res;
    });

    // LocationLoreStake (createdAt older than 7 days, paymentStatus is PENDING)
    const loreStakeRes = await step.run("delete-old-location-lore-stakes", async () => {
      const res = await prisma.locationLoreStake.deleteMany({
        where: { createdAt: { lt: sevenDaysAgo }, paymentStatus: "PENDING" },
      });
      logger.info("Deleted old LocationLoreStakes", { count: res.count });
      return res;
    });

    // ResonantAnchor (createdAt older than 7 days, paymentStatus is PENDING)
    const anchorRes = await step.run("delete-old-resonant-anchors", async () => {
      const res = await prisma.resonantAnchor.deleteMany({
        where: { createdAt: { lt: sevenDaysAgo }, paymentStatus: "PENDING" },
      });
      logger.info("Deleted old ResonantAnchors", { count: res.count });
      return res;
    });

    // ShareRedemption (createdAt older than 7 days, paymentStatus is PENDING)
    const shareRes = await step.run("delete-old-share-redemptions", async () => {
      const res = await prisma.shareRedemption.deleteMany({
        where: { createdAt: { lt: sevenDaysAgo }, status: "PENDING" },
      });
      logger.info("Deleted old ShareRedemptions", { count: res.count });
      return res;
    });

    // Guild (createdAt older than 7 days, piTransactionId is null)
    // Be cautious: deleting a Guild will cascade to members and related objects
    const guildRes = await step.run("delete-old-guilds", async () => {
      const res = await prisma.guild.deleteMany({
        where: { createdAt: { lt: sevenDaysAgo }, piTransactionId: null },
      });
      logger.info("Deleted old Guilds with no payment", { count: res.count });
      return res;
    });

    // TuningSession (older than a month)
    const tuningRes = await step.run("delete-old-tuning-sessions", async () => {
      const res = await prisma.tuningSession.deleteMany({
        where: { timestamp: { lt: oneMonthAgo } },
      });
      logger.info("Deleted old TuningSessions", { count: res.count });
      return res;
    });

    return {
      message: "Daily cleanup completed",
      summary: {
        awakeningCount: awakeningRes.count,
        loreStakeCount: loreStakeRes.count,
        anchorCount: anchorRes.count,
        shareRedemptionsCount: shareRes.count,
        guildCount: guildRes.count,
        tuningSessionsCount: tuningRes.count,
      },
    };
  }
);
