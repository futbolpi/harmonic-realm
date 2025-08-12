"use server";

import { revalidatePath } from "next/cache";

import { ApiResponse } from "@/lib/schema/api";
import {
  MiningSession,
  StartMiningRequest,
  StartMiningSchema,
} from "@/lib/schema/mining-session";
import { calculateDistance } from "@/lib/utils";

export async function startMiningAction(
  data: StartMiningRequest
): Promise<ApiResponse<MiningSession>> {
  try {
    // Validate input
    const validatedData = StartMiningSchema.parse(data);

    // Mock node data - in real app, fetch from database
    const mockNodes = [
      {
        id: "node_1",
        latitude: 40.7829,
        longitude: -73.9654,
        openForMining: true,
        maxMiners: 10,
        currentMiners: 3,
        baseYieldPerMinute: 2.5,
        lockInMinutes: 15,
      },
      {
        id: "node_2",
        latitude: 40.758,
        longitude: -73.9855,
        openForMining: true,
        maxMiners: 15,
        currentMiners: 8,
        baseYieldPerMinute: 1.8,
        lockInMinutes: 10,
      },
      // Add other nodes...
    ];

    const node = mockNodes.find((n) => n.id === validatedData.nodeId);
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

    if (node.currentMiners >= node.maxMiners) {
      return {
        success: false,
        error: "Node is at maximum capacity",
      };
    }

    // Check distance
    const distance =
      calculateDistance(
        validatedData.userLatitude,
        validatedData.userLongitude,
        node.latitude,
        node.longitude
      ) * 1000; // Convert to meters

    if (distance > 100) {
      // 100m range
      return {
        success: false,
        error: `You are too far from the node (${distance.toFixed(
          0
        )}m away, max 100m)`,
      };
    }

    // Check if user already has an active session
    // In real app, query database for active sessions
    const hasActiveSession = false; // Mock: no active session

    if (hasActiveSession) {
      return {
        success: false,
        error: "You already have an active mining session",
      };
    }

    // Create mining session
    const now = new Date();
    const session: MiningSession = {
      id: `session_${Date.now()}`,
      userId: "mock_user_id", // In real app, get from auth
      nodeId: validatedData.nodeId,
      startTime: now,
      lockInMinutes: node.lockInMinutes,
      baseYieldPerMinute: node.baseYieldPerMinute,
      bonusMultiplier: 1.0, // Base multiplier, could be higher based on user level
      sharesEarned: node.baseYieldPerMinute * node.lockInMinutes,
      status: "ACTIVE",
      userLatitude: validatedData.userLatitude,
      userLongitude: validatedData.userLongitude,
      createdAt: now,
      updatedAt: now,
      estimatedYield: node.baseYieldPerMinute * node.lockInMinutes,
    };

    // In real app, save to database
    console.log("Created mining session:", session);

    // Revalidate the page to show the new session
    revalidatePath(`/node/${validatedData.nodeId}`);
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
