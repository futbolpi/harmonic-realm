"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import {
  VaultDepsositParams,
  VaultDepsositSchema,
} from "@/lib/schema/guild/vaults";
import { ApiResponse } from "@/lib/schema/api";
import { verifyTokenAndGetUser } from "@/lib/api-helpers/server/users";
import { canUserDeposit } from "@/lib/guild/utils";

/**
 * ACTION: deposits to guild vault
 * (only active members with sufficient points)
 */
export async function depositToVault(
  params: VaultDepsositParams
): Promise<ApiResponse<{ id: string }>> {
  try {
    const { success, data } = VaultDepsositSchema.safeParse(params);

    if (!success) {
      return { success: false, error: "Invalid Request" };
    }

    const { accessToken, guildId, amount } = data;

    // Verify user authentication
    const { id: userId } = await verifyTokenAndGetUser(accessToken);

    // Validate membership
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        sharePoints: true,
        username: true,
        guildMembership: {
          select: {
            id: true,
            guild: { select: { piTransactionId: true, id: true } },
          },
          where: { isActive: true, guildId },
        },
      },
    });

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const member = user.guildMembership;

    if (!member) {
      return { success: false, error: "Not a member" };
    }

    const { canDeposit, reason } = canUserDeposit({
      depositAmount: amount,
      guild: { id: guildId, piTransactionId: member.guild.piTransactionId },
      user: { guildId: member.guild.id, sharePoints: user.sharePoints },
    });

    if (!canDeposit) {
      return { success: false, error: reason || "Unauthorized" };
    }

    // Atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct from user
      await tx.user.update({
        where: { id: userId },
        data: {
          sharePoints: { decrement: amount },
        },
        select: { id: true },
      });

      // Add to vault
      const guild = await tx.guild.update({
        where: { id: guildId },
        data: {
          vaultBalance: { increment: amount },
          totalContributed: { increment: amount },
        },
        select: { id: true, vaultBalance: true },
      });

      // Log transaction
      await tx.vaultTransaction.create({
        data: {
          memberUsername: user.username,
          type: "DEPOSIT",
          amount,
          balanceBefore: guild.vaultBalance - amount,
          balanceAfter: guild.vaultBalance,
          reason: "Member deposit",
        },
        select: { id: true },
      });

      // Update member contribution
      await tx.guildMember.update({
        where: {
          id: member.id,
        },
        data: {
          vaultContribution: { increment: amount },
        },
        select: { id: true },
      });

      return guild;
    });

    revalidatePath(`/guilds/${guildId}`, "layout");
    return { success: true, data: { id: result.id } };
  } catch (error) {
    console.error("Error depositing to guild vault:", error);
    return {
      success: false,
      error: "Failed to deposit to guild vault",
    };
  }
}
