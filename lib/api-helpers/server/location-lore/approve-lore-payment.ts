import prisma from "@/lib/prisma";
import { ApiResponse } from "@/lib/schema/api";

type LorePaymentApprovalParams = {
  paymentId: string;
  stakeId: string;
  amount: number;
};

/**
 * ACTION: Process Pi Payment Approval for Location Lore
 */
export async function approveLocationLorePayment({
  amount,
  paymentId,
  stakeId,
}: LorePaymentApprovalParams): Promise<ApiResponse<undefined>> {
  try {
    // Find the stake record
    const stake = await prisma.locationLoreStake.findFirst({
      where: {
        id: stakeId,
        paymentStatus: "PENDING",
        piAmount: { lte: amount },
      },
    });

    if (!stake) {
      return {
        success: false,
        error: "Stake record not found",
      };
    }

    // Update payment status
    await prisma.locationLoreStake.update({
      where: { id: stakeId },
      data: {
        paymentId,
        paymentStatus: "PROCESSING",
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error approving lore payment:", error);
    return {
      success: false,
      error: "Failed to approve payment",
    };
  }
}
