"use server";

import { revalidatePath } from "next/cache";

import { verifyTokenAndGetUser } from "@/lib/api-helpers/server/users";
import prisma from "@/lib/prisma";
import { ApiResponse } from "@/lib/schema/api";
import { type JoinGuildParams, JoinGuildSchema } from "@/lib/schema/guild/join";
import { canUserUpgrade } from "@/lib/guild/utils";
import { awardPrestige } from "@/lib/api-helpers/server/guilds/prestige";

/**
 * ACTION: upgrades guild vault level (only leader/officer)
 */
export async function upgradeVault(
  params: JoinGuildParams
): Promise<ApiResponse<{ id: string }>> {
  try {
    const { success, data } = JoinGuildSchema.safeParse(params);

    if (!success) {
      return { success: false, error: "Invalid Request" };
    }

    const { accessToken, guildId } = data;

    // Verify user authentication
    const { id: userId } = await verifyTokenAndGetUser(accessToken);

    // Verify user role in guild
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        guildMembership: {
          select: {
            role: true,
            guild: {
              select: {
                vaultLevel: true,
                vaultBalance: true,
                id: true,
                piTransactionId: true,
              },
            },
          },
          where: { isActive: true, guildId },
        },
      },
    });

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const { canUpgrade, reason } = canUserUpgrade({
      guildMembership: user.guildMembership,
      guildToUpgradeId: guildId,
    });

    if (!canUpgrade) {
      return { success: false, error: reason };
    }

    if (!user.guildMembership) {
      return { success: false, error: "Inactive member" };
    }

    const guild = user.guildMembership.guild;

    if (guild.piTransactionId === null) {
      return { success: false, error: "Inactive Guild" };
    }

    // Get next level requirements
    const nextLevel = guild.vaultLevel + 1;
    const upgrade = await prisma.vaultUpgrade.findUnique({
      where: { level: nextLevel },
      select: { resonanceCost: true, maxMembers: true },
    });

    if (!upgrade) {
      return { success: false, error: "Max level reached" };
    }

    // Validate balances
    if (guild.vaultBalance < upgrade.resonanceCost) {
      return { success: false, error: "Insufficient vault balance" };
    }

    // Apply upgrade
    await prisma.$transaction(async (tx) => {
      // Burn RESONANCE from vault
      const updatedGuild = await tx.guild.update({
        where: { id: guildId },
        data: {
          vaultBalance: { decrement: upgrade.resonanceCost },
          vaultLevel: nextLevel,
          maxMembers: upgrade.maxMembers,
        },
        select: {
          vaultBalance: true,
        },
      });

      // Log transaction
      await tx.vaultTransaction.create({
        data: {
          memberUsername: user.username,
          type: "UPGRADE",
          amount: upgrade.resonanceCost,
          balanceBefore: updatedGuild.vaultBalance + upgrade.resonanceCost,
          balanceAfter: updatedGuild.vaultBalance,
          reason: `Vault upgraded to Level ${nextLevel}`,
          metadata: { level: nextLevel },
        },
      });

      await awardPrestige({
        guildId,
        amount: 50 * nextLevel, // Scaling prestige reward,
        metadata: {
          amount: 50 * nextLevel,
          newLevel: nextLevel,
          previousLevel: nextLevel - 1,
        },
        source: "VAULT_UPGRADE",
      });
    });

    revalidatePath(`/guilds/${guildId}`, "layout");
    return { success: true, data: { id: guildId } };
  } catch (error) {
    console.error("Error upgrading guild vault:", error);
    return {
      success: false,
      error: "Failed to upgrade guild vault",
    };
  }
}
