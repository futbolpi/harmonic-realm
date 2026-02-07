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
 * Generates random point within H3 hex that is guaranteed to be on land
 * Retries up to 50 times, falls back to hex center if all fail
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
 * 60% Rare, 30% Epic, 10% Legendary
 */
function selectRandomNodeType(
  nodeTypesCache: Awaited<ReturnType<typeof getNodeTypesForSurge>>,
): string {
  const rand = Math.random();

  if (rand < 0.6) {
    // 60% Rare
    const types = nodeTypesCache.rareTypes;
    return types[Math.floor(Math.random() * types.length)].id;
  } else if (rand < 0.9) {
    // 30% Epic
    const types = nodeTypesCache.epicTypes;
    return types[Math.floor(Math.random() * types.length)].id;
  } else {
    // 10% Legendary
    const types = nodeTypesCache.legendaryTypes;
    return types[Math.floor(Math.random() * types.length)].id;
  }
}

export async function spawnSurgeNodes(spawnCycle: string) {
  // 1. Fetch activity snapshot
  const snapshots = await prisma.surgeActivitySnapshot.findMany({
    where: { snapshotDate: spawnCycle },
    orderBy: { totalScore: "desc" },
    select: { totalScore: true, h3Index: true },
  });

  if (snapshots.length === 0) {
    console.warn(`No activity snapshots for ${spawnCycle}`);
  }

  // 2. Calculate node count
  const totalActivityScore = snapshots.reduce(
    (sum, s) => sum + s.totalScore,
    0,
  );
  const targetNodeCount = calculateDailyNodeCount(totalActivityScore);

  // 3. Select hexes
  const hexScores = new Map(snapshots.map((s) => [s.h3Index, s.totalScore]));
  const hexAllocations = selectSpawnHexes(hexScores, targetNodeCount);

  // 4. PRE-FETCH node types once (optimization)
  const nodeTypesCache = await getNodeTypesForSurge();

  // 5. Generate node data (with land validation)
  const nodesToSpawn = [];
  let rank = 1;

  // Load land GeoJSON once (cached internally)
  const landGeoJSON = await loadLandGeoJson();

  for (const [h3Index, nodeCount] of hexAllocations) {
    const hexSnapshot = snapshots.find((s) => s.h3Index === h3Index);

    for (let i = 0; i < nodeCount; i++) {
      const location = generateRandomPointInHex(h3Index, landGeoJSON); // Now land-validated
      const nodeTypeId = selectRandomNodeType(nodeTypesCache); // No DB call

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

  // 6. Batch create nodes (single transaction)
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
        select: { id: true },
      });
    }),
  );

  // 7. Log spawn
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
      totalHexesConsidered: snapshots.length,
      topHexes,
    },
    select: { id: true },
  });

  return {
    nodesSpawned: createdNodes.length,
    hexesUsed: hexAllocations.size,
    topHexes,
  };
}

function generateSurgeLore(activityScore: number, rank: number): string {
  if (activityScore > 100000) {
    return `Born from intense harmonic convergence. This Surge node pulses with cosmic energy, ranking #${rank} in today's resonance wave. Mine it to anchor this frequency forever.`;
  } else if (activityScore > 50000) {
    return `A strong resonance echo manifests here. Rank #${rank} among today's Surge nodes. Claim it before the 24-hour window closes.`;
  } else {
    return `A moderate frequency disturbance. Rank #${rank} in the daily Surge cycle. Mine to stabilize it into the Lattice permanently.`;
  }
}
