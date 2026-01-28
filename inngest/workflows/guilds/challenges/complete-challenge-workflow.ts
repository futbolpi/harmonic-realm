import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/prisma";
import { InngestEventDispatcher } from "@/inngest/dispatcher";
import { awardPrestige } from "@/lib/api-helpers/server/guilds/prestige";
import { generateCompleteChallengeAnnouncement } from "./utils";

/**
 * WORKFLOW: Handle challenge completion and reward distribution
 * Trigger: "guild/challenge.completed" event
 * Behavior: Awards RESONANCE to vault, logs prestige, creates vault transaction, sends notification
 */
export const completeChallengeWorkflow = inngest.createFunction(
  {
    id: "complete-challenge-workflow",
    name: "Complete Guild Challenge & Award Rewards",
  },
  { event: "guild/challenge.completed" },
  async ({ event, step, logger }) => {
    const { progressId, guildId, challengeId } = event.data;

    logger.info("Processing challenge completion", {
      progressId,
      guildId,
      challengeId,
    });

    // Step 1: Fetch progress and challenge details
    const progress = await step.run("fetch-progress", async () => {
      return await prisma.challengeProgress.findUnique({
        where: { id: progressId },
        select: {
          completed: true,
          challenge: {
            select: {
              rewardResonance: true,
              rewardPrestige: true,
              template: { select: { name: true } },
            },
          },
          guild: {
            select: {
              leaderUsername: true,
              vaultBalance: true,
              name: true,
            },
          },
        },
      });
    });

    if (!progress) {
      logger.warn("Challenge progress not found", { progressId });
      return { skipped: true };
    }

    if (progress.completed) {
      logger.info("Challenge already completed", { progressId });
      return { skipped: true };
    }

    // Step 2: Award rewards in transaction
    await step.run("award-rewards", async () => {
      await prisma.$transaction(async (tx) => {
        // Mark as completed
        await tx.challengeProgress.update({
          where: { id: progressId },
          data: {
            completed: true,
            completedAt: new Date(),
          },
          select: { completed: true },
        });

        // Award RESONANCE to vault
        await tx.guild.update({
          where: { id: guildId },
          data: {
            vaultBalance: { increment: progress.challenge.rewardResonance },
          },
          select: { vaultBalance: true },
        });

        // Log vault transaction
        await tx.vaultTransaction.create({
          data: {
            memberUsername: progress.guild.leaderUsername,
            type: "REWARD",
            amount: progress.challenge.rewardResonance,
            balanceBefore: progress.guild.vaultBalance,
            balanceAfter:
              progress.guild.vaultBalance + progress.challenge.rewardResonance,
            reason: "Challenge completed",
            metadata: { challengeId, progressId },
          },
          select: { balanceAfter: true },
        });
      });

      logger.info("Rewards awarded successfully", {
        guildId,
        resonance: progress.challenge.rewardResonance,
        prestige: progress.challenge.rewardPrestige,
      });
    });

    // Award prestige for challenge completion (50-200 points)
    await step.run("award-prestige", async () => {
      await awardPrestige({
        guildId,
        amount: progress.challenge.rewardPrestige || 100,
        source: "CHALLENGE_COMPLETE",
        metadata: { challengeId, progressId },
      });
    });

    try {
      await step.run("send-notification", async () => {
        const message = await generateCompleteChallengeAnnouncement(
          progress.guild.name,
          progress.challenge.template.name,
          progress.challenge.rewardResonance,
          progress.challenge.rewardPrestige,
        );
        await InngestEventDispatcher.sendHeraldAnnouncement(
          message,
          "announcement",
        );
      });
    } catch (e) {
      logger.warn("Failed to send challenge completion announcement", e);
    }

    return {
      success: true,
      guildId,
      rewards: progress.challenge.rewardResonance,
    };
  },
);
