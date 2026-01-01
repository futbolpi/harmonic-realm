import { GUILD_CREATION_FEE } from "@/config/guilds/constants";
import prisma from "@/lib/prisma";
import { ApiResponse } from "@/lib/schema/api";

type GuildApprovalParams = {
  paymentId: string;
  guildId: string;
  amount: number;
};

/**
 * ACTION: Process Pi Payment Approval for Guild Creation
 */
export async function approveGuildPayment({
  amount,
  paymentId,
  guildId,
}: GuildApprovalParams): Promise<ApiResponse<undefined>> {
  try {
    // ensure amount is guild creation fee
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
        paymentId: null,
        piTransactionId: null,
      },
      select: { id: true },
    });

    if (!guild) {
      return {
        success: false,
        error: "Guild not found",
      };
    }

    // Update payment status
    await prisma.guild.update({
      where: { id: guild.id },
      data: {
        paymentId,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error approving resonance anchor payment:", error);
    return {
      success: false,
      error: "Failed to approve payment",
    };
  }
}
