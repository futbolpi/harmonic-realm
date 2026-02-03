"use server";

import { revalidatePath } from "next/cache";

import { verifyTokenAndGetUser } from "@/lib/api-helpers/server/users";
import prisma from "@/lib/prisma";
import { ApiResponse } from "@/lib/schema/api";
import {
  calculateChamberCreationCost,
  calculateMaintenanceDueDate,
  canCreateChamber,
  getChamberH3Index,
} from "@/lib/utils/chambers";
import {
  type CreateChamberParams,
  type CreateChamberResponse,
  CreateChamberSchema,
} from "@/lib/schema/echo-chamber";
import { addEchoShards } from "@/lib/api-helpers/server/guilds/artifacts";

/**
 * ACTION: Create Echo Resonance Chamber
 *
 * Requirements:
 * - Max 3 active chambers per user
 * - Min 2km spacing between own chambers
 * - Valid location (anti-spoof check)
 * - Sufficient RESONANCE balance
 *
 * Cost: 200 + (existingCount * 100) RES
 */
export async function createChamber(
  params: CreateChamberParams,
): Promise<ApiResponse<CreateChamberResponse>> {
  try {
    const { success, data } = CreateChamberSchema.safeParse(params);

    if (!success) {
      return { success: false, error: "Invalid Request" };
    }

    const { accessToken, latitude, longitude } = data;

    // 1. Verify user authentication
    const { id: userId, username } = await verifyTokenAndGetUser(accessToken);

    // 3. Fetch user balance and existing chambers
    const [user, existingChambers] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { sharePoints: true },
      }),
      prisma.echoResonanceChamber.findMany({
        where: { userId, isActive: true },
        select: { latitude: true, longitude: true },
      }),
    ]);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // 4. Permission check
    const permission = canCreateChamber({
      existingCount: existingChambers.length,
      userBalance: user.sharePoints,
      proposedLat: latitude,
      proposedLng: longitude,
      existingChambers,
    });

    if (!permission.allowed) {
      return {
        success: false,
        error: permission.reason || "Cannot create chamber",
      };
    }

    // 5. Calculate cost and create chamber
    const cost = calculateChamberCreationCost(existingChambers.length);
    const h3Index = getChamberH3Index(latitude, longitude);
    const now = new Date();
    const maintenanceDueAt = calculateMaintenanceDueDate(now);

    const chamber = await prisma.$transaction(async (tx) => {
      // Deduct RESONANCE
      await tx.user.update({
        where: { id: userId },
        data: { sharePoints: { decrement: cost } },
        select: { id: true },
      });

      // Create chamber
      const newChamber = await tx.echoResonanceChamber.create({
        data: {
          userId,
          latitude,
          longitude,
          h3Index,
          level: 1,
          totalResonanceInvested: cost,
          durability: 100,
          lastMaintenanceAt: now,
          maintenanceDueAt,
        },
        select: {
          id: true,
          level: true,
        },
      });

      // Log upgrade (creation counts as L0→L1)
      await tx.chamberUpgradeLog.create({
        data: {
          chamberId: newChamber.id,
          fromLevel: 0,
          toLevel: 1,
          resonanceCost: cost,
        },
        select: { id: true },
      });

      return newChamber;
    });

    // 6. Award echo shards if user is in a guild
    try {
      const member = await prisma.guildMember.findFirst({
        where: { username, isActive: true },
        select: { guildId: true },
      });

      if (member) {
        await addEchoShards(member.guildId, username, "ANCHORING", {
          referralPointsBurned: 0, // No referral points for chambers
          nodeRarity_anchor: "Common", // Chambers are Common tier
        });
      }
    } catch (e) {
      console.warn("Failed to award echo shards for chamber creation", e);
    }

    // 7. Revalidate relevant paths + mining session revalidation
    revalidatePath(`/${userId}/chambers`);

    return {
      success: true,
      data: {
        chamberId: chamber.id,
        cost,
        level: chamber.level,
        boost: 0.05, // 5% at level 1
      },
    };
  } catch (error) {
    console.error("Error creating chamber:", error);
    return {
      success: false,
      error: "Failed to create chamber",
    };
  }
}
