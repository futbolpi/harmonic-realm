"use server";

import { addDays, addHours } from "date-fns";
import { revalidatePath } from "next/cache";

import { TERRITORY_UNLOCKED_LEVEL } from "@/config/guilds/constants";
import { verifyTokenAndGetUser } from "@/lib/api-helpers/server/users";
import prisma from "@/lib/prisma";
import type { ApiResponse } from "@/lib/schema/api";
import {
  StakeTerritorySchema,
  type StakeTerritoryParams,
} from "@/lib/schema/guild/territory";
import { getNodesToClaim } from "@/lib/api-helpers/server/guilds/territories";
import { InngestEventDispatcher } from "@/inngest/dispatcher";

/**
 * ACTION: Challenges a territory (only leader/office)
 */
export async function challengeTerritory(
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
      return { success: false, error: "Unauthorized" };
    }

    // Validate vault balance
    if (member.guild.vaultBalance < stakeAmount) {
      throw new Error("Insufficient vault balance");
    }

    // Validate vault level
    if (member.guild.vaultLevel < TERRITORY_UNLOCKED_LEVEL) {
      return {
        success: false,
        error: `Minimum vault level: ${TERRITORY_UNLOCKED_LEVEL}`,
      };
    }

    // Get territory
    const territory = await prisma.territory.findUnique({
      where: { hexId },
      select: {
        guildId: true,
        id: true,
        currentStake: true,
        activeChallenge: { select: { id: true } },
        controlEndsAt: true,
      },
    });

    if (!territory?.guildId || !territory.controlEndsAt) {
      return { success: false, error: "Territory not controlled" };
    }

    if (territory.guildId === member.guildId) {
      return { success: false, error: "Cannot challenge own territory" };
    }

    if (territory.activeChallenge) {
      return { success: false, error: "Challenge already active" };
    }

    // Validate stake matches defender
    if (stakeAmount < territory.currentStake) {
      return {
        success: false,
        error: `Must match defender stake: ${territory.currentStake}`,
      };
    }

    const nodesToClaim = await getNodesToClaim(hexId);

    // Create challenge
    const createdChallenge = await prisma.$transaction(async (tx) => {
      // Deduct from attacker vault
      const updatedGuild = await tx.guild.update({
        where: { id: member.guildId },
        data: {
          vaultBalance: { decrement: stakeAmount },
        },
        select: { vaultBalance: true },
      });

      // Create challenge
      const c = await tx.territoryChallenge.create({
        data: {
          territoryId: territory.id,
          defenderId: territory.guildId || "",
          defenderStake: territory.currentStake,
          attackerId: member.guildId,
          attackerStake: stakeAmount,
          endsAt: addDays(new Date(), 1),
        },
        select: { id: true, endsAt: true },
      });

      // Mark territory as having an active challenge to prevent concurrent challenges
      // and add 30 hours to the end of the territory control date
      await tx.territory.update({
        where: { id: territory.id },
        data: {
          activeChallengeId: c.id,
          controlEndsAt: addHours(territory.controlEndsAt || new Date(), 30),
        },
        select: { id: true },
      });

      // create vault tx
      await tx.vaultTransaction.create({
        data: {
          amount: stakeAmount,
          balanceAfter: updatedGuild.vaultBalance,
          balanceBefore: updatedGuild.vaultBalance + stakeAmount,
          type: "WITHDRAWAL",
          memberUsername: username,
          reason: "Territory challenge stake",
          metadata: { challengeId: c.id },
        },
        select: { id: true },
      });

      if (nodesToClaim.length > 0) {
        await tx.node.updateMany({
          where: { id: { in: nodesToClaim } },
          data: { territoryHexId: hexId },
        });
      }

      return c;
    });

    // Schedule the challenge resolution via Inngest (timed workflow). This avoids only relying on cron.
    await InngestEventDispatcher.scheduleChallengeResolution(
      createdChallenge.id,
      createdChallenge.endsAt?.toISOString()
    );

    // Notify both guilds (push notifications)
    // await notifyGuild(territory.guildId, "Your territory is under attack!");
    // await notifyGuild(member.guildId, "Challenge initiated!");
    revalidatePath(`/territories/${hexId}`);
    revalidatePath("/territories");

    return { success: true, data: { hexId } };
  } catch (error) {
    console.error("Error challenging territory:", error);
    return {
      success: false,
      error: "Failed to challeng territory",
    };
  }
}
