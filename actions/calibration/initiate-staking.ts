"use server";

import { Decimal } from "@prisma/client/runtime/client";
import { verifyTokenAndGetUser } from "@/lib/api-helpers/server/users";
import prisma from "@/lib/prisma";
import { ApiResponse } from "@/lib/schema/api";
import { calculateContributionTier } from "@/lib/utils/location-lore";
import {
  InitiateCalibrationParams,
  InitiateCalibrationSchema,
} from "@/lib/schema/calibration";
import { binLatLon } from "@/lib/node-spawn/region-metrics";
import { isOnLand, loadLandGeoJson } from "@/lib/node-spawn/node-generator";

/**
 * ACTION: Initiate Lattice Calibration Staking (creates payment intent)
 */
export async function initiateCalibrationStaking(
  params: InitiateCalibrationParams
): Promise<ApiResponse<{ id: string }>> {
  try {
    const { success, data } = InitiateCalibrationSchema.safeParse(params);

    if (!success) {
      return { success: false, error: "Invalid Request" };
    }

    const { accessToken, currentLat, currentLon, piContributed } = data;

    // Verify user authentication
    const user = await verifyTokenAndGetUser(accessToken);

    // validate location is on land
    const geojson = await loadLandGeoJson();
    const onLand = isOnLand(currentLon, currentLat, geojson);

    if (!onLand) {
      return { success: false, error: "Location is not on land" };
    }

    const piDecimal = new Decimal(piContributed);

    // find current phase
    const phase = await prisma.gamePhase.findFirst({
      orderBy: { phaseNumber: "desc" },
      select: { id: true },
    });

    if (!phase) return { success: false, error: "No active phase" };

    // bin location
    const { latitudeBin, longitudeBin } = binLatLon(currentLat, currentLon);

    // Create stake record (pending payment)
    const contribution = await prisma.awakeningContribution.create({
      data: {
        userId: user.piId,
        gamePhaseId: phase.id,
        latitudeBin,
        longitudeBin,
        piContributed: piDecimal,
        contributionTier: calculateContributionTier(piDecimal),
      },
      select: { id: true },
    });

    return {
      success: true,
      data: contribution,
    };
  } catch (error) {
    console.error("Error initiating lattice calibration staking:", error);
    return {
      success: false,
      error: "Failed to initiate staking",
    };
  }
}
