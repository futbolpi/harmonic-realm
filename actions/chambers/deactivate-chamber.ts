"use server";

import { revalidatePath } from "next/cache";

import { verifyTokenAndGetUser } from "@/lib/api-helpers/server/users";
import prisma from "@/lib/prisma";
import { ApiResponse } from "@/lib/schema/api";
import {
  calculateDeactivationRefund,
  canDeactivateChamber,
} from "@/lib/utils/chambers";
import {
  type DeactivateChamberResponse,
  type MaintainChamberParams,
  MaintainChamberSchema,
} from "@/lib/schema/echo-chamber";

/**
 * ACTION: Deactivate Echo Resonance Chamber
 *
 * Requirements:
 * - Chamber must be owned by user
 * - Chamber must be active
 *
 * Effect:
 * - Mark chamber as inactive (stops boost, removes from map)
 * - Refund 50% of total RESONANCE invested
 * - User can create a new chamber in this slot
 */
export async function deactivateChamber(
  params: MaintainChamberParams,
): Promise<ApiResponse<DeactivateChamberResponse>> {
  try {
    const { success, data } = MaintainChamberSchema.safeParse(params);

    if (!success) {
      return { success: false, error: "Invalid Request" };
    }

    const { accessToken, chamberId } = data;

    // 1. Verify user authentication
    const { id: userId } = await verifyTokenAndGetUser(accessToken);

    // 2. Fetch chamber
    const chamber = await prisma.echoResonanceChamber.findUnique({
      where: { id: chamberId },
      select: {
        userId: true,
        isActive: true,
        totalResonanceInvested: true,
      },
    });

    // 3. Validation
    if (!chamber) {
      return { success: false, error: "Chamber not found" };
    }

    if (chamber.userId !== userId) {
      return { success: false, error: "Access denied" };
    }

    // 4. Permission check
    const permission = canDeactivateChamber({
      chamberActive: chamber.isActive,
    });

    if (!permission.allowed) {
      return {
        success: false,
        error: permission.reason || "Cannot deactivate chamber",
      };
    }

    // 5. Calculate refund and deactivate
    const refund = calculateDeactivationRefund(chamber.totalResonanceInvested);

    await prisma.$transaction(async (tx) => {
      // Mark chamber as inactive
      await tx.echoResonanceChamber.update({
        where: { id: chamberId },
        data: { isActive: false },
        select: { id: true },
      });

      // Refund RESONANCE
      await tx.user.update({
        where: { id: userId },
        data: { sharePoints: { increment: refund } },
        select: { id: true },
      });
    });

    // 6. Revalidate relevant paths
    revalidatePath(`/${userId}/chambers`);

    return {
      success: true,
      data: {
        refund,
        refundPercentage: 50,
      },
    };
  } catch (error) {
    console.error("Error deactivating chamber:", error);
    return {
      success: false,
      error: "Failed to deactivate chamber",
    };
  }
}
