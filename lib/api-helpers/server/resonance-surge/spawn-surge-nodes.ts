import { format, addDays } from "date-fns";
import * as turf from "@turf/turf";
import type {
  FeatureCollection,
  GeoJsonProperties,
  MultiPolygon,
  Polygon,
} from "geojson";
import { cellToBoundary } from "h3-js";

import { isOnLand } from "@/lib/node-spawn/node-generator";
import { selectSpawnHexes } from "@/lib/utils/resonance-surge/activity-scoring";
import { calculateDailyNodeCount } from "@/lib/utils/resonance-surge/node-count";
import prisma from "@/lib/prisma";
import { loadLandGeoJson } from "@/lib/node-spawn/node-generator";

/**
 * SEED HEXES: Fallback locations for zero-activity scenarios
 * Priority: Territory-controlled hexes > Major city hexes
 *
 * Major cities are hardcoded as fallback (H3 resolution 7)
 * Updated at runtime with territory hexes from database
 */
const MAJOR_CITY_SEED_HEXES = [
  "872a1072bffffff", // New York City
  "8728308281fffff", // Los Angeles
  "87283082c3fffff", // Chicago
  "872830828bfffff", // Houston
  "8728308289fffff", // Phoenix
  "872a100737fffff", // Philadelphia
  "8728e4b2c7fffff", // San Antonio
  "8729a46c27fffff", // San Diego
  "872a1072b7fffff", // Dallas
  "8728308367fffff", // San Jose
  "872830870ffffff", // Austin
  "8729864c0ffffff", // Jacksonville
  "8728e4b313fffff", // Fort Worth
  "8728308283fffff", // Columbus
  "872830886ffffff", // San Francisco
  "8728e5ba8bfffff", // Charlotte
  "872a107293fffff", // Indianapolis
  "872830889ffffff", // Seattle
  "8729a1a68bfffff", // Denver
  "872a100723fffff", // Washington DC
  "8728308297fffff", // Boston
  "8729408d6ffffff", // El Paso
  "8728e49b2ffffff", // Detroit
  "8729a1a697fffff", // Nashville
  "872a107287fffff", // Baltimore
  // International Major Cities
  "871fb46757fffff", // London
  "871fb46747fffff", // Paris
  "871fb28507fffff", // Tokyo
  "87194906d7fffff", // Beijing
  "871ea6936ffffff", // Moscow
  "871ea5188bfffff", // Dubai
  "871e8659d7fffff", // Singapore
  "871ea78ccffffff", // Sydney
  "871fa9948bfffff", // Berlin
  "871e26499ffffff", // Mumbai
  "871e2659cffffff", // Lagos
  "871e866537fffff", // Seoul
  "871ea6516ffffff", // Istanbul
  "871fb4670ffffff", // Madrid
  "871ea78d37fffff", // Melbourne
  "871ea5a88bfffff", // Toronto
  "871e868d6ffffff", // Bangkok
  "871e8698cffffff", // Jakarta
  "871ea6a4d7fffff", // Cairo
  "871fb28517fffff", // Osaka
];

/**
 * DIVERSITY PENALTY THRESHOLD
 * If a hex receives more than this percentage of total spawns, apply penalty
 */
const DIVERSITY_PENALTY_THRESHOLD = 0.15; // 15% max per hex

/**
 * Generates random point within H3 hex that is guaranteed to be on land
 * Retries up to 50 times, falls back to hex center if all fail
 *
 * ENHANCED: Added retry limit logging and better error handling
 */
export function generateRandomPointInHex(
  h3Index: string,
  landGeoJSON: FeatureCollection<Polygon | MultiPolygon, GeoJsonProperties>,
): { lat: number; lng: number } {
  const boundary = cellToBoundary(h3Index, true); // [[lng, lat], ...]
  const polygon = turf.polygon([boundary]);
  const bbox = turf.bbox(polygon);

  let attempts = 0;
  const MAX_ATTEMPTS = 50;

  while (attempts < MAX_ATTEMPTS) {
    const randomLng = bbox[0] + Math.random() * (bbox[2] - bbox[0]);
    const randomLat = bbox[1] + Math.random() * (bbox[3] - bbox[1]);
    const point = turf.point([randomLng, randomLat]);

    // Check if point is within hex AND on land
    if (
      turf.booleanPointInPolygon(point, polygon) &&
      isOnLand(randomLng, randomLat, landGeoJSON)
    ) {
      return { lat: randomLat, lng: randomLng };
    }

    attempts++;
  }

  // Fallback: return hex center (may be in water, but prevents failure)
  const center = turf.centroid(polygon);
  const [lng, lat] = center.geometry.coordinates;

  console.warn(
    `Could not find land point in hex ${h3Index} after ${MAX_ATTEMPTS} attempts, using center`,
  );
  return { lat, lng };
}

