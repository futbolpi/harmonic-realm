import { type NextRequest, NextResponse } from "next/server";

import {
  getUserProfile,
  verifyTokenAndGetUser,
} from "@/lib/api-helpers/server/users";
import { type UserProfile } from "@/lib/schema/user";
import { ApiResponse } from "@/lib/schema/api";

export async function GET(request: NextRequest) {
  try {
    // Extract access token from Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    const user = await verifyTokenAndGetUser(accessToken);

    const userProfile = await getUserProfile(user.id);

    const response: ApiResponse<UserProfile> = {
      success: true,
      data: userProfile,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Profile API error:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
