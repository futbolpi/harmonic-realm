import { NodeTypeRarity } from "../generated/prisma/enums";
import { redis } from "../redis";
import { env } from "@/env";

export interface RegionMetrics {
  cellId: string;
  pioneerCount: number;
  bounds: { latMin: number; latMax: number; lonMin: number; lonMax: number };
  echoIntensity?: number;
}

export interface QuotaResult {
  cellId: string;
  nodeCount: number;
  rarityDistribution: Record<NodeTypeRarity, number>;
}

export const getTotalMainnetKYCPioneers = async () => {
  if (env.NODE_ENV === "development") {
    return 100000;
  }
  // should call api
  return 12000000;
};

/**
 * New function: Calculates the effective number of pioneers for a given phase, incorporating the halving lore.
 * In the Pi Cosmos lore, each phase represents a "Harmonic Diminishing" – where the lattice's energy halves,
 * symbolizing the infinite yet converging nature of pi's series, creating scarcity and urging Pioneers to
 * harmonize more deeply.
 * Phase 1 (Genesis): 50% of total (initial awakening).
 * Subsequent phases: Halve the previous allocation (e.g., Phase 2: 25%, Phase 3: 12.5%),
 * capping at a minimum to avoid zero spawns.
 * @param phase Game phase
 * @returns Effective number of pioneers for given phase
 */
export async function getEffectivePioneersForPhase(
  phase: number
): Promise<number> {
  if (phase < 1) throw new Error("Phase must be at least 1");

  const totalMainnetKYCPioneers = await getTotalMainnetKYCPioneers();

  if (totalMainnetKYCPioneers <= 0)
    throw new Error("Total pioneers must be positive");

  const halvingFactor = 0.5 / Math.pow(2, phase - 1); // Halving: 0.5, 0.25, 0.125...
  const effectivePioneers = Math.max(
    1,
    Math.floor(totalMainnetKYCPioneers * halvingFactor)
  ); // Min 1 to ensure some spawns

  return effectivePioneers;
}

function calculateCellArea(bounds: {
  latMin: number;
  latMax: number;
  lonMin: number;
  lonMax: number;
}): number {
  const earthRadius = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const latDiff = toRad(bounds.latMax - bounds.latMin);
  const lonDiff = toRad(bounds.lonMax - bounds.lonMin);
  const latAvg = toRad((bounds.latMax + bounds.latMin) / 2);
  return latDiff * lonDiff * earthRadius * earthRadius * Math.cos(latAvg);
}

export async function calculateNodeQuotas(
  regions: RegionMetrics[]
): Promise<QuotaResult[]> {
  if (regions.length === 0) return [];

  const targetPioneersPerNode = 1000;
  const densitySmoothing = 10;
  const cacheTTL = 3600;

  const results = await Promise.all(
    regions.map(async (region) => {
      const cacheKey = `quota:${region.cellId}`;
      let cached;
      try {
        cached = await redis.get<QuotaResult>(cacheKey);
      } catch (err) {
        console.error("Quota cache error:", err);
      }
      if (cached) return cached;

      const density = region.pioneerCount / calculateCellArea(region.bounds);
      const gridFactor = Math.max(0.5, Math.min(2, 1000 / (density + 1)));

      const proportional = Math.floor(
        region.pioneerCount / targetPioneersPerNode
      );
      const logarithmic = Math.floor(Math.log2(region.pioneerCount + 1) * 2);
      const densityAdjusted = Math.floor(
        Math.sqrt(region.pioneerCount) / (densitySmoothing * gridFactor)
      );
      const nodeCount = Math.max(
        1,
        Math.round(
          0.5 * proportional + 0.3 * logarithmic + 0.2 * densityAdjusted
        )
      );

      const activityFactor = Math.min(1, region.pioneerCount / 10000);
      const rarityWeights = {
        [NodeTypeRarity.Common]: 70 - 20 * activityFactor,
        [NodeTypeRarity.Uncommon]: 20 + 10 * activityFactor,
        [NodeTypeRarity.Rare]: 8 + 8 * activityFactor,
        [NodeTypeRarity.Epic]: 2 + 2 * activityFactor,
        [NodeTypeRarity.Legendary]: activityFactor > 0.8 ? 1 : 0,
      };
      const totalWeight = Object.values(rarityWeights).reduce(
        (sum, w) => sum + w,
        0
      );

      const quotas: Record<NodeTypeRarity, number> = {
        [NodeTypeRarity.Common]: Math.floor(
          (nodeCount * rarityWeights[NodeTypeRarity.Common]) / totalWeight
        ),
        [NodeTypeRarity.Uncommon]: Math.floor(
          (nodeCount * rarityWeights[NodeTypeRarity.Uncommon]) / totalWeight
        ),
        [NodeTypeRarity.Rare]: Math.floor(
          (nodeCount * rarityWeights[NodeTypeRarity.Rare]) / totalWeight
        ),
        [NodeTypeRarity.Epic]: Math.floor(
          (nodeCount * rarityWeights[NodeTypeRarity.Epic]) / totalWeight
        ),
        [NodeTypeRarity.Legendary]: Math.floor(
          (nodeCount * rarityWeights[NodeTypeRarity.Legendary]) / totalWeight
        ),
      };

      const result: QuotaResult = {
        cellId: region.cellId,
        nodeCount,
        rarityDistribution: quotas,
      };
      try {
        await redis.set(cacheKey, result, { ex: cacheTTL });
      } catch (err) {
        console.error("Quota set cache error:", err);
      }
      return result;
    })
  );

  return results;
}