/**
 * Pre-fetch node types once to avoid repeated DB calls
 * PERFORMANCE: Single query for all rarities
 */
async function getNodeTypesForSurge() {
  const allTypes = await prisma.nodeType.findMany({
    where: { rarity: { in: ["Rare", "Epic", "Legendary"] } },
    select: { id: true, name: true, rarity: true },
  });
  const rareTypes = allTypes.filter((type) => type.rarity === "Rare");
  const epicTypes = allTypes.filter((type) => type.rarity === "Epic");
  const legendaryTypes = allTypes.filter((type) => type.rarity === "Legendary");

  return { rareTypes, epicTypes, legendaryTypes };
}

/**
 * Select random node type based on weighted probability
 * 80% Rare, 15% Epic, 5% Legendary
 */
function selectRandomNodeType(
  nodeTypesCache: Awaited<ReturnType<typeof getNodeTypesForSurge>>,
): string {
  const rand = Math.random();

  if (rand < 0.8) {
    // 60% Rare
    const types = nodeTypesCache.rareTypes;
    return types[Math.floor(Math.random() * types.length)].id;
  } else if (rand < 0.95) {
    // 30% Epic
    const types = nodeTypesCache.epicTypes;
    return types[Math.floor(Math.random() * types.length)].id;
  } else {
    // 10% Legendary
    const types = nodeTypesCache.legendaryTypes;
    return types[Math.floor(Math.random() * types.length)].id;
  }
}

/**
 * ENHANCED: Get seed hexes with territory-first priority
 *
 * Priority Order:
 * 1. Territory-controlled hexes (from guild Territory table)
 * 2. Major city hexes (hardcoded fallback)
 *
 * @returns Object with combined seed hexes and counts
 */
async function getSeedHexes(): Promise<{
  seedHexes: string[];
  territorySeedCount: number;
  citySeedCount: number;
}> {
  // Fetch territory-controlled hexes from database
  const territories = await prisma.territory.findMany({
    where: {
      guildId: { not: null }, // Only controlled territories
    },
    select: { hexId: true },
    distinct: ["hexId"],
  });

  const territoryHexes = territories.map((t) => t.hexId);

  // Combine: territories first, then cities (avoid duplicates)
  const cityHexesFiltered = MAJOR_CITY_SEED_HEXES.filter(
    (hex) => !territoryHexes.includes(hex),
  );

  return {
    seedHexes: [...territoryHexes, ...cityHexesFiltered],
    territorySeedCount: territoryHexes.length,
    citySeedCount: cityHexesFiltered.length,
  };
}

/**
 * ENHANCED: Apply diversity penalty to prevent geographic clustering
 *
 * Algorithm:
 * 1. Calculate each hex's spawn allocation
 * 2. If any hex exceeds DIVERSITY_PENALTY_THRESHOLD (15%), cap it
 * 3. Redistribute excess nodes to other hexes (weighted by remaining capacity)
 *
 * @param hexAllocations - Initial spawn allocations by hex
 * @param totalNodes - Total nodes to spawn
 * @returns Rebalanced allocations with diversity enforced
 */
function applyDiversityPenalty(
  hexAllocations: Map<string, number>,
  totalNodes: number,
): {
  rebalancedAllocations: Map<string, number>;
  penalizedHexCount: number;
} {
  const maxNodesPerHex = Math.floor(totalNodes * DIVERSITY_PENALTY_THRESHOLD);
  const rebalanced = new Map<string, number>();
  let excessNodes = 0;
  let penalizedCount = 0;

  // Step 1: Cap over-represented hexes
  for (const [h3Index, count] of hexAllocations.entries()) {
    if (count > maxNodesPerHex) {
      rebalanced.set(h3Index, maxNodesPerHex);
      excessNodes += count - maxNodesPerHex;
      penalizedCount++;
    } else {
      rebalanced.set(h3Index, count);
    }
  }

  // Step 2: Redistribute excess nodes to under-represented hexes
  if (excessNodes > 0) {
    const eligibleHexes = Array.from(rebalanced.entries()).filter(
      ([, count]) => count < maxNodesPerHex,
    );

    // Distribute excess evenly across eligible hexes
    const nodesPerEligibleHex = Math.floor(excessNodes / eligibleHexes.length);
    let remainder = excessNodes % eligibleHexes.length;

    for (const [h3Index, currentCount] of eligibleHexes) {
      const additionalNodes = nodesPerEligibleHex + (remainder > 0 ? 1 : 0);
      rebalanced.set(h3Index, currentCount + additionalNodes);
      if (remainder > 0) remainder--;
    }
  }

  return {
    rebalancedAllocations: rebalanced,
    penalizedHexCount: penalizedCount,
  };
}

/**
 * Generate lore snippet for surge nodes
 */
