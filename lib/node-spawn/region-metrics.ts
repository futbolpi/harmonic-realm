import SeedRandom from "seedrandom";
import CryptoJS from "crypto-js";

import { Layers } from "@/inngest/events";
import prisma from "../prisma";
import { redis } from "../redis";

const PI_SEED = "3.14159265358979323846";
const BIN_SIZE = 10;

export interface RegionMetrics {
  cellId: string;
  pioneerCount: number;
  bounds: { latMin: number; latMax: number; lonMin: number; lonMax: number };
  echoIntensity?: number;
}

export interface Cell {
  cellId: string;
  bounds: {
    latMin: number;
    latMax: number;
    lonMin: number;
    lonMax: number;
  };
}

// Utility: Bin lat/lon (call when creating MiningSession, e.g., in API)
export function binLatLon(
  lat: number,
  lon: number,
  binSize = BIN_SIZE
): { latitudeBin: number; longitudeBin: number } {
  if (isNaN(lat) || isNaN(lon)) throw new Error("Invalid lat/lon");
  return {
    latitudeBin: Math.floor(lat / binSize) * binSize,
    longitudeBin: Math.floor(lon / binSize) * binSize,
  };
}

function getPiSeededRandom(cellId: string): number {
  const hash = CryptoJS.SHA256(cellId + PI_SEED).toString();
  const rng = SeedRandom(hash);
  return rng();
}

async function fetchBinnedActivity(): Promise<Record<string, number>> {
  try {
    const activity = await prisma.miningSession.groupBy({
      by: ["latitudeBin", "longitudeBin"],
      _sum: { minerSharesEarned: true },
      where: {
        latitudeBin: { not: null },
        longitudeBin: { not: null },
        status: "COMPLETED",
      }, // Efficiency: Filter nulls
    });
    const binActivity = new Map<string, number>();
    activity.forEach((a) => {
      if (a.latitudeBin !== null && a.longitudeBin !== null) {
        const key = `${a.latitudeBin}_${a.longitudeBin}`;
        binActivity.set(key, (a._sum.minerSharesEarned || 0) + 10);
      }
    });
    return Object.fromEntries(binActivity);
  } catch (err) {
    console.error("Activity fetch error:", err);
    return {};
  }
}

async function applyLoreLayer(
  layer: Layers,
  distribution: Record<string, number>,
  cells: Cell[]
): Promise<Record<string, number>> {
  if (layer === "environmental") {
    cells.forEach((cell) => {
      if (Math.random() < 0.05)
        distribution[cell.cellId] *= Math.random() > 0.5 ? 1.2 : 0.8;
    });
  }
  // Add more (e.g., 'social': query guilds)
  return distribution;
}

export async function generateRegionMetrics(
  totalPioneers: number,
  phase: number = 1,
  layers: Layers[] = []
): Promise<RegionMetrics[]> {
  const cacheKey = `region_metrics_activity:${totalPioneers}:${phase}:${layers.join(
    ","
  )}`;
  let cached;
  try {
    cached = await redis.get<RegionMetrics[]>(cacheKey);
  } catch (err) {
    console.error("Metrics cache get error:", err);
  }
  if (cached) return cached;

  const gridSize = 1;
  const cells: Cell[] = [];
  for (let lat = -60; lat < 60; lat += gridSize) {
    for (let lon = -180; lon < 180; lon += gridSize) {
      const cellId = `lat_${lat}_lon_${lon}`;
      cells.push({
        cellId,
        bounds: {
          latMin: lat,
          latMax: lat + gridSize,
          lonMin: lon,
          lonMax: lon + gridSize,
        },
      });
    }
  }

  let pioneerDistribution: Record<string, number> = {};
  if (phase === 1) {
    const equalCount = Math.floor(totalPioneers / cells.length);
    cells.forEach((cell) => (pioneerDistribution[cell.cellId] = equalCount));
  } else {
    const binActivity = await fetchBinnedActivity();
    cells.forEach((cell) => {
      const { latitudeBin: binLat, longitudeBin: binLon } = binLatLon(
        cell.bounds.latMin,
        cell.bounds.lonMin
      );
      pioneerDistribution[cell.cellId] =
        binActivity[`${binLat}_${binLon}`] || 10;
    });

    cells.forEach((cell) => {
      if (pioneerDistribution[cell.cellId] > 100) {
        const neighbors = cells.filter(
          (c) =>
            Math.hypot(
              c.bounds.latMin - cell.bounds.latMin,
              c.bounds.lonMin - cell.bounds.lonMin
            ) <=
            gridSize * 1.5
        );
        neighbors.forEach((n) => (pioneerDistribution[n.cellId] *= 1.1));
      }
    });
  }

  cells.forEach((cell) => {
    const echo = 1 + getPiSeededRandom(cell.cellId) * 0.5;
    pioneerDistribution[cell.cellId] *= echo;
  });

  for (const layer of layers) {
    pioneerDistribution = await applyLoreLayer(
      layer,
      pioneerDistribution,
      cells
    );
  }

  const totalDist = Object.values(pioneerDistribution).reduce(
    (sum, d) => sum + d,
    0
  );
  const regionMetrics = cells.map((cell) => ({
    cellId: cell.cellId,
    pioneerCount: Math.round(
      totalPioneers * (pioneerDistribution[cell.cellId] / totalDist)
    ),
    bounds: cell.bounds,
    echoIntensity: (pioneerDistribution[cell.cellId] / totalDist) * 100,
  }));

  const totalCalculated = regionMetrics.reduce(
    (sum, r) => sum + r.pioneerCount,
    0
  );
  const scale = totalPioneers / totalCalculated;
  regionMetrics.forEach(
    (r) => (r.pioneerCount = Math.round(r.pioneerCount * scale))
  );

  try {
    await redis.set(cacheKey, regionMetrics, { ex: 3600 });
  } catch (err) {
    console.error("Metrics cache set error:", err);
  }
  return regionMetrics;
}
