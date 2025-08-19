import type { NextRequest } from "next/server";

import { getCosmicSymbol, getImageResponse } from "./utils";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract parameters
    const title = searchParams.get("title") || "HarmonicRealm";
    const description =
      searchParams.get("description") || "Resonate with the Cosmic Lattice";
    const type = searchParams.get("type") || "default";
    const nodeType = searchParams.get("nodeType");
    const username = searchParams.get("username");

    const cosmicSymbol = getCosmicSymbol(type);

    return getImageResponse({
      cosmicSymbol,
      description,
      nodeType,
      title,
      username,
    });
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.log(`Failed to generate OG image: ${e.message}`);
    }
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
