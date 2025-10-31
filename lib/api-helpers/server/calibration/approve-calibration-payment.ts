import prisma from "@/lib/prisma";
import { ApiResponse } from "@/lib/schema/api";

type CalibrationApprovalParams = {
  paymentId: string;
  contributionId: string;
  amount: number;
};

/**
 * ACTION: Process Pi Payment Approval for Lattice Calibration
 */
export async function approveCalibrationPayment({
  amount,
  paymentId,
  contributionId,
}: CalibrationApprovalParams): Promise<ApiResponse<undefined>> {
  try {
    // Find the stake record
    const contribution = await prisma.awakeningContribution.findFirst({
      where: {
        id: contributionId,
        paymentId: null,
        piTransactionId: null,
        piContributed: { lte: amount },
      },
    });

    if (!contribution) {
      return {
        success: false,
        error: "Contribution record not found",
      };
    }

    // Update payment status
    await prisma.awakeningContribution.update({
      where: { id: contributionId },
      data: {
        paymentId,
        paymentStatus: "PROCESSING",
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error approving calibration payment:", error);
    return {
      success: false,
      error: "Failed to approve payment",
    };
  }
}
