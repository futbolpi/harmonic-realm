"use server";

import { verifyTokenAndGetUser } from "@/lib/api-helpers/server/users";
import prisma from "@/lib/prisma";
import { ApiResponse } from "@/lib/schema/api";
import {
  InitiateNodeAnchoringSchema,
  InitiateNodeAnchoringParams,
} from "@/lib/schema/anchor";
import { calculateAnchorCost } from "@/lib/anchors/utils";
import { calculateGlobalAnchorIndex } from "@/lib/api-helpers/server/anchors/utils";
import { isOnLand, loadLandGeoJson } from "@/lib/node-spawn/node-generator";

/**
 * ACTION: Initiate Resonance Anchor Staking (creates payment intent)
 */
export async function initiateAnchorStaking(
  params: InitiateNodeAnchoringParams
): Promise<ApiResponse<{ id: string }>> {
  try {
    const { success, data } = InitiateNodeAnchoringSchema.safeParse(params);

    if (!success) {
      return { success: false, error: "Invalid Request" };
    }

    const { accessToken, latitude, longitude } = data;

    // Verify user authentication
    const user = await verifyTokenAndGetUser(accessToken);

    // validate location is on land
    const geojson = await loadLandGeoJson();
    const onLand = isOnLand(longitude, latitude, geojson);

    if (!onLand) {
      return { success: false, error: "Location is not on land" };
    }

    // find current phase
    const phase = await prisma.gamePhase.findFirst({
      orderBy: { phaseNumber: "desc" },
      where: { endTime: null },
      select: { id: true, requiredPiFunding: true },
    });

    if (!phase) return { success: false, error: "No active phase" };

    // Validate location density
    // const densityValidation = await validateLocationDensity(
    //   latitude,
    //   longitude,
    //   phase.id
    // );
    // if (!densityValidation.valid) {
    //   return { success: false, error: densityValidation.error };
    // }

    // Calculate anchor cost
    const globalAnchorIndex = await calculateGlobalAnchorIndex(phase.id);
    const piCost = calculateAnchorCost(
      phase.requiredPiFunding,
      globalAnchorIndex
    );

    // Create resonant anchor record
    const resonantAnchor = await prisma.resonantAnchor.create({
      data: {
        userId: user.piId, // Replace with actual user from auth
        phaseId: phase.id,
        locationLat: latitude,
        locationLon: longitude,
        piCost,
        paymentStatus: "PENDING",
      },
      select: { id: true },
    });

    return {
      success: true,
      data: resonantAnchor,
    };
  } catch (error) {
    console.error("Error initiating lattice calibration staking:", error);
    return {
      success: false,
      error: "Failed to initiate staking",
    };
  }
}
