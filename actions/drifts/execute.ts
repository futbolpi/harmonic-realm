"use server";

import { addDays, subDays } from "date-fns";
import { revalidatePath } from "next/cache";

import {
  getEligibleNodeForDrift,
  checkDriftEligibility,
} from "@/lib/api-helpers/server/drifts/get-eligible-nodes";
import { verifyTokenAndGetUser } from "@/lib/api-helpers/server/users";
import { validateGeolocation } from "@/lib/api-helpers/server/utils/validate-geolocation";
import { addEchoShards } from "@/lib/api-helpers/server/guilds/artifacts";
import prisma from "@/lib/prisma";
import { ApiResponse } from "@/lib/schema/api";
import { ExecuteDriftParams, ExecuteDriftSchema } from "@/lib/schema/drift";
import { getDriftCost } from "@/lib/drift/drift-cost";
import { isOnLand, loadLandGeoJson } from "@/lib/node-spawn/node-generator";
import {
  DRIFT_COOL_DOWN_DAYS,
  DRIFT_GRACE_PERIOD_DAYS,
  DRIFT_PERSONAL_LOCK_HOURS,
} from "@/config/drift";
import { getH3Index } from "@/lib/utils/resonance-surge/h3-utils";
import { generateRandomPointInHex } from "@/lib/api-helpers/server/resonance-surge/spawn-surge-nodes";
import { calculateDistance } from "@/lib/utils";

// ============================================================================
// EXECUTE DRIFT V2.0
// ============================================================================

/**
 * Execute drift operation - summon a dormant node to user's vicinity
 *
 * V2.0 Changes:
 * - Density-based eligibility (0-5 nodes instead of binary 0 nodes)
 * - Reduced cooldown (3 days → 2 days)
 * - Grace period tracking (7 days)
 * - Personal lock tracking (72 hours)
 * - Updated cost calculation with new formula
 *
 * @param params - Drift execution parameters
 * @returns Success response with new node location, or error
 */
export async function executeDrift(params: ExecuteDriftParams): Promise<
  ApiResponse<{
    cost: number;
    newLocation: {
      lat: number;
      lon: number;
    };
    nodeId: string;
  }>
> {
  try {
    // ========================================================================
    // STEP 1: VALIDATE REQUEST
    // ========================================================================

    const { success, data } = ExecuteDriftSchema.safeParse(params);

    if (!success) {
      return { success: false, error: "Invalid Request" };
    }

    const { accessToken, latitude, longitude, nodeId } = data;

    // ========================================================================
    // STEP 2: VERIFY USER AUTHENTICATION
    // ========================================================================

    const { id: userId, username } = await verifyTokenAndGetUser(accessToken);

    // ========================================================================
    // STEP 3: VALIDATE GEOLOCATION (ANTI-SPOOFING)
    // ========================================================================

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

    // ========================================================================
    // STEP 4: CHECK DENSITY-BASED ELIGIBILITY (V2.0)
    // ========================================================================

    const eligibility = await checkDriftEligibility({
      userLat: latitude,
      userLng: longitude,
    });

    if (!eligibility.eligible) {
      return {
        success: false,
        error: `Too many nodes nearby (${eligibility.nodeCount} within 10km). You have ${eligibility.densityTier} density.`,
      };
    }

    // ========================================================================
    // STEP 5: VALIDATE USER AND NODE
    // ========================================================================

    const [user, node, geojson] = await Promise.all([
      // Check user exists and cooldown is satisfied
      prisma.user.findUnique({
        where: {
          id: userId,
          OR: [
            { lastDriftAt: null },
            { lastDriftAt: { lte: subDays(new Date(), DRIFT_COOL_DOWN_DAYS) } },
          ],
        },
        select: {
          driftCount: true,
          sharePoints: true,
          lastDriftAt: true,
          guildMembership: {
            where: { isActive: true },
            select: { guildId: true },
          },
        },
      }),
      // Check node is eligible and within 100km
      getEligibleNodeForDrift({
        nodeId,
        userLat: latitude,
        userLng: longitude,
      }),
      // Load land geojson for placement validation
      loadLandGeoJson(),
    ]);

    // Validate node eligibility
    if (!node || !user) {
      return {
        success: false,
        error:
          "Node cannot be summoned (inactive, recently drifted, or out of range)",
      };
    }

    // ========================================================================
    // STEP 6: CALCULATE COST WITH V2.0 FORMULA
    // ========================================================================

    const costResult = getDriftCost({
      distance: node.distance,
      driftCount: user.driftCount,
      rarity: node.rarity,
      nodeCountWithin10km: eligibility.nodeCount,
    });

    // Double-check eligibility from cost calculation
    if (!costResult.eligible) {
      return {
        success: false,
        error: "Drift not available in your current area",
      };
    }

    const cost = costResult.cost;

    // ========================================================================
    // STEP 7: VALIDATE USER SHAREPOINTS BALANCE
    // ========================================================================

    if (user.sharePoints < cost) {
      return {
        success: false,
        error: `Insufficient sharePoints. Need ${cost} SP, have ${user.sharePoints} SP.`,
      };
    }

    // ========================================================================
    // STEP 8: CALCULATE NEW NODE LOCATION (2-8KM SCATTER)
    // ========================================================================

    const locationH3Index = getH3Index(latitude, longitude);

    if (!isOnLand(longitude, latitude, geojson)) {
      return {
        success: false,
        error: "Unable to find valid land placement. Try different location.",
      };
    }

    const randomLocation = generateRandomPointInHex(locationH3Index, geojson);

    // ========================================================================
    // STEP 9: EXECUTE DRIFT TRANSACTION
    // ========================================================================

    const newH3Index = getH3Index(randomLocation.lat, randomLocation.lng);

    const now = new Date();
    const gracePeriodEndsAt = addDays(now, DRIFT_GRACE_PERIOD_DAYS);
    const personalLockEndsAt = new Date(
      now.getTime() + DRIFT_PERSONAL_LOCK_HOURS * 60 * 60 * 1000,
    );

    const guildControlled = await prisma.territory.findUnique({
      where: { hexId: newH3Index, guildId: { not: null } },
      select: { hexId: true },
    });

    await prisma.$transaction(async (tx) => {
      // Update user: deduct SP, increment drift count, update timestamps
      await tx.user.update({
        where: { id: userId },
        data: {
          sharePoints: { decrement: cost },
          driftCount: { increment: 1 },
          lastDriftAt: now,
          lastDriftNodeId: nodeId, // V2.0: Track last drifted node
        },
        select: { id: true },
      });

      // Update node: move to new location, clear territory
      await tx.node.update({
        where: { id: nodeId },
        data: {
          latitude: randomLocation.lat,
          longitude: randomLocation.lng,
          territoryHexId: guildControlled ? guildControlled.hexId : null, // place node in territory if guid controlled
        },
        select: { id: true },
      });

      // Create drift log with V2.0 timestamps
      await tx.nodeDrift.create({
        data: {
          userId,
          nodeId,
          originalLatitude: node.latitude,
          originalLongitude: node.longitude,
          newLatitude: randomLocation.lat,
          newLongitude: randomLocation.lng,
          sharePointsCost: cost,
          nodeRarity: node.rarity,
          driftRadius: calculateDistance(
            randomLocation.lat,
            randomLocation.lng,
            latitude,
            longitude,
          ), // distance from old to new node location
          originalDistance: node.distance,
          timestamp: now,
          gracePeriodEndsAt, // V2.0: 7-day grace period
          personalLockEndsAt, // V2.0: 72-hour personal lock
        },
      });
    });

    // ========================================================================
    // STEP 10: AWARD ECHO SHARDS (GUILD ARTIFACT SYSTEM)
    // ========================================================================

    // Award 1 Echo Shard for drift activity (contributes to guild artifacts)
    // Only if user is in a guild - otherwise no artifact system for solo players

    if (user.guildMembership?.guildId) {
      await addEchoShards(user.guildMembership.guildId, username, "DRIFTING", {
        driftDistance: node.distance,
        driftCount: user.driftCount + 1,
      });
    }

    // ========================================================================
    // STEP 11: REVALIDATE PATHS AND RETURN SUCCESS
    // ========================================================================

    revalidatePath("/resonant-drift");
    revalidatePath(`/nodes/${nodeId}`);
    revalidatePath("/map");

    return {
      success: true,
      data: {
        cost,
        newLocation: {
          lat: randomLocation.lat,
          lon: randomLocation.lng,
        },
        nodeId,
      },
    };
  } catch (error) {
    console.error("Execute drift error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to execute drift",
    };
  }
}

