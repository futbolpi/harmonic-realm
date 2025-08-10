import { type NextRequest, NextResponse } from "next/server";

import { getUserFromAccessToken } from "@/lib/api-helpers/server/users";
import { Node, NodesResponse } from "@/lib/schema/node";
import { ApiResponse } from "@/lib/schema/api";

export async function GET(request: NextRequest) {
  try {
    // Extract access token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);
    const user = getUserFromAccessToken(accessToken);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid access token" },
        { status: 401 }
      );
    }

    // Get location parameters
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    // Mock nodes data - in real app, fetch from database within radius
    const mockNodes: Node[] = [
      {
        id: "node_1",
        latitude: 40.7829,
        longitude: -73.9654,
        openForMining: true,

        type: {
          id: 1,
          name: "Urban Hub",
          baseYieldPerMinute: 2.5,
          maxMiners: 10,
          lockInMinutes: 15,
          rarity: 2,
          iconUrl: "/placeholder.svg?height=32&width=32&text=🏢",
        },
      },
      {
        id: "node_2",
        latitude: 40.758,
        longitude: -73.9855,
        openForMining: true,
        sponsor: "Starbucks",
        type: {
          id: 2,
          name: "Community Center",
          baseYieldPerMinute: 1.8,
          maxMiners: 15,
          lockInMinutes: 10,
          rarity: 1,
          iconUrl: "/placeholder.svg?height=32&width=32&text=☕",
        },
      },
      {
        id: "node_3",
        latitude: 40.7614,
        longitude: -73.9776,
        openForMining: true,

        type: {
          id: 3,
          name: "Landmark",
          baseYieldPerMinute: 4.0,
          maxMiners: 5,
          lockInMinutes: 30,
          rarity: 4,
          iconUrl: "/placeholder.svg?height=32&width=32&text=🗽",
        },
      },
      {
        id: "node_4",
        latitude: 40.7505,
        longitude: -73.9934,
        openForMining: false,

        type: {
          id: 4,
          name: "Rare Node",
          baseYieldPerMinute: 6.0,
          maxMiners: 3,
          lockInMinutes: 45,
          rarity: 5,
          iconUrl: "/placeholder.svg?height=32&width=32&text=💎",
        },
      },
    ];

    const response: ApiResponse<NodesResponse> = {
      success: true,
      data: {
        nodes: mockNodes,
        userLocation:
          lat && lng
            ? {
                latitude: Number.parseFloat(lat),
                longitude: Number.parseFloat(lng),
              }
            : undefined,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Nodes API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
