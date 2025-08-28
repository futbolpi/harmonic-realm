import { NextRequest } from "next/server";

import { getImageResponse } from "./utils";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const nodeId = searchParams.get("nodeId");
    const city = searchParams.get("city");
    const teaser = searchParams.get("teaser");
    const primaryColor = searchParams.get("primaryColor");
    const rarity = searchParams.get("rarity");

    return getImageResponse({
      city,
      nodeId,
      primaryColor,
      rarity,
      teaser,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.log(`Failed to generate OG image: ${error.message}`);
    }
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
