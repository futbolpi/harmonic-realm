import { NextRequest, NextResponse } from "next/server";

import { verifyTokenAndGetUser } from "@/lib/api-helpers/server/users";
import prisma from "@/lib/prisma";
import { LoreStakeDetails } from "@/lib/schema/location-lore";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const accessToken = authHeader.split(" ")[1];
    const user = await verifyTokenAndGetUser(accessToken);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const stake: LoreStakeDetails | null =
      await prisma.locationLoreStake.findUnique({
        where: {
          id,
          userId: user.id,
        },
        include: {
          locationLore: {
            include: {
              node: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

    if (!stake) {
      return NextResponse.json(
        { success: false, error: "Stake not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: stake,
    });
  } catch (error) {
    console.error("Error fetching stake:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stake details" },
      { status: 500 }
    );
  }
}
