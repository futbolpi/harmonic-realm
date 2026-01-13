import { subDays } from "date-fns";

import prisma from "@/lib/prisma";
import { DriftQueryResponse } from "@/lib/schema/drift";
import {
  ALLOWED_INACTIVITY_DAYS,
  DRIFT_COOL_DOWN_DAYS,
  MAX_DRIFT_DISTANCE_KM,
} from "@/config/drift";

interface EligibleDriftParams {
  userLat: number;
  userLng: number;
}

interface EligibleNodeParams extends EligibleDriftParams {
  nodeId: string;
}

type EligibleNodeQueryResponse = DriftQueryResponse & { distance: number };

export const getEligibleNodesForDrift = async ({
  userLat,
  userLng,
}: EligibleDriftParams): Promise<DriftQueryResponse[]> => {
  // First, check if any nodes within 10km (to disable drift)
  const nearbyCount = await prisma.$queryRaw<
    { count: bigint }[]
  >`SELECT COUNT(*) FROM "nodes" WHERE (6371 * acos(cos(radians(${userLat})) * cos(radians("latitude")) * cos(radians("longitude") - radians(${userLng})) + sin(radians(${userLat})) * sin(radians("latitude")))) < 10;`;
  if (parseInt(nearbyCount[0].count.toString()) > 0) return [];

  //   Fetch eligible nodes within 100km
  const eligibleNodes = await prisma.$queryRaw<DriftQueryResponse[]>`
    SELECT n.id, n.latitude, n.longitude, n.territoryHexId, nt.rarity, nt."maxMiners",
    (6371 * acos(cos(radians(${userLat})) * cos(radians(n.latitude)) * cos(radians(n.longitude) - radians(${userLng})) + sin(radians(${userLat})) * sin(radians(n.latitude)))) AS distance
    FROM "nodes" n
    JOIN "node_types" nt ON n."typeId" = nt.id
    LEFT JOIN "location_lore" ll ON n.id = ll."nodeId"
    LEFT JOIN (SELECT "nodeId", MAX(timestamp) as lastTune FROM "TuningSession" GROUP BY "nodeId") ts ON n.id = ts."nodeId"
    WHERE n.sponsor IS NULL
      AND (ll.id IS NULL OR ll."basicHistory" IS NULL)
      AND n."openForMining" = true
      AND (n."territoryHexId" IS NULL)
      AND (SELECT COUNT(*) FROM "mining_sessions" ms WHERE ms."nodeId" = n.id) < nt."maxMiners"
      AND (ts.lastTune IS NULL OR ts.lastTune < ${subDays(new Date(), 7)})
      AND (6371 * acos(cos(radians(${userLat})) * cos(radians(n.latitude)) * cos(radians(n.longitude) - radians(${userLng})) + sin(radians(${userLat})) * sin(radians(n.latitude)))) <= 100
    ORDER BY distance ASC
    LIMIT 10;  
  `;

  return eligibleNodes;
  // Append costs to results (server-side calc)
  //   eligibleNodes.forEach((node) => {
  //     const rarityIndex = {
  //       Common: 1,
  //       Uncommon: 2,
  //       Rare: 3,
  //       Epic: 4,
  //       Legendary: 5,
  //     }[node.rarity];
  //     node.cost = user.driftCount === 0 ? 50 : 50 * rarityIndex ** 2;
  //   });
  //   return { canDrift: true, nodes: eligibleNodes };
};

