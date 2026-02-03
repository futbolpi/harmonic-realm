"use server";

import { revalidatePath } from "next/cache";

import { verifyTokenAndGetUser } from "@/lib/api-helpers/server/users";
import prisma from "@/lib/prisma";
import { ApiResponse } from "@/lib/schema/api";
import {
  calculateChamberMaintenanceCost,
  calculateCurrentDurability,
  calculateMaintenanceDueDate,
  canMaintainChamber,
} from "@/lib/utils/chambers";
import {
  type MaintainChamberResponse,
  MaintainChamberSchema,
  type MaintainChamberParams,
} from "@/lib/schema/echo-chamber";
import { addEchoShards } from "@/lib/api-helpers/server/guilds/artifacts";

/**
 * ACTION: Maintain Echo Resonance Chamber (restore durability)
 *
 * Requirements:
 * - Chamber must be owned by user
 * - Chamber must be active
 * - Durability must be below 90%
 * - User must have sufficient RESONANCE
 *
 * Cost: level * 50 RES
 * Effect: Restore durability to 100%, reset maintenance timer
 */
export async function maintainChamber(
  params: MaintainChamberParams,
): Promise<ApiResponse<MaintainChamberResponse>> {
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
          lastMaintenanceAt: true,
          durability: true,
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

    // 4. Calculate current durability (real-time)
    const currentDurability = calculateCurrentDurability(
      chamber.lastMaintenanceAt,
    );

    // 5. Permission check
    const permission = canMaintainChamber({
      level: chamber.level,
      lastMaintenanceAt: chamber.lastMaintenanceAt,
      userBalance: user.sharePoints,
      chamberActive: chamber.isActive,
    });

    if (!permission.allowed) {
      return {
        success: false,
        error: permission.reason || "Cannot maintain chamber",
      };
    }

    // 6. Calculate cost and maintain
    const cost = calculateChamberMaintenanceCost(chamber.level);
    const durabilityRestored = 100 - currentDurability;
    const now = new Date();
    const maintenanceDueAt = calculateMaintenanceDueDate(now);

    await prisma.$transaction(async (tx) => {
      // Deduct RESONANCE
      await tx.user.update({
        where: { id: userId },
        data: { sharePoints: { decrement: cost } },
        select: { id: true },
      });

      // Restore durability
      await tx.echoResonanceChamber.update({
        where: { id: chamberId },
        data: {
          durability: 100,
          lastMaintenanceAt: now,
          maintenanceDueAt,
          totalResonanceInvested: { increment: cost },
        },
        select: { id: true },
      });

      // Log maintenance
      await tx.chamberMaintenanceLog.create({
        data: {
          chamberId,
          resonanceSpent: cost,
          durabilityRestored,
          durabilityBefore: currentDurability,
          durabilityAfter: 100,
        },
        select: { id: true },
      });
    });

    // 7. Award echo shards if user is in a guild (maintenance counts as upkeep)
    try {
      const member = await prisma.guildMember.findFirst({
        where: { username, isActive: true },
        select: { guildId: true },
      });

      if (member) {
        // Small shard reward for maintenance (1-3 shards)
        await addEchoShards(member.guildId, username, "ANCHORING", {
          referralPointsBurned: chamber.level, // Scales with chamber level
          nodeRarity_anchor: "Common",
        });
      }
    } catch (e) {
      console.warn("Failed to award echo shards for chamber maintenance", e);
    }

    // 8. Revalidate relevant paths
    revalidatePath(`/${userId}/chambers`);

    return {
      success: true,
      data: {
        cost,
        durabilityRestored,
        newDurability: 100,
        nextMaintenanceDue: maintenanceDueAt,
      },
    };
  } catch (error) {
    console.error("Error maintaining chamber:", error);
    return {
      success: false,
      error: "Failed to maintain chamber",
    };
  }
}
