import type { NextRequest } from "next/server";

import { getImageResponse } from "./utils";

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

    // Generate cosmic symbols based on type
    const getCosmicSymbol = (type: string) => {
      switch (type) {
        case "node":
          return "🌟";
        case "journal":
          return "📜";
        case "map":
          return "🗺️";
        case "dashboard":
          return "⚡";
        case "login":
          return "🔮";
        default:
          return "✨";
      }
    };

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