function generateSurgeLore(activityScore: number, rank: number): string {
  const templates = [
    `A resonance surge of magnitude ${activityScore.toFixed(1)} detected. The Lattice pulses with unstable energy.`,
    `Harmonic anomaly #${rank}: This node emerged from collective Pioneer activity in the region.`,
    `The frequency grid trembles here. Mine quickly before this surge dissipates into the void.`,
    `A temporary rift in the Lattice. Anchor this node to make it permanent.`,
  ];
  return templates[rank % templates.length];
}

/**
 * MAIN FUNCTION: Spawn Surge Nodes with Edge Case Handling
 *
 * ENHANCEMENTS:
 * 1. Zero Activity Fallback: Uses seed hexes (territories > cities)
 * 2. Diversity Penalty: Prevents single-hex oversaturation
 * 3. Efficient DB Queries: Single transaction for all node creation
 * 4. Territory Association: Attaches nodes to controlled territories via single lookup
 *
 * @param spawnCycle - Date string (yyyy-MM-dd)
 * @returns Spawn result with edge case metadata
 */
export async function spawnSurgeNodes(spawnCycle: string) {
  // =====================================================================
  // STEP 1: FETCH ACTIVITY SNAPSHOT
  // =====================================================================
  const snapshots = await prisma.surgeActivitySnapshot.findMany({
    where: { snapshotDate: spawnCycle },
    orderBy: { totalScore: "desc" },
    select: { totalScore: true, h3Index: true },
  });

  // =====================================================================
  // EDGE CASE 1: ZERO ACTIVITY FALLBACK
  // =====================================================================
  let zeroActivityFallback = false;
  let seedHexesUsed: string[] = [];
  let territorySeedCount = 0;
  let citySeedCount = 0;

  if (snapshots.length === 0) {
    console.warn(
      `⚠️ ZERO ACTIVITY DETECTED for ${spawnCycle}. Using seed hexes.`,
    );
    zeroActivityFallback = true;

    // Fetch seed hexes (territories first, cities fallback)
    const seedData = await getSeedHexes();
    seedHexesUsed = seedData.seedHexes;
    territorySeedCount = seedData.territorySeedCount;
    citySeedCount = seedData.citySeedCount;

    console.log(
      `Using ${seedHexesUsed.length} seed hexes (territories: ${territorySeedCount}, cities: ${citySeedCount})`,
    );
  }

  // =====================================================================
  // STEP 2: CALCULATE NODE COUNT
  // =====================================================================
  const totalActivityScore = snapshots.reduce(
    (sum, s) => sum + s.totalScore,
    0,
  );
  const targetNodeCount = calculateDailyNodeCount(totalActivityScore);

  console.log(
    `Target node count: ${targetNodeCount} (activity score: ${totalActivityScore})`,
  );

  // =====================================================================
  // STEP 3: SELECT HEXES (with fallback logic)
  // =====================================================================
  let hexAllocations: Map<string, number>;

  if (zeroActivityFallback) {
    // Distribute evenly across seed hexes
    const nodesPerSeedHex = Math.floor(targetNodeCount / seedHexesUsed.length);
    hexAllocations = new Map(
      seedHexesUsed.map((hex) => [hex, nodesPerSeedHex]),
    );
  } else {
    // Normal weighted selection
    const hexScores = new Map(snapshots.map((s) => [s.h3Index, s.totalScore]));
    hexAllocations = selectSpawnHexes(hexScores, targetNodeCount);
  }

  // =====================================================================
  // EDGE CASE 2: APPLY DIVERSITY PENALTY
  // =====================================================================
  const { rebalancedAllocations, penalizedHexCount } = applyDiversityPenalty(
    hexAllocations,
    targetNodeCount,
  );

  hexAllocations = rebalancedAllocations;

  if (penalizedHexCount > 0) {
    console.log(
      `✓ Applied diversity penalty to ${penalizedHexCount} over-represented hexes`,
    );
  }

  // =====================================================================
  // STEP 3B: FETCH CONTROLLED TERRITORIES (EFFICIENT SINGLE QUERY)
  // =====================================================================
  /**
   * OPTIMIZATION STRATEGY:
   * Instead of querying territories for each node individually, we fetch ALL
   * controlled territories once and build an in-memory Map for O(1) lookups.
   * This converts N database queries into 1 query + N hash lookups.
   */
  const controlledTerritories = await prisma.territory.findMany({
    where: {
      guildId: { not: null }, // Only territories under guild control
    },
    select: {
      hexId: true,
    },
  });

  // Build a Set for O(1) lookup: controlled territory hex IDs
  const controlledTerritoryHexIds = new Set(
    controlledTerritories.map((t) => t.hexId),
  );

  console.log(
    `Loaded ${controlledTerritoryHexIds.size} controlled territories for efficient node attachment`,
  );

  // =====================================================================
  // STEP 4: PRE-FETCH NODE TYPES (Performance Optimization)
  // =====================================================================
  const nodeTypesCache = await getNodeTypesForSurge();

  // =====================================================================
  // STEP 5: GENERATE NODE DATA (with land validation + territory check)
  // =====================================================================
  const nodesToSpawn = [];
  let rank = 1;

  // Load land GeoJSON once (cached internally)
  const landGeoJSON = await loadLandGeoJson();

  for (const [h3Index, nodeCount] of hexAllocations) {
    const hexSnapshot = snapshots.find((s) => s.h3Index === h3Index);

    /**
     * TERRITORY ATTACHMENT LOGIC:
     * Check if this hex is in the controlled territories Set.
     * If yes, attach territoryHexId; if no, leave it null.
     */
    const isControlledTerritory = controlledTerritoryHexIds.has(h3Index);

    for (let i = 0; i < nodeCount; i++) {
      const location = generateRandomPointInHex(h3Index, landGeoJSON);
      const nodeTypeId = selectRandomNodeType(nodeTypesCache);

      nodesToSpawn.push({
        name: `Surge Node ${format(new Date(), "MMdd")}-${rank.toString().padStart(3, "0")}`,
        typeId: nodeTypeId,
        latitude: location.lat,
        longitude: location.lng,
        genEvent: "ResonanceSurge" as const,
        lore: generateSurgeLore(hexSnapshot?.totalScore || 0, rank),
        phase: null,
        echoIntensity: 0.8 + (rank / targetNodeCount) * 0.4, // 0.8-1.2 range
        openForMining: true,

        // Territory association: only set if hex is under guild control
        territoryHexId: isControlledTerritory ? h3Index : null,

        // Surge metadata
        h3Index,
        spawnCycle,
        activityScore: hexSnapshot?.totalScore || 0,
        hexRank: rank,
        expiresAt: addDays(new Date(), 1),
        baseMultiplier: 2.0,
      });

      rank++;
    }
  }

  // =====================================================================
  // STEP 6: BATCH CREATE NODES (Single Transaction)
  // =====================================================================
  const createdNodes = await prisma.$transaction(
    nodesToSpawn.map((nodeData) => {
      const {
        h3Index,
        spawnCycle,
        activityScore,
        hexRank,
        expiresAt,
        baseMultiplier,
        ...nodeFields
      } = nodeData;

      return prisma.node.create({
        data: {
          ...nodeFields,
          resonanceSurge: {
            create: {
              h3Index,
              spawnCycle,
              activityScore,
              hexRank,
              expiresAt,
              baseMultiplier,
              spawnedAt: new Date(),
            },
          },
        },
        select: { id: true, territoryHexId: true },
      });
    }),
  );

  // Count how many nodes were attached to territories
  const nodesAttachedToTerritories = createdNodes.filter(
    (node) => node.territoryHexId !== null,
  ).length;

  console.log(
    `✓ Attached ${nodesAttachedToTerritories}/${createdNodes.length} nodes to controlled territories`,
  );

  // =====================================================================
  // STEP 7: CREATE SPAWN LOG
  // =====================================================================
  const topHexes = Array.from(hexAllocations.entries())
    .slice(0, 10)
    .map(([h3Index, nodesSpawned]) => {
      const snapshot = snapshots.find((s) => s.h3Index === h3Index);
      return {
        h3Index,
        score: snapshot?.totalScore || 0,
        rank: snapshots.findIndex((s) => s.h3Index === h3Index) + 1,
        nodesSpawned,
      };
    });

  await prisma.surgeSpawnLog.create({
    data: {
      spawnCycle,
      totalNodesSpawned: createdNodes.length,
      totalHexesConsidered: hexAllocations.size,
      totalActivityScore,
      zeroActivityFallback,
      topHexes,
      metadata: {
        diversityPenaltyApplied: penalizedHexCount > 0,
        penalizedHexCount,
        seedHexesUsed: zeroActivityFallback ? seedHexesUsed : [],
        territorySeedCount,
        citySeedCount,
        nodesAttachedToTerritories,
        controlledTerritoryCount: controlledTerritoryHexIds.size,
      },
    },
  });

  // =====================================================================
  // RETURN RESULTS
  // =====================================================================
  return {
    nodesSpawned: createdNodes.length,
    hexesUsed: hexAllocations.size,
    zeroActivityFallback,
    diversityPenaltyApplied: penalizedHexCount > 0,
    penalizedHexCount,
    seedHexesUsed: zeroActivityFallback ? seedHexesUsed.length : 0,
    territorySeedCount,
    citySeedCount,
    nodesAttachedToTerritories,
    controlledTerritoryCount: controlledTerritoryHexIds.size,
  };
}
