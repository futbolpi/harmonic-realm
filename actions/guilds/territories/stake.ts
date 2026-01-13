"use server";

import { cellToLatLng } from "h3-js";
import { addDays } from "date-fns";
import { revalidatePath } from "next/cache";

import { verifyTokenAndGetUser } from "@/lib/api-helpers/server/users";
import { calculateMinStake } from "@/lib/guild/territories";
import prisma from "@/lib/prisma";
import type { ApiResponse } from "@/lib/schema/api";
import {
  type StakeTerritoryParams,
  StakeTerritorySchema,
} from "@/lib/schema/guild/territory";
import {
  TERRITORY_CONTROL_DAYS,
  TERRITORY_UNLOCKED_LEVEL,
} from "@/config/guilds/constants";
import { InngestEventDispatcher } from "@/inngest/dispatcher";
import { getNodesToClaim } from "@/lib/api-helpers/server/guilds/territories";

/**
 * ACTION: Claims a territory (only leader/office)
 */
export async function stakeTerritory(
  params: StakeTerritoryParams
): Promise<ApiResponse<{ hexId: string }>> {
  try {
    const { success, data } = StakeTerritorySchema.safeParse(params);

    if (!success) {
      return { success: false, error: "Invalid Request" };
    }

    const { accessToken, stakeAmount, guildId, hexId } = data;

    // Verify user authentication
    const { username } = await verifyTokenAndGetUser(accessToken);

    // Verify guild membership and role
    const member = await prisma.guildMember.findFirst({
      where: {
        username,
        role: { in: ["LEADER", "OFFICER"] },
        isActive: true,
        guildId,
      },
      select: {
        guild: { select: { vaultLevel: true, vaultBalance: true } },
        guildId: true,
      },
    });

    if (!member) {
      return { success: false, error: "Must be guild officer or leader" };
    }

    // Validate vault balance
    if (member.guild.vaultBalance < stakeAmount) {
      return { success: false, error: "Insufficient vault balance" };
    }

    // Validate vault level
    if (member.guild.vaultLevel < TERRITORY_UNLOCKED_LEVEL) {
      return {
        success: false,
        error: `Minimum vault level: ${TERRITORY_UNLOCKED_LEVEL}`,
      };
    }

    // Check territory availability
    const territory = await prisma.territory.findUnique({
      where: { hexId },
      select: { guildId: true, trafficScore: true },
    });

    if (territory?.guildId) {
      return { success: false, error: "Territory already controlled" };
    }

    // Minimum stake based on traffic score
    const minStake = calculateMinStake(territory?.trafficScore || 0);
    if (stakeAmount < minStake) {
      return {
        success: false,
        error: `Minimum stake: ${minStake} RESONANCE`,
      };
    }

    // Create/update territory
    const [centerLat, centerLon] = cellToLatLng(hexId);

    const nodesToClaim = await getNodesToClaim(hexId);

    // Execute stake
    const territoryStaked = await prisma.$transaction(async (tx) => {
      // Deduct from vault
      const updatedGuild = await tx.guild.update({
        where: { id: member.guildId },
        data: {
          vaultBalance: { decrement: stakeAmount },
        },
        select: { vaultBalance: true },
      });

      const territory = await tx.territory.upsert({
        where: { hexId },
        create: {
          hexId,
          centerLat,
          centerLon,
          guildId: member.guildId,
          currentStake: stakeAmount,
          controlledAt: new Date(),
          controlEndsAt: addDays(new Date(), TERRITORY_CONTROL_DAYS),
        },
        update: {
          guildId: member.guildId,
          currentStake: stakeAmount,
          controlledAt: new Date(),
          controlEndsAt: addDays(new Date(), TERRITORY_CONTROL_DAYS),
        },
        select: { id: true, controlEndsAt: true },
      });

      // create vault tx
      await tx.vaultTransaction.create({
        data: {
          amount: stakeAmount,
          balanceAfter: updatedGuild.vaultBalance,
          balanceBefore: updatedGuild.vaultBalance + stakeAmount,
          type: "WITHDRAWAL",
          memberUsername: username,
          reason: "Territory Stake",
          metadata: { territoryId: territory.id },
        },
        select: { id: true },
      });

      if (nodesToClaim.length > 0) {
        await tx.node.updateMany({
          where: { id: { in: nodesToClaim } },
          data: { territoryHexId: hexId },
        });
      }

      // Award prestige
      //   await tx.prestigeLog.create({
      //     data: {
      //       guildId: member.guildId,
      //       amount: Math.floor(stakeAmount / 10),
      //       source: "TERRITORY_VICTORY",
      //       metadata: { hexId },
      //     },
      //   });
      return territory;
    });

    const controlEndsAt = territoryStaked.controlEndsAt
      ? territoryStaked.controlEndsAt.toISOString()
      : addDays(new Date(), TERRITORY_CONTROL_DAYS).toISOString();

    await InngestEventDispatcher.territoryClaimed(
      territoryStaked.id,
      controlEndsAt
    );

    revalidatePath(`/territories/${hexId}`);

    return { success: true, data: { hexId } };
  } catch (error) {
    console.error("Error claiming territory:", error);
    return {
      success: false,
      error: "Failed to claim territory",
    };
  }
}
