"use server";

import { revalidatePath } from "next/cache";

import { ApiResponse } from "@/lib/schema/api";
import {
  MiningSession,
  StartMiningRequest,
  StartMiningSchema,
} from "@/lib/schema/mining-session";
import { calculateDistance } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { verifyTokenAndGetUser } from "@/lib/api-helpers/server/users";
import { MINING_RANGE_METERS } from "@/config/site";
import { validateGeolocation } from "@/lib/api-helpers/server/utils/validate-geolocation";

export async function startMiningAction(
  params: StartMiningRequest
): Promise<ApiResponse<MiningSession>> {
  try {
    // Validate input
    const { success, data } = StartMiningSchema.safeParse(params);

    if (!success) {
      return { success: false, error: "Invalid Request" };
    }

    const { accessToken, nodeId, userLatitude, userLongitude } = data;

    const { id: userId } = await verifyTokenAndGetUser(accessToken);

    // Validate against spoofing
    const isValid = await validateGeolocation({
      submittedLat: userLatitude,
      submittedLng: userLongitude,
      avoidRapidFire: true,
      userId,
    });

    if (!isValid) {
      return {
        success: false,
        error: "Forbidden: Location verification failed",
      };
    }

    const node = await prisma.node.findUnique({
      where: { id: nodeId },
      select: {
        openForMining: true,
        latitude: true,
        longitude: true,
        _count: {
          select: {
            sessions: {
              where: { endTime: { not: null }, status: "COMPLETED" },
            },
          },
        },
        type: { select: { maxMiners: true } },
      },
    });

    if (!node) {
      return {
        success: false,
        error: "Node not found",
      };
    }

    // Check if node is available
    if (!node.openForMining) {
      return {
        success: false,
        error: "Node is not currently active",
      };
    }

    if (node._count.sessions >= node.type.maxMiners) {
      return {
        success: false,
        error: "Node is at maximum capacity",
      };
    }

    // Check distance
    const distance =
      calculateDistance(
        userLatitude,
        userLongitude,
        node.latitude,
        node.longitude
      ) * 1000; // Convert to meters

    if (distance > MINING_RANGE_METERS) {
      // 100m range
      return {
        success: false,
        error: `You are too far from the node (${distance.toFixed(
          0
        )}m away, max 100m)`,
      };
    }

    // Check if user already has an active session
    const hasActiveSession = await prisma.miningSession.findUnique({
      where: { userId_nodeId: { nodeId, userId } },
      select: { id: true },
    });

    if (hasActiveSession) {
      return {
        success: false,
        error: "You already have an active mining session",
      };
    }

    // Create mining session
    const session = await prisma.miningSession.create({
      data: { userId, nodeId },
    });

    // Revalidate the page to show the new session
    revalidatePath(`/nodes/${nodeId}`);
    revalidatePath("/dashboard");

    return {
      success: true,
      data: session,
    };
  } catch (error) {
    console.error("Start mining action error:", error);
    return {
      success: false,
      error: "Failed to start mining session",
    };
  }
}
