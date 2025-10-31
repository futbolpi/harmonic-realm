import { revalidatePath } from "next/cache";

import { InngestEventDispatcher } from "@/inngest/dispatcher";
import prisma from "@/lib/prisma";
import { ApiResponse } from "@/lib/schema/api";

type Params = {
  paymentId: string;
  txid: string;
  contributionId: string;
  amount: number;
};

/**
 * ACTION: Complete Pi Payment and Trigger Lattice Calibration
 */
export async function completeCalibrationPayment({
  paymentId,
  contributionId,
  txid,
  amount,
}: Params): Promise<ApiResponse<undefined>> {
  try {
    // Find the stake record
    const contribution = await prisma.awakeningContribution.findFirst({
      where: {
        id: contributionId,
        paymentId,
        paymentStatus: "PROCESSING",
        piContributed: { lte: amount },
      },
      select: {
        gamePhaseId: true,
        piContributed: true,
        gamePhase: { select: { currentProgress: true } },
      },
    });

    if (!contribution) {
      return {
        success: false,
        error: "Processing contribution not found",
      };
    }

    // Update contribution record and update phase progress in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the contribution record
      const updatedContribution = await tx.awakeningContribution.update({
        data: {
          piTransactionId: txid,
          paymentStatus: "COMPLETED",
        },
        where: { id: contributionId },
        select: { id: true },
      });

      // Update game phase progress
      const updatedPhase = await tx.gamePhase.update({
        where: { id: contribution.gamePhaseId },
        data: {
          currentProgress: contribution.gamePhase.currentProgress.plus(
            contribution.piContributed
          ),
        },
        select: { currentProgress: true, requiredPiFunding: true },
      });

      return { updatedContribution, updatedPhase };
    });

    const { updatedContribution, updatedPhase } = result;

    // Check if calibration is now triggered
    const isCalibrationTriggered =
      updatedPhase.currentProgress.greaterThanOrEqualTo(
        updatedPhase.requiredPiFunding
      );

    if (isCalibrationTriggered) {
      // Trigger the Inngest workflow for node generation
      await InngestEventDispatcher.startLatticeCalibration(
        contribution.gamePhaseId
      );
    }

    // Revalidate relevant paths
    revalidatePath(`/awakening-contributions/${updatedContribution.id}`);
    revalidatePath(`/lattice-calibration`);

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
