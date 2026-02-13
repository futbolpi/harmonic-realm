import { addDays, subDays } from "date-fns";

import prisma from "@/lib/prisma";
import { DriftQueryResponse } from "@/lib/schema/drift";
import {
  ALLOWED_INACTIVITY_DAYS,
  DRIFT_COOL_DOWN_DAYS,
  MAX_DRIFT_DISTANCE_KM,
  VOID_ZONE_RADIUS_KM,
  getDensityTier,
} from "@/config/drift";
import { NodeGenEvent } from "@/lib/generated/prisma/enums";

// ============================================================================
// DRIFT ELIGIBILITY HELPERS V2.0
// ============================================================================

interface EligibleDriftParams {
  userLat: number;
  userLng: number;
}

interface EligibleNodeParams extends EligibleDriftParams {
  nodeId: string;
}

type EligibleNodeQueryResponse = DriftQueryResponse & { distance: number };

const resonanceSurge = NodeGenEvent.ResonanceSurge;

/**
 * Check if user is in a drift-eligible zone based on node density
 * v2.0: Returns density tier info instead of binary yes/no
 *
 * @param userLat - User latitude
 * @param userLng - User longitude
 * @returns Density tier information with eligibility status
 */
export const checkDriftEligibility = async ({
  userLat,
  userLng,
}: EligibleDriftParams): Promise<{
  eligible: boolean;
  nodeCount: number;
  densityTier: string;
  multiplier: number | null;
}> => {
  // Count nodes within void zone radius (10km)
  const nearbyCount = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) 
    FROM "nodes" 
    WHERE (6371 * acos(
      cos(radians(${userLat})) * cos(radians("latitude")) * 
      cos(radians("longitude") - radians(${userLng})) + 
      sin(radians(${userLat})) * sin(radians("latitude"))
    )) < ${VOID_ZONE_RADIUS_KM}
  `;

  const nodeCount = parseInt(nearbyCount[0].count.toString());
  const tier = getDensityTier(nodeCount);

  return {
    eligible: tier.multiplier !== null,
    nodeCount,
    densityTier: tier.label,
    multiplier: tier.multiplier,
  };
};

/**
 * Get all eligible nodes for drift within 100km
 * v2.0: No longer filters by void zone (handled by checkDriftEligibility)
 *
 * @param userLat - User latitude
 * @param userLng - User longitude
 * @returns List of drift-eligible nodes with distances
 */
export const getEligibleNodesForDrift = async ({
  userLat,
  userLng,
}: EligibleDriftParams): Promise<DriftQueryResponse[]> => {
  // First check if user is in drift-eligible zone
  const eligibility = await checkDriftEligibility({ userLat, userLng });

  if (!eligibility.eligible) {
    return [];
  }

  // Fetch eligible nodes within 100km
  // Node is eligible if:
  // 1. Not sponsored (no Resonant Anchor)
  // 2. No location lore staked
  // 3. Open for mining
  // 4. Not in a territory
  // 5. Not at max capacity
  // 6. Inactive for 7+ days (no recent tuning)
  // 7. Not recently drifted (grace period expired)
  // 8. Within 100km distance
  const eligibleNodes = await prisma.$queryRaw<DriftQueryResponse[]>`
    SELECT 
      n.id, 
      n.latitude, 
      n.longitude, 
      -- n."territoryHexId", 
      -- n."genEvent", 
      nt.rarity, 
      nt."maxMiners",
      (6371 * acos(
        cos(radians(${userLat})) * cos(radians(n.latitude)) * 
        cos(radians(n.longitude) - radians(${userLng})) + 
        sin(radians(${userLat})) * sin(radians(n.latitude))
      )) AS distance
    FROM "nodes" n
    JOIN "node_types" nt ON n."typeId" = nt.id
    LEFT JOIN "location_lore" ll ON n.id = ll."nodeId"
    LEFT JOIN (
      SELECT "nodeId", MAX(timestamp) as "lastTune" 
      FROM "TuningSession" 
      GROUP BY "nodeId"
    ) ts ON n.id = ts."nodeId"
    LEFT JOIN (
      SELECT "nodeId", MAX("gracePeriodEndsAt") as "lastGracePeriod"
      FROM "node_drifts"
      GROUP BY "nodeId"
    ) nd ON n.id = nd."nodeId"
    WHERE 
      -- Not sponsored or staked
      n.sponsor IS NULL
      AND (ll.id IS NULL OR ll."basicHistory" IS NULL)
      
      -- Exclude temporary Surge-generated nodes
      AND n."genEvent" != ${resonanceSurge}::"NodeGenEvent"
      
      -- Available for mining
      AND n."openForMining" = true
      AND (n."territoryHexId" IS NULL)
      AND (SELECT COUNT(*) FROM "mining_sessions" ms WHERE ms."nodeId" = n.id) < nt."maxMiners"
      
      -- Inactive for 7+ days
      AND (ts."lastTune" IS NULL OR ts."lastTune" < ${subDays(new Date(), ALLOWED_INACTIVITY_DAYS)})
      
      -- Grace period expired (v2.0: 7 days instead of 72 hours)
      AND (nd."lastGracePeriod" IS NULL OR nd."lastGracePeriod" < NOW())
      
      -- Within 100km but outside void zone
      AND (6371 * acos(
        cos(radians(${userLat})) * cos(radians(n.latitude)) * 
        cos(radians(n.longitude) - radians(${userLng})) + 
        sin(radians(${userLat})) * sin(radians(n.latitude))
      )) BETWEEN ${VOID_ZONE_RADIUS_KM} AND ${MAX_DRIFT_DISTANCE_KM}
    
    ORDER BY distance ASC
    LIMIT 50
  `;

  return eligibleNodes;
};

/**
 * Get a specific eligible node for drift validation
 * v2.0: Updated with grace period check instead of cooldown
 *
 * @param nodeId - Target node ID
 * @param userLat - User latitude
 * @param userLng - User longitude
 * @returns Eligible node with distance, or null if not eligible
 */
export const getEligibleNodeForDrift = async ({
  userLat,
  userLng,
  nodeId,
}: EligibleNodeParams): Promise<EligibleNodeQueryResponse | null> => {
  const result = await prisma.$queryRaw<EligibleNodeQueryResponse[]>`
    SELECT 
      n.id, 
      n.latitude, 
      n.longitude, 
      -- n."territoryHexId", 
      -- n."genEvent", 
      nt.rarity, 
      nt."maxMiners",
      (6371 * acos(
        cos(radians(${userLat})) * cos(radians(n.latitude)) * 
        cos(radians(n.longitude) - radians(${userLng})) + 
        sin(radians(${userLat})) * sin(radians(n.latitude))
      )) AS distance
    FROM "nodes" n
    JOIN "node_types" nt ON n."typeId" = nt.id
    LEFT JOIN "location_lore" ll ON n.id = ll."nodeId"
    LEFT JOIN (
      SELECT "nodeId", MAX(timestamp) as "lastTune" 
      FROM "TuningSession" 
      GROUP BY "nodeId"
    ) ts ON n.id = ts."nodeId"
    LEFT JOIN (
      SELECT "nodeId", MAX("gracePeriodEndsAt") as "lastGracePeriod"
      FROM "node_drifts"
      GROUP BY "nodeId"
    ) nd ON n.id = nd."nodeId"
    WHERE 
      n.id = ${nodeId}
      
      -- Not sponsored or staked
      AND n.sponsor IS NULL
      AND (ll.id IS NULL OR ll."basicHistory" IS NULL)
      
      -- Exclude temporary Surge-generated nodes
      AND n."genEvent" != ${resonanceSurge}::"NodeGenEvent"
      
      -- Available for mining
      AND n."openForMining" = true
      AND (n."territoryHexId" IS NULL)
      AND (SELECT COUNT(*) FROM "mining_sessions" ms WHERE ms."nodeId" = n.id) < nt."maxMiners"
      
      -- Inactive for 7+ days
      AND (ts."lastTune" IS NULL OR ts."lastTune" < ${subDays(new Date(), ALLOWED_INACTIVITY_DAYS)})
      
      -- Grace period expired (v2.0: 7 days)
      AND (nd."lastGracePeriod" IS NULL OR nd."lastGracePeriod" < NOW())
      
      -- Within valid drift range
      AND (6371 * acos(
        cos(radians(${userLat})) * cos(radians(n.latitude)) * 
        cos(radians(n.longitude) - radians(${userLng})) + 
        sin(radians(${userLat})) * sin(radians(n.latitude))
      )) BETWEEN ${VOID_ZONE_RADIUS_KM} AND ${MAX_DRIFT_DISTANCE_KM}
    
    ORDER BY distance ASC
    LIMIT 1
  `;

  return result?.[0] ?? null;
};

/**
 * Get all drift opportunity nodes (for global drift page)
 * No distance constraint, returns all eligible nodes
 *
 * @returns List of all drift-eligible nodes globally
 */
export const getDriftOpportunities = async (): Promise<
  DriftQueryResponse[]
> => {
  const eligibleNodes = await prisma.$queryRaw<DriftQueryResponse[]>`
    SELECT 
      n.id, 
      n.latitude, 
      n.longitude, 
      -- n."territoryHexId", 
      -- n."genEvent", 
      nt.rarity, 
      nt."maxMiners"
    FROM "nodes" n
    JOIN "node_types" nt ON n."typeId" = nt.id
    LEFT JOIN "location_lore" ll ON n.id = ll."nodeId"
    LEFT JOIN (
      SELECT "nodeId", MAX(timestamp) as "lastTune" 
      FROM "TuningSession" 
      GROUP BY "nodeId"
    ) ts ON n.id = ts."nodeId"
    LEFT JOIN (
      SELECT "nodeId", MAX("gracePeriodEndsAt") as "lastGracePeriod"
      FROM "node_drifts"
      GROUP BY "nodeId"
    ) nd ON n.id = nd."nodeId"
    WHERE 
      -- Not sponsored or staked
      n.sponsor IS NULL
      AND (ll.id IS NULL OR ll."basicHistory" IS NULL)

      -- Exclude temporary Surge-generated nodes
      AND n."genEvent" != ${resonanceSurge}::"NodeGenEvent"
      
      -- Available for mining
      AND n."openForMining" = true
      AND (n."territoryHexId" IS NULL)
      AND (SELECT COUNT(*) FROM "mining_sessions" ms WHERE ms."nodeId" = n.id) < nt."maxMiners"
      
      -- Inactive for 7+ days
      AND (ts."lastTune" IS NULL OR ts."lastTune" < ${subDays(new Date(), ALLOWED_INACTIVITY_DAYS)})
      
      -- Grace period expired
      AND (nd."lastGracePeriod" IS NULL OR nd."lastGracePeriod" < NOW())
  `;

  return eligibleNodes;
};

/**
 * Check if a specific user can drift a specific node
 * Validates user cooldown and density eligibility
 *
 * @param userId - User ID
 * @param userLat - User latitude
 * @param userLng - User longitude
 * @returns Whether user can drift and any error message
 */
export const canUserDrift = async ({
  userId,
  userLat,
  userLng,
}: {
  userId: string;
  userLat: number;
  userLng: number;
}): Promise<{
  canDrift: boolean;
  error?: string;
  densityInfo?: {
    nodeCount: number;
    densityTier: string;
    multiplier: number | null;
  };
}> => {
  // Check user cooldown (v2.0: 2 days instead of 3)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastDriftAt: true },
  });

  if (user?.lastDriftAt) {
    const cooldownEnd = addDays(user.lastDriftAt, DRIFT_COOL_DOWN_DAYS);
    const now = new Date();

    if (cooldownEnd > now) {
      const hoursRemaining = Math.ceil(
        (cooldownEnd.getTime() - now.getTime()) / (1000 * 60 * 60),
      );
      return {
        canDrift: false,
        error: `Cooldown active. ${hoursRemaining}h remaining.`,
      };
    }
  }

  // Check density eligibility
  const eligibility = await checkDriftEligibility({ userLat, userLng });

  if (!eligibility.eligible) {
    return {
      canDrift: false,
      error: `Too many nodes nearby (${eligibility.nodeCount} within 10km). Drift only available in sparse areas.`,
      densityInfo: eligibility,
    };
  }

  return {
    canDrift: true,
    densityInfo: eligibility,
  };
};
