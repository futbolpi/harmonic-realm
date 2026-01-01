import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import type { ApiResponse } from "@/lib/schema/api";
import { GUILD_CREATION_FEE } from "@/config/guilds/constants";

type Params = {
  paymentId: string;
  txid: string;
  guildId: string;
  amount: number;
};

/**
 * ACTION: Complete Pi Payment, update guild with txid,
 * upsert user guild membership
 * revalidate guild detail page and map
 */
export async function completeGuildPayment({
  paymentId,
  guildId,
  txid,
  amount,
}: Params): Promise<ApiResponse<undefined>> {
  try {
    // validate amount
    if (amount < GUILD_CREATION_FEE) {
      return {
        success: false,
        error: "Guild creation fee is low",
      };
    }

    // Find the guild record
    const guild = await prisma.guild.findFirst({
      where: {
        id: guildId,
        paymentId,
        piTransactionId: null,
      },
      select: {
        id: true,
        leaderUsername: true,
      },
    });

    if (!guild) {
      return {
        success: false,
        error: "Processing guild not found",
      };
    }

    // Update guild txid, upsert team leader guild membership in a transaction
    await prisma.$transaction(async (tx) => {
      // update the guild
      const updatedGuild = await tx.guild.update({
        data: { piTransactionId: txid },
        where: { id: guild.id },
        select: { id: true, leaderUsername: true },
      });
      // Upsert team leader guild membership
      await tx.guildMember.upsert({
        create: {
          guildId: updatedGuild.id,
          username: updatedGuild.leaderUsername,
          role: "LEADER",
        },
        update: {
          guildId: updatedGuild.id,
          role: "LEADER",
          challengeCompletions: 0,
          joinedAt: new Date(),
          vaultContribution: 0,
          totalSharePoints: 0,
          weeklySharePoints: 0,
          vaultTransactions: {
            updateMany: {
              data: { archivedAt: new Date() },
              where: { archivedAt: null },
            },
          },
        },
        where: { username: updatedGuild.leaderUsername },
      });
    });

    // Revalidate relevant paths
    revalidatePath(`/guilds/${guildId}`, "layout");
    revalidatePath(`/guilds`);

    // send notification

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error completing lore payment:", error);
    return {
      success: false,
      error: "Failed to complete payment",
    };
  }
}
