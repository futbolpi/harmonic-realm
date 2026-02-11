import { revalidatePath } from "next/cache";

import {
  UpdateChallengeProgressSchema,
  type UpdateChallengeProgressParams,
} from "@/lib/schema/guild/challenges";
import prisma from "@/lib/prisma";
import { InngestEventDispatcher } from "@/inngest/dispatcher";
import { ChallengeGoalType } from "@/lib/generated/prisma/enums";

/**
 * ACTION: Update challenge progress for all active guild challenges
 * Called from mining, tuning, vault, and territory challenge actions
 * Supports all ChallengeGoalType variants with flexible contribution tracking
 *
 * Integration Pattern:
 * - Call this after any action that contributes to challenge goals
 * - Pass the relevant updates object based on the action type
 * - Failures are silent (best-effort) to avoid interrupting main workflows
 */
export async function updateChallengeProgress(
  params: UpdateChallengeProgressParams,
): Promise<void> {
  try {
    const { success, data } = UpdateChallengeProgressSchema.safeParse(params);

    if (!success) {
      console.warn("[updateChallengeProgress] Invalid params");
      return;
    }

    const { guildId, updates, username } = data;

    // Efficient single query: fetch all active challenges for this guild
    // Indexed on (guildId, completed) for fast filtering
    const activeProgress = await prisma.challengeProgress.findMany({
      where: {
        guildId,
        completed: false,
        challenge: {
          endDate: { gt: new Date() },
        },
      },
      select: {
        id: true,
        currentValue: true,
        targetValue: true,
        contributions: true,
        challengeId: true,
        completed: true,
        challenge: {
          select: {
            template: { select: { goalType: true } },
          },
        },
      },
    });

    if (activeProgress.length === 0) {
      return;
    }

    // Process each active challenge with goal-specific logic
    for (const progress of activeProgress) {
      const template = progress.challenge.template;
      let increment = 0;

      switch (template.goalType) {
        // TOTAL_SHAREPOINTS: cumulative sharePoints from any activity
        case ChallengeGoalType.TOTAL_SHAREPOINTS:
          increment = updates.sharePoints;
          break;

        // UNIQUE_NODES_MINED: count of distinct nodes mined
        // Tracked per-member to avoid double-counting same node
        case ChallengeGoalType.UNIQUE_NODES_MINED:
          increment = updates.nodesMined;
          break;

        // PERFECT_TUNES: count of perfect tuning sessions (100 accuracy)
        case ChallengeGoalType.PERFECT_TUNES:
          increment = updates.perfectTunes;
          break;

        // TERRITORY_CAPTURED: count of territory challenge wins
        // Incremented when guild wins a territory challenge
        case ChallengeGoalType.TERRITORY_CAPTURED:
          increment = updates.territoriesCaptured;
          break;

        // VAULT_CONTRIBUTIONS: cumulative RESONANCE deposited to guild vault
        // Tracked separately from sharePoints for distinction
        case ChallengeGoalType.VAULT_CONTRIBUTIONS:
          increment = updates.vaultContribution;
          break;

        // MEMBER_STREAKS: count of members with 5+ day activity streaks
        // Called once per eligible member, incremented by 1
        case ChallengeGoalType.MEMBER_STREAKS:
          increment = updates.memberStreaksAdded;
          break;

        default:
          console.warn(
            `[updateChallengeProgress] Unknown goal type: ${template.goalType}`,
          );
          break;
      }

      if (increment === 0) continue;

      // Update contributions JSON with member-level tracking
      // Allows guild leaders to see who contributed what
      const currentContributions = progress.contributions || {};
      const newContributions = {
        ...currentContributions,
        [username]: (currentContributions[username] || 0) + increment,
      };

      const updatedProgress = await prisma.challengeProgress.update({
        where: { id: progress.id },
        data: {
          currentValue: progress.currentValue + increment,
          contributions: newContributions,
        },
        select: { id: true, currentValue: true, targetValue: true },
      });

      revalidatePath(`/guilds/${guildId}`);
      revalidatePath(`/guilds/${guildId}/challenges`);

      // Check if challenge is now complete (reached target)
      if (
        updatedProgress.currentValue >= updatedProgress.targetValue &&
        !progress.completed
      ) {
        await InngestEventDispatcher.completeChallengeForGuild(
          progress.id,
          guildId,
          progress.challengeId,
        );
      }
    }
  } catch (error) {
    console.warn("[updateChallengeProgress] Error:", error);
    // Silently fail - challenges are optional progression layer
  }
}
