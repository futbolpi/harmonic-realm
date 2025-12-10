"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { verifyTokenAndGetUser } from "@/lib/api-helpers/server/users";
import type { ApiResponse } from "@/lib/schema/api";
import { EPHEMERAL_SPARK_NODE } from "@/config/tutorial";

type TutorialResponse = {
  awardedShares: number;
  alreadyCompleted: boolean;
};

export async function completeTutorial(params: {
  accessToken: string;
}): Promise<ApiResponse<TutorialResponse>> {
  try {
    const { accessToken } = params;

    if (!accessToken) {
      return { success: false, error: "Authentication required" };
    }

    const { id: userId } = await verifyTokenAndGetUser(accessToken);

    // Check current state to prevent abuse
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { hasCompletedTutorial: true },
    });

    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    if (dbUser.hasCompletedTutorial) {
      return {
        success: true,
        data: { awardedShares: 0, alreadyCompleted: true },
      };
    }

    const {
      type: { baseYieldPerMinute, lockInMinutes },
    } = EPHEMERAL_SPARK_NODE;

    const AWARD = baseYieldPerMinute * lockInMinutes; // flat tutorial reward

    await prisma.user.update({
      where: { id: userId, hasCompletedTutorial: false },
      data: {
        sharePoints: { increment: AWARD },
        hasCompletedTutorial: true,
      },
    });

    // Revalidate paths so UI updates immediately
    revalidatePath("/tutorial");

    return {
      success: true,
      data: { awardedShares: AWARD, alreadyCompleted: false },
    };
  } catch (error) {
    console.error("Complete tutorial action error:", error);
    return { success: false, error: "Failed to complete tutorial" };
  }
}
