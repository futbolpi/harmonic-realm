import { type NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

import { verifyTokenAndGetUser } from "@/lib/api-helpers/server/users";
import { getMiningSession } from "@/lib/api-helpers/server/mining-sessions";
import { ApiResponse } from "@/lib/schema/api";
import { MiningSession } from "@/lib/schema/mining-session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ nodeId: string }> }
) {
  try {
    const { nodeId } = await params;
    // Extract access token from Authorization header
    const headersList = await headers();
    const authHeader = headersList.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    const user = await verifyTokenAndGetUser(accessToken);
    const data = await getMiningSession({ nodeId, userId: user.id });

    const response: ApiResponse<MiningSession> = { success: true, data };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Mining session API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
