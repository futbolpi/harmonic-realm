"use server";

import { revalidatePath } from "next/cache";

import { verifyTokenAndGetUser } from "@/lib/api-helpers/server/users";
import prisma from "@/lib/prisma";
import type { ApiResponse } from "@/lib/schema/api";
import {
  AcceptChallengeSchema,
  type AcceptChallengeParams,
} from "@/lib/schema/guild/challenges";

/**
 * ACTION: Guild leader/officer accepts a challenge
 * Validates vault level, active members, and creates challenge progress tracker
 */
export async function acceptChallenge(
  params: AcceptChallengeParams,
): Promise<ApiResponse<{ progressId: string }>> {
  try {
    const { success, data } = AcceptChallengeSchema.safeParse(params);

    if (!success) {
      return { success: false, error: "Invalid Request" };
    }

    const { accessToken, guildId, challengeId } = data;

    // Verify user authentication
    const { username } = await verifyTokenAndGetUser(accessToken);

    // Verify guild leadership
    const member = await prisma.guildMember.findFirst({
      where: {
        username,
        guildId,
        role: { in: ["LEADER", "OFFICER"] },
        isActive: true,
      },
      select: {
        guild: { select: { vaultLevel: true } },
        guildId: true,
      },
    });

    if (!member) {
      return { success: false, error: "Must be guild leader or officer" };
    }

    // Get challenge with template
    const challenge = await prisma.guildChallenge.findUnique({
      where: { id: challengeId },
      select: {
        template: {
          select: { minMembers: true, targetValue: true, minVaultLevel: true },
        },
        endDate: true,
      },
    });

    if (!challenge) {
      return { success: false, error: "Challenge not found" };
    }

    // Check if challenge is still active
    if (challenge.endDate < new Date()) {
      return { success: false, error: "Challenge is not active" };
    }

    // Validate vault level
    if (member.guild.vaultLevel < challenge.template.minVaultLevel) {
      return {
        success: false,
        error: `Minimum vault level: ${challenge.template.minVaultLevel}`,
      };
    }

    // Validate active member count
    const activeMemberCount = await prisma.guildMember.count({
      where: {
        guildId,
        isActive: true,
      },
    });

    if (activeMemberCount < challenge.template.minMembers) {
      return {
        success: false,
        error: `Need ${challenge.template.minMembers} active members`,
      };
    }

    // Check if guild already accepted this challenge
    const existingProgress = await prisma.challengeProgress.findUnique({
      where: {
        challengeId_guildId: {
          challengeId,
          guildId,
        },
      },
      select: { id: true },
    });

    if (existingProgress) {
      return {
        success: true,
        data: { progressId: existingProgress.id },
      };
    }

    // Create progress tracker
    const progress = await prisma.challengeProgress.create({
      data: {
        challengeId,
        guildId,
        currentValue: 0,
        targetValue: challenge.template.targetValue,
      },
      select: { id: true },
    });

    revalidatePath(`/guilds/${guildId}`);
    revalidatePath(`/guilds/${guildId}/challenges`);

    return {
      success: true,
      data: { progressId: progress.id },
    };
  } catch (error) {
    console.error("Error accepting challenge:", error);
    return {
      success: false,
      error: "Failed to accept challenge",
    };
  }
}
