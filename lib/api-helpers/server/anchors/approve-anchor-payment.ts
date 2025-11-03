import prisma from "@/lib/prisma";
import { ApiResponse } from "@/lib/schema/api";

type AnchorApprovalParams = {
  paymentId: string;
  anchorId: string;
  amount: number;
};

/**
 * ACTION: Process Pi Payment Approval for Resonance Anchor
 */
export async function approveAnchorPayment({
  amount,
  paymentId,
  anchorId,
}: AnchorApprovalParams): Promise<ApiResponse<undefined>> {
  try {
    // Find the payment record
    const anchor = await prisma.resonantAnchor.findFirst({
      where: {
        id: anchorId,
        paymentId: null,
        piTransactionId: null,
        piCost: { lte: amount },
      },
      select: { id: true },
    });

    if (!anchor) {
      return {
        success: false,
        error: "Resonance anchor record not found",
      };
    }

    // Update payment status
    await prisma.resonantAnchor.update({
      where: { id: anchor.id },
      data: {
        paymentId,
        paymentStatus: "PROCESSING",
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
