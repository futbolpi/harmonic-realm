import { addDays } from "date-fns";

import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";
import { TERRITORY_CONTROL_DAYS } from "@/config/guilds/constants";
import { InngestEventDispatcher } from "@/inngest/dispatcher";
import { resolveTerritoryChallenge } from "./utils";
import { updateChallengeProgress } from "@/lib/api-helpers/server/guilds/challenges";
import { awardPrestige } from "@/lib/api-helpers/server/guilds/prestige";

/**
 * WORKFLOW: Resolve a territory challenge after its scheduled end time
 * Trigger: "territory/challenge.started" (sent when a challenge is created)
 * Behavior: calculates wait time (endsAt - now), sleeps until then, then resolves the challenge.
 * Robustness: verifies challenge still unresolved and uses a transaction to apply stake transfers / burns.
 */
export const resolveChallengeOnStart = inngest.createFunction(
  {
    id: "territory-challenge-resolve-on-start",
    name: "Resolve Territory Challenge (scheduled by start)",
  },
  {
    event: "territory/challenge.started",
  },
  async ({ event, step, logger }) => {
    const { challengeId, endsAt } = event.data;

    logger.info("Challenge scheduled for resolution", { challengeId, endsAt });

    // Calculate sleep duration. If endsAt provided use it, otherwise fetch end time from DB.
    const challenge = await step.run("fetch-challenge", async () => {
      return await prisma.territoryChallenge.findUnique({
        where: { id: challengeId },
        select: { id: true, endsAt: true, resolved: true },
      });
    });

    if (!challenge) {
      logger.warn("Challenge not found, aborting", { challengeId });
      return { skipped: true };
    }

    if (challenge.resolved) {
      logger.info("Challenge already resolved, skipping", { challengeId });
      return { skipped: true };
    }

    const target = endsAt ? new Date(endsAt) : challenge.endsAt;
    if (!target) {
      logger.warn("No endsAt available, skipping resolution for", {
        challengeId,
      });
      return { skipped: true };
    }

    // Ensure target is a Date instance
    const targetDate = typeof target === "string" ? new Date(target) : target;

    // Sleep until scheduled resolution
    await step.sleepUntil("wait-until-ends", targetDate);

    // get challenge
    const ch = await step.run("get-latest-challenge-scores", async () => {
      return prisma.territoryChallenge.findUnique({
        where: { id: challengeId },
        select: {
          id: true,
          resolved: true,
          attackerScore: true,
          defenderScore: true,
          attackerId: true,
          defenderId: true,
          attackerStake: true,
          defenderStake: true,
          territoryId: true,
        },
      });
    });

    if (!ch) {
      logger.info("Challenge doesnt exist, skipping", { challengeId });
      return { skipped: true };
    }

    if (ch.resolved) {
      logger.info("Challenge already resolved, skipping", { challengeId });
      return { skipped: true };
    }

    // Final safety check and resolution in a transaction
    const result = await step.run("resolve-and-apply", async () => {
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
      await step.run("award-challenge-points", async () => {
        if (result.winner.leaderUsername) {
          await updateChallengeProgress({
            guildId: result.winner.winnerId,
            username: result.winner.leaderUsername,
            updates: {
              territoriesCaptured: 1, // +1 to TERRITORY_CAPTURED challenges
            },
          });
        }
      });

      await step.run("award-prestige-points", async () => {
        return awardPrestige({
          guildId: result.winner.winnerId,
          amount: 100,
          metadata: { amount: 100 },
          source: "TERRITORY_VICTORY",
        });
      });
    }

    // Emit territory.claimed event so expiry scheduler can be set
    try {
      await step.run("emit-territory-claimed", async () => {
        const controlEndsAt = addDays(
          new Date(),
          TERRITORY_CONTROL_DAYS
        ).toISOString();
        InngestEventDispatcher.territoryClaimed(ch.territoryId, controlEndsAt);
      });
    } catch (e) {
      logger.warn("Failed to emit territory.claimed event", e);
    }

    // Announce results (best-effort)
    try {
      if (!("skipped" in result) && result?.winner) {
        await step.run("announce-results", async () => {
          InngestEventDispatcher.sendHeraldAnnouncement(
            `Territory challenge ${challengeId} resolved: winner ${result.winner.winnerName} (+${result.winner.reward} RES)`,
            "announcement"
          );
        });
      }
    } catch (e) {
      logger.warn("Failed to send herald announcement", e);
    }

    return result;
  }
);