// ============================================================================
// HELPER: GET DRIFT STATUS FOR USER
// ============================================================================

/**
 * Get detailed drift status for a user
 * Used for UI to show cooldown, eligibility, etc.
 *
 * @param userId - User ID
 * @param latitude - User latitude
 * @param longitude - User longitude
 * @returns Drift status with eligibility and cooldown info
 */
export async function getDriftStatus(
  userId: string,
  latitude: number,
  longitude: number,
): Promise<
  ApiResponse<{
    canDrift: boolean;
    reason?: string;
    cooldownEndsAt?: Date;
    densityInfo: {
      nodeCount: number;
      densityTier: string;
      multiplier: number | null;
    };
    lastDriftNodeId?: string | null;
  }>
> {
  try {
    // Get user drift data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        lastDriftAt: true,
        lastDriftNodeId: true,
      },
    });

    // Check cooldown
    let cooldownEndsAt: Date | undefined;
    if (user?.lastDriftAt) {
      cooldownEndsAt = addDays(user.lastDriftAt, DRIFT_COOL_DOWN_DAYS);

      if (cooldownEndsAt > new Date()) {
        const eligibility = await checkDriftEligibility({
          userLat: latitude,
          userLng: longitude,
        });

        return {
          success: true,
          data: {
            canDrift: false,
            reason: "Cooldown active",
            cooldownEndsAt,
            densityInfo: eligibility,
            lastDriftNodeId: user.lastDriftNodeId,
          },
        };
      }
    }

    // Check density eligibility
    const eligibility = await checkDriftEligibility({
      userLat: latitude,
      userLng: longitude,
    });

    if (!eligibility.eligible) {
      return {
        success: true,
        data: {
          canDrift: false,
          reason: `Too many nodes nearby (${eligibility.nodeCount} within 10km)`,
          densityInfo: eligibility,
          lastDriftNodeId: user?.lastDriftNodeId,
        },
      };
    }

    return {
      success: true,
      data: {
        canDrift: true,
        densityInfo: eligibility,
        lastDriftNodeId: user?.lastDriftNodeId,
      },
    };
  } catch (error) {
    console.error("Get drift status error:", error);
    return {
      success: false,
      error: "Failed to get drift status",
    };
  }
}
