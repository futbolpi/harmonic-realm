"use server";

import { addHours } from "date-fns";

import { verifyTokenAndGetUser } from "@/lib/api-helpers/server/users";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/schema/api";
import {
  ApplyEchoTransmissionParams,
  ApplyEchoTransmissionSchema,
} from "@/lib/schema/echo";

type ApplyEchoTransmissionResponse = ApiResponse<{ timeReduction?: number }>;

// this should just apply transmission to session (no recharge)

export async function applyEchoTransmission(
  params: ApplyEchoTransmissionParams
): Promise<ApplyEchoTransmissionResponse> {
  try {
    const { success, data } = ApplyEchoTransmissionSchema.safeParse(params);

    if (!success) {
      return { success: false, error: "Invalid Request" };
    }

    const { accessToken, sessionId, nodeId, adId } = data;

    // Verify user authentication
    const { id: userId } = await verifyTokenAndGetUser(accessToken);

    // Get or create user's Echo Transmission record
    let echoTransmission = await prisma.echoTransmission.findUnique({
      where: { userId },
    });

    // Check if user needs to watch ad first (recharging)
    const needsRecharge =
      echoTransmission === null ||
      echoTransmission.status === "EXPIRED" ||
      echoTransmission.status === "DEPLETED" ||
      (echoTransmission.expiresAt && new Date() > echoTransmission.expiresAt);

    if (needsRecharge && !!adId) {
      // Create or update Echo Transmission after ad viewing
      // use adid to ensure it was viewed
      if (adId !== "interstitial") {
        // confirm it was really watched
      }
      const expiresAt = addHours(Date.now(), 12);

      echoTransmission = await prisma.echoTransmission.upsert({
        where: { userId },
        update: {
          chargeLevel: 100,
          status: "CHARGED",
          lastChargedAt: new Date(),
          expiresAt: expiresAt,
        },
        create: {
          userId,
          chargeLevel: 100,
          status: "CHARGED",
          lastChargedAt: new Date(),
          expiresAt: expiresAt,
          usedNodeIds: [],
          maxTimeReduction: 25, // Default 25%, can be upgraded
        },
      });

      return {
        success: true,
        error: "Echo Resonator recharged! You can now use it on any Node.",
      };
    }

    // Check if already used on this node
    if (echoTransmission?.usedNodeIds.includes(nodeId)) {
      return {
        success: false,
        error: "Temporal signature already locked for this Node",
      };
    }

    // Check if transmission is still charged and valid
    if (
      echoTransmission?.status !== "CHARGED" ||
      (echoTransmission.expiresAt && new Date() > echoTransmission.expiresAt)
    ) {
      return {
        success: false,
        error: "Echo Resonator has expired. Watch an ad to recharge.",
      };
    }

    // Get the mining session
    const session = await prisma.miningSession.findUnique({
      where: { id: sessionId },
      include: { node: { include: { type: true } } },
    });

    if (!session || session.userId !== userId) {
      return { success: false, error: "Invalid mining session" };
    }

    if (session.echoTransmissionApplied) {
      return {
        success: false,
        error: "Echo Transmission already applied to this session",
      };
    }

    // Apply the time reduction
    const timeReductionPercent = echoTransmission.maxTimeReduction;

    // Update mining session and Echo Transmission in transaction
    await prisma.$transaction([
      // Update mining session
      prisma.miningSession.update({
        where: { id: sessionId },
        data: {
          echoTransmissionApplied: true,
          timeReductionPercent: timeReductionPercent,
        },
      }),

      // Update Echo Transmission
      prisma.echoTransmission.update({
        where: { userId },
        data: {
          status: "DEPLETED",
          usedNodeIds: [...echoTransmission.usedNodeIds, nodeId],
          totalUsageCount: echoTransmission.totalUsageCount + 1,
        },
      }),
    ]);

    return {
      success: true,
      data: { timeReduction: timeReductionPercent },
    };
  } catch (error) {
    console.error("Apply Echo Transmission error:", error);
    return { success: false, error: "Failed to apply Echo Transmission" };
  }
}
