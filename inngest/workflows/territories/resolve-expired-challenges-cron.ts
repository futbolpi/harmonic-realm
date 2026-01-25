import { addDays } from "date-fns";

import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";
import { TERRITORY_CONTROL_DAYS } from "@/config/guilds/constants";
import { resolveTerritoryChallenge } from "./utils";
import { InngestEventDispatcher } from "@/inngest/dispatcher";
import { updateChallengeProgress } from "@/lib/api-helpers/server/guilds/challenges";
import { awardPrestige } from "@/lib/api-helpers/server/guilds/prestige";

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
      const result = await step.run(`resolve-${ch.id}`, async () => {
        // Run shared resolution logic inside a transaction
        const winner = await prisma.$transaction(
          async (tx) => {
            return resolveTerritoryChallenge(tx, ch);
          },
          { timeout: 50000 }
        );

        return { success: true, winner };
      });

      // award challenge / prestige points
      if (!!result.winner.leaderUsername) {
        await step.run(
          `award-challenge-points-${result.winner.winnerId}`,
          async () => {
            if (result.winner.leaderUsername) {
              await updateChallengeProgress({
                guildId: result.winner.winnerId,
                username: result.winner.leaderUsername,
                updates: {
                  territoriesCaptured: 1, // +1 to TERRITORY_CAPTURED challenges
                },
              });
            }
          }
        );

        await step.run(
          `award-prestige-points-${result.winner.winnerId}`,
          async () => {
            return awardPrestige({
              guildId: result.winner.winnerId,
              amount: 100,
              metadata: { amount: 100 },
              source: "TERRITORY_VICTORY",
            });
          }
        );
      }

      await step.run("announce-results", async () => {
        InngestEventDispatcher.sendHeraldAnnouncement(
          `Territory challenge ${ch.id} resolved: winner ${result.winner.winnerName} (+${result.winner.reward} RES)`,
          "announcement"
        );
      });

      const controlEndsAt = addDays(
        new Date(),
        TERRITORY_CONTROL_DAYS
      ).toISOString();

      await step.sendEvent(`send-territory-claimed-event-${ch.territoryId}`, {
        name: "territory/claimed",
        data: { controlEndsAt, territoryId: ch.territoryId },
      });

      logger.info(
        `Resolved expired challenge ${ch.id}, winner ${result.winner.winnerId}`
      );
    }

    return { processed: expired.length };
  }
);
