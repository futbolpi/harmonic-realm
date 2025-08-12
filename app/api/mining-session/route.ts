import { type NextRequest, NextResponse } from "next/server";

import {
  MiningSessionResponse,
  MiningSessionResponseSchema,
} from "@/lib/schema/mining-session";
import { MINING_RANGE_METERS } from "@/config/site";
import { calculateDistance } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nodeId = searchParams.get("nodeId");
    const latitude = searchParams.get("latitude");
    const longitude = searchParams.get("longitude");

    if (!nodeId) {
      return NextResponse.json(
        { error: "Node ID is required" },
        { status: 400 }
      );
    }

    // Mock node data - in real app, fetch from database
    const mockNodes = [
      {
        id: "node_1",
        latitude: 40.7829,
        longitude: -73.9654,
        openForMining: true,
        maxMiners: 10,
        currentMiners: 3,
        type: {
          lockInMinutes: 30,
          baseYieldPerMinute: 0.125,
        },
      },
      {
        id: "node_2",
        latitude: 40.758,
        longitude: -73.9855,
        openForMining: true,
        maxMiners: 15,
        currentMiners: 8,
        type: {
          lockInMinutes: 45,
          baseYieldPerMinute: 0.15,
        },
      },
      {
        id: "node_3",
        latitude: 40.7614,
        longitude: -73.9776,
        openForMining: true,
        maxMiners: 5,
        currentMiners: 2,
        type: {
          lockInMinutes: 20,
          baseYieldPerMinute: 0.1,
        },
      },
    ];

    const node = mockNodes.find((n) => n.id === nodeId);
    if (!node) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 });
    }

    const mockActiveSession = {
      id: "session_123",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: "user_123",
      nodeId: nodeId,
      startTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // Started 10 minutes ago
      endTime: null,
      duration: null,
      minerSharesEarned: 1.25,
      status: "ACTIVE" as const,
      gpsVerified: true,
      lockInCompleted: true,
      lockInCompletedAt: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
    };

    // Check if user has an active session for this node
    // In real app, query database for active sessions
    const hasActiveSession = Math.random() > 0.7; // 30% chance of having active session for demo
    const activeSession = hasActiveSession ? mockActiveSession : null;

    let canMine = true;
    let reason = "";
    let userDistance = 0;
    let isWithinRange = false;

    // Check distance if user location provided
    if (latitude && longitude) {
      const userLat = Number.parseFloat(latitude);
      const userLng = Number.parseFloat(longitude);

      userDistance = calculateDistance(
        userLat,
        userLng,
        node.latitude,
        node.longitude
      );
      isWithinRange = userDistance <= MINING_RANGE_METERS;

      if (!isWithinRange) {
        canMine = false;
        reason = "Too far from node";
      }
    } else {
      canMine = false;
      reason = "Location required";
    }

    // Check if node is open and has capacity
    if (!node.openForMining) {
      canMine = false;
      reason = "Node is not active";
    } else if (node.currentMiners >= node.maxMiners) {
      canMine = false;
      reason = "Node is at capacity";
    }

    // Can't mine if already has active session
    // if (activeSession) {
    //   canMine = false;
    //   reason = "Active session in progress";
    // }

    const response: MiningSessionResponse = {
      session: activeSession,
      canMine,
      reason: canMine ? undefined : reason,
      userDistance,
      isWithinRange,
      requiredDistance: MINING_RANGE_METERS,
    };

    return NextResponse.json(MiningSessionResponseSchema.parse(response));
  } catch (error) {
    console.error("Mining session API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
