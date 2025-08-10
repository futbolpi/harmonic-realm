import { NextRequest, NextResponse } from "next/server";

import { isValidAccessToken } from "@/lib/pi/platform-api-client";
import { verifyTokenSchema } from "@/lib/schema/auth";

// verify token
export async function POST(request: NextRequest) {
  const authResult = (await request.json()) as unknown;

  const parsedParam = verifyTokenSchema.safeParse(authResult);

  if (!parsedParam.success) {
    console.error("[VERIFY_TOKEN]", "Invalid verification params");
    return new NextResponse("Invalid verification params", { status: 400 });
  }

  const { accessToken } = parsedParam.data;

  try {
    const validToken = await isValidAccessToken(accessToken);

    if (!validToken) {
      console.error("[VERIFY_TOKEN]", "Invalid Access Token");
      return Response.json(
        {
          isValid: true,
        },
        { status: 400 }
      );
    }

    return Response.json({
      isValid: true,
    });
  } catch (error) {
    console.error("[VERIFY_TOKEN]", error);
    return new NextResponse("Server Error", { status: 400 });
  }
}