export const getEligibleNodeForDrift = async ({
  userLat,
  userLng,
  nodeId,
}: EligibleNodeParams): Promise<EligibleNodeQueryResponse | null> => {
  //   Fetch eligible nodes within 100km
  const result = await prisma.$queryRaw<EligibleNodeQueryResponse[]>`
    SELECT n.id, n.latitude, n.longitude, n.territoryHexId, nt.rarity, nt."maxMiners",
    (6371 * acos(cos(radians(${userLat})) * cos(radians(n.latitude)) * cos(radians(n.longitude) - radians(${userLng})) + sin(radians(${userLat})) * sin(radians(n.latitude)))) AS distance
    FROM "nodes" n
    JOIN "node_types" nt ON n."typeId" = nt.id
    LEFT JOIN "location_lore" ll ON n.id = ll."nodeId"
    LEFT JOIN (SELECT "nodeId", MAX(timestamp) as lastTune FROM "TuningSession" GROUP BY "nodeId") ts ON n.id = ts."nodeId"
    LEFT JOIN (SELECT "nodeId", MAX(timestamp) as lastDrift FROM "node_drifts" GROUP BY "nodeId") nd ON n.id = nd."nodeId"
    WHERE n.id = ${nodeId} 
      AND n.sponsor IS NULL
      AND (ll.id IS NULL OR ll."basicHistory" IS NULL)
      AND n."openForMining" = true
      AND (n."territoryHexId" IS NULL)
      AND (SELECT COUNT(*) FROM "mining_sessions" ms WHERE ms."nodeId" = n.id) < nt."maxMiners"
       AND (ts.lastTune IS NULL OR ts.lastTune < ${subDays(
         new Date(),
         ALLOWED_INACTIVITY_DAYS
       )})  
      AND (nd.lastDrift IS NULL OR nd.lastDrift < ${subDays(
        new Date(),
        DRIFT_COOL_DOWN_DAYS
      )}) 
      AND (6371 * acos(cos(radians(${userLat})) * cos(radians(n.latitude)) * cos(radians(n.longitude) - radians(${userLng})) + sin(radians(${userLat})) * sin(radians(n.latitude)))) <= ${MAX_DRIFT_DISTANCE_KM}
    ORDER BY distance ASC
    LIMIT 1;  
  `;

  // The result will be an array; take the first (and only) element
  const eligibleNode: EligibleNodeQueryResponse | undefined = result?.[0];

  return eligibleNode ? eligibleNode : null;
  // Append costs to results (server-side calc)
  //   eligibleNodes.forEach((node) => {
  //     const rarityIndex = {
  //       Common: 1,
  //       Uncommon: 2,
  //       Rare: 3,
  //       Epic: 4,
  //       Legendary: 5,
  //     }[node.rarity];
  //     node.cost = user.driftCount === 0 ? 50 : 50 * rarityIndex ** 2;
  //   });
  //   return { canDrift: true, nodes: eligibleNodes };
};

export const getDriftOpportunities = async () => {
  //   Fetch all eligible nodes without distance constraint
  const eligibleNodes = await prisma.$queryRaw<DriftQueryResponse[]>`
    SELECT n.id, n.latitude, n.longitude, n.territoryHexId, nt.rarity, nt."maxMiners"
    FROM "nodes" n
    JOIN "node_types" nt ON n."typeId" = nt.id
    LEFT JOIN "location_lore" ll ON n.id = ll."nodeId"
    LEFT JOIN (SELECT "nodeId", MAX(timestamp) as lastTune FROM "TuningSession" GROUP BY "nodeId") ts ON n.id = ts."nodeId"
    LEFT JOIN (SELECT "nodeId", MAX(timestamp) as lastDrift FROM "node_drifts" GROUP BY "nodeId") nd ON n.id = nd."nodeId"
    WHERE n.sponsor IS NULL
      AND (ll.id IS NULL OR ll."basicHistory" IS NULL)
      AND n."openForMining" = true
      AND (n."territoryHexId" IS NULL)
      AND (SELECT COUNT(*) FROM "mining_sessions" ms WHERE ms."nodeId" = n.id) < nt."maxMiners"
      AND (ts.lastTune IS NULL OR ts.lastTune < ${subDays(
        new Date(),
        ALLOWED_INACTIVITY_DAYS
      )})  
      AND (nd.lastDrift IS NULL OR nd.lastDrift < ${subDays(
        new Date(),
        DRIFT_COOL_DOWN_DAYS
      )})  
  `;

  return eligibleNodes;
};
