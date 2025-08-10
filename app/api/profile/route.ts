import { type NextRequest, NextResponse } from "next/server";

import { getUserFromAccessToken } from "@/lib/api-helpers/server/users";
import { type UserStats } from "@/lib/schema/user";
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

    const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    const user = getUserFromAccessToken(accessToken);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid access token" },
        { status: 401 }
      );
    }

    // Mock user profile data - in real app, fetch from database using user.piUid
    const mockUserStats: UserStats = {
      profile: {
        id: "user_" + user.piUid,
        piUid: user.piUid,
        piUsername: user.piUsername,
        displayName: user.piUsername,
        level: 5,
        experience: 2450,
        minerShares: 1250.75,
        totalEarned: 45.25,
        piBalance: 12.5,
        isVerified: true,
        lastActive: new Date(),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      },
      stats: {
        totalSessions: 42,
        activeSessions: 1,
        nodesDiscovered: 15,
        achievements: 8,
        weeklyEarnings: 12.5,
        rank: 156,
        nextLevelXP: 3000,
        currentXP: 2450,
      },
      recentSessions: [
        {
          id: "session_1",
          nodeId: "node_1",
          nodeName: "Central Park Node",
          earned: 2.5,
          duration: 45,
          status: "COMPLETED",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
        {
          id: "session_2",
          nodeId: "node_2",
          nodeName: "Times Square Hub",
          earned: 3.2,
          duration: 75,
          status: "COMPLETED",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        },
        {
          id: "session_3",
          nodeId: "node_3",
          nodeName: "Brooklyn Bridge",
          earned: 1.8,
          duration: 30,
          status: "COMPLETED",
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48 hours ago
        },
      ],
      achievements: [
        {
          id: "ach_1",
          name: "First Steps",
          description: "Complete your first mining session",
          icon: "🚀",
          category: "PROGRESSION",
          unlocked: true,
          unlockedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        },
        {
          id: "ach_2",
          name: "Explorer",
          description: "Discover 10 different nodes",
          icon: "🗺️",
          category: "EXPLORATION",
          unlocked: true,
          unlockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
        {
          id: "ach_3",
          name: "Dedicated Miner",
          description: "Mine for 24 hours total",
          icon: "⛏️",
          category: "MINING",
          unlocked: false,
        },
        {
          id: "ach_4",
          name: "Social Pioneer",
          description: "Mine with 5 different players",
          icon: "👥",
          category: "SOCIAL",
          unlocked: false,
        },
      ],
    };

    const response: ApiResponse<UserStats> = {
      success: true,
      data: mockUserStats,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
