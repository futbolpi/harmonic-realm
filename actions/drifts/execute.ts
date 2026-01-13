"use server";

import { subDays } from "date-fns";
import { revalidatePath } from "next/cache";

import { getEligibleNodeForDrift } from "@/lib/api-helpers/server/drifts/get-eligibile-nodes";
import { verifyTokenAndGetUser } from "@/lib/api-helpers/server/users";
import { validateGeolocation } from "@/lib/api-helpers/server/utils/validate-geolocation";
import prisma from "@/lib/prisma";
import { ApiResponse } from "@/lib/schema/api";
import { ExecuteDriftParams, ExecuteDriftSchema } from "@/lib/schema/drift";
import { getDriftCost } from "@/lib/drift/drift-cost";
import { loadLandGeoJson } from "@/lib/node-spawn/node-generator";
import { generateRandomLandCoordinate } from "@/lib/drift/location-generator";
import { DRIFT_COOL_DOWN_DAYS, VOID_ZONE_RADIUS_KM } from "@/config/drift";

export async function executeDrift(params: ExecuteDriftParams): Promise<
  ApiResponse<{
    cost: number;
    newLocation: {
      lat: number;
      lon: number;
    };
  }>
> {
  try {
    const { success, data } = ExecuteDriftSchema.safeParse(params);

    if (!success) {
      return { success: false, error: "Invalid Request" };
    }

    const { accessToken, latitude, longitude, nodeId } = data;

    // Verify user authentication
    const { id: userId } = await verifyTokenAndGetUser(accessToken);

    // Validate against spoofing
    const isValid = await validateGeolocation({
      submittedLat: latitude,
      submittedLng: longitude,
      avoidRapidFire: true,
      userId,
    });

    if (!isValid) {
      return {
        success: false,
        error: "Forbidden: Location verification failed",
      };
    }

    // check there is no node within void zone
    const nearbyCount = await prisma.$queryRaw<
      { count: bigint }[]
    >`SELECT COUNT(*) FROM "nodes" WHERE (6371 * acos(cos(radians(${latitude})) * cos(radians("latitude")) * cos(radians("longitude") - radians(${longitude})) + sin(radians(${latitude})) * sin(radians("latitude")))) < ${VOID_ZONE_RADIUS_KM};`;
    if (parseInt(nearbyCount[0].count.toString()) > 0)
      return { success: false, error: "Not within void zone" };

    const [user, node, geojson] = await Promise.all([
      prisma.user.findUnique({
        where: {
          id: userId,
          OR: [
            { lastDriftAt: null },
            { lastDriftAt: { lte: subDays(new Date(), DRIFT_COOL_DOWN_DAYS) } },
          ],
        },
        select: { driftCount: true, sharePoints: true, lastDriftAt: true },
      }),
      // ensure validated node is within 100 km
      getEligibleNodeForDrift({
        nodeId,
        userLat: latitude,
        userLng: longitude,
      }),
      loadLandGeoJson(),
    ]);

    // ensure node and user cooldown is met
    if (!node || !user) {
      return { success: false, error: "Node cannot be summoned" };
    }

    const cost = getDriftCost({
      distance: node.distance,
      driftCount: user.driftCount,
      rarity: node.rarity,
    });

    // Validate User SP balance.
    if (user.sharePoints < cost) {
      return { success: false, error: "Node cannot be summoned" };
    }

    // 2. Calculate new random on land coordinate (Annulus: 2km min, 8km max).
    const randomLocation = generateRandomLandCoordinate({
      geojson,
      lat: latitude,
      lon: longitude,
    });

    if (!randomLocation) {
      return { success: false, error: "Node cannot be summoned" };
    }

    await prisma.$transaction(async (tx) => {
      // 3. Deduct SP, increase drift count, set new lastDriftAt.
      await tx.user.update({
        where: { id: userId },
        data: {
          sharePoints: { decrement: cost },
          driftCount: { increment: 1 },
          lastDriftAt: new Date(),
        },
        select: { id: true },
      });
      // 4. Update Node (lat, lng,).
      await tx.node.update({
        where: { id: nodeId },
        data: {
          latitude: randomLocation.lat,
          longitude: randomLocation.lon,
          territoryHexId: null,
        },
        select: { id: true },
      });
      // 5. Create DriftLog.
      await tx.nodeDrift.create({
        data: {
          newLatitude: randomLocation.lat,
          newLongitude: randomLocation.lon,
          nodeRarity: node.rarity,
          originalDistance: node.distance,
          originalLatitude: node.latitude,
          originalLongitude: node.longitude,
          sharePointsCost: cost,
          driftRadius: node.distance,
          userId,
          nodeId,
        },
      });
    });

    // 6. Revalidate Next.js cache tags ['nodes', 'map'].
    revalidatePath("/map");
    revalidatePath("/nodes");
    revalidatePath("/resonant-drift");

    return {
      success: true,
      data: { cost, newLocation: randomLocation },
    };
  } catch (error) {
    console.error("Error initiating lattice calibration staking:", error);
    return {
      success: false,
      error: "Failed to initiate staking",
    };
  }
}
