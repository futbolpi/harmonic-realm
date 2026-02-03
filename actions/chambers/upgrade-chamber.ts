"use server";

import { revalidatePath } from "next/cache";

import { verifyTokenAndGetUser } from "@/lib/api-helpers/server/users";
import prisma from "@/lib/prisma";
import { ApiResponse } from "@/lib/schema/api";
import {
  calculateChamberBoost,
  calculateChamberUpgradeCost,
  canUpgradeChamber,
} from "@/lib/utils/chambers";
import {
  type UpgradeChamberResponse,
  type MaintainChamberParams,
  MaintainChamberSchema,
} from "@/lib/schema/echo-chamber";
import { addEchoShards } from "@/lib/api-helpers/server/guilds/artifacts";

/**
 * ACTION: Upgrade Echo Resonance Chamber
 *
 * Requirements:
 * - Chamber must be owned by user
 * - Chamber must be active
 * - Chamber must be below max level (10)
 * - User must have sufficient RESONANCE
 *
 * Cost: currentLevel * 300 RES
 * Boost: 5% + (newLevel - 1) * 5%
 */
export async function upgradeChamber(
  params: MaintainChamberParams,
): Promise<ApiResponse<UpgradeChamberResponse>> {
  try {
    const { success, data } = MaintainChamberSchema.safeParse(params);

    if (!success) {
      return { success: false, error: "Invalid Request" };
    }

    const { accessToken, chamberId } = data;

    // 1. Verify user authentication
    const { id: userId, username } = await verifyTokenAndGetUser(accessToken);

    // 2. Fetch chamber and user balance
    const [chamber, user] = await Promise.all([
      prisma.echoResonanceChamber.findUnique({
        where: { id: chamberId },
        select: {
          userId: true,
          level: true,
          isActive: true,
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { sharePoints: true },
      }),
    ]);

    // 3. Validation
    if (!chamber) {
      return { success: false, error: "Chamber not found" };
    }

    if (chamber.userId !== userId) {
      return { success: false, error: "Access denied" };
    }

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // 4. Permission check
    const permission = canUpgradeChamber({
      currentLevel: chamber.level,
      userBalance: user.sharePoints,
      chamberActive: chamber.isActive,
    });

    if (!permission.allowed) {
      return {
        success: false,
        error: permission.reason || "Cannot upgrade chamber",
      };
    }

    // 5. Calculate cost and upgrade
    const cost = calculateChamberUpgradeCost(chamber.level);
    const newLevel = chamber.level + 1;
    const newBoost = calculateChamberBoost(newLevel);

    await prisma.$transaction(async (tx) => {
      // Deduct RESONANCE
      await tx.user.update({
        where: { id: userId },
        data: { sharePoints: { decrement: cost } },
        select: { id: true },
      });

      // Upgrade chamber
      await tx.echoResonanceChamber.update({
        where: { id: chamberId },
        data: {
          level: newLevel,
          totalResonanceInvested: { increment: cost },
        },
        select: { id: true },
      });

      // Log upgrade
      await tx.chamberUpgradeLog.create({
        data: {
          chamberId,
          fromLevel: chamber.level,
          toLevel: newLevel,
          resonanceCost: cost,
        },
        select: { id: true },
      });
    });

    // 6. Award echo shards if user is in a guild (chamber upgrades count as progression)
    try {
      const member = await prisma.guildMember.findFirst({
        where: { username, isActive: true },
        select: { guildId: true },
      });

      if (member) {
        // Small shard reward for upgrading (2-5 shards depending on level)
        await addEchoShards(member.guildId, username, "ANCHORING", {
          referralPointsBurned: newLevel * 2, // Scales with level
          nodeRarity_anchor: "Common",
        });
      }
    } catch (e) {
      console.warn("Failed to award echo shards for chamber upgrade", e);
    }

    // 7. Revalidate relevant paths
    revalidatePath(`/${userId}/chambers`);

    return {
      success: true,
      data: {
        newLevel,
        newBoost,
        cost,
      },
    };
  } catch (error) {
    console.error("Error upgrading chamber:", error);
    return {
      success: false,
      error: "Failed to upgrade chamber",
    };
  }
}
