import { addDays } from "date-fns";

import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";
import { TERRITORY_CONTROL_DAYS } from "@/config/guilds/constants";
import { resolveTerritoryChallenge } from "./utils";
import { InngestEventDispatcher } from "@/inngest/dispatcher";

/**
 * WORKFLOW: Resolve any expired challenges (safety net)
 * Cron: runs hourly to catch any unresolved challenges that have passed their endsAt
 */
export const resolveExpiredChallengesCron = inngest.createFunction(
  {
    id: "resolve-expired-challenges-cron",
    name: "Resolve Expired Territory Challenges (hourly safety)",
  },
  {
    cron: "TZ=UTC 0 * * * *", // every hour at minute 0 UTC
  },
  async ({ step, logger }) => {
    logger.info("Finding expired unresolved challenges");

    const expired = await step.run("fetch-expired", async () => {
      return await prisma.territoryChallenge.findMany({
        where: {
          endsAt: { lt: new Date() },
          resolved: false,
        },
        include: { territory: true },
      });
    });

    logger.info(`Found ${expired.length} expired challenges`);

    for (const ch of expired) {
      await step.run(`resolve-${ch.id}`, async () => {
        // Use the same resolution logic as the scheduled resolver
        // Run shared resolution logic inside a transaction
        const winner = await prisma.$transaction(async (tx) => {
          return await resolveTerritoryChallenge(tx, ch);
        });

        // Notify via herald (or dedicated guild notifications in future)
        try {
          await step.run("announce-results", async () => {
            await InngestEventDispatcher.sendHeraldAnnouncement(
              `Territory challenge ${ch.id} resolved: winner ${winner.winnerName} (+${winner.reward} RES)`,
              "announcement"
            );
          });
        } catch (e) {
          logger.warn("Failed to send herald announcement", e);
        }

        // Emit territory claimed event so expiry scheduler can be set
        try {
          const controlEndsAt = addDays(
            new Date(),
            TERRITORY_CONTROL_DAYS
          ).toISOString();

          await InngestEventDispatcher.territoryClaimed(
            ch.territoryId,
            controlEndsAt
          );
        } catch (e) {
          logger.warn("Failed to emit territory.claimed event", e);
        }

        logger.info(
          `Resolved expired challenge ${ch.id}, winner ${winner.winnerId}`
        );
      });
    }

    return { processed: expired.length };
  }
);
