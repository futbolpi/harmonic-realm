import type { Decimal } from "decimal.js";

import { calculateActivityScore } from "./activity-weights";

export interface ActivityData {
  h3Index: string;
  miningCount: number;
  tuningCount: number;
  driftCount: number;
  anchoringCount: number;
  calibrationPi: Decimal;
  loreStakingPi: Decimal;
  chamberMaintenance: number;
}

/**
 * Calculates total weighted score for a hex
 */
export function calculateHexScore(data: ActivityData): number {
  const miningScore = calculateActivityScore("MINING", data.miningCount);
  const tuningScore = calculateActivityScore("TUNING", data.tuningCount);
  const anchoringScore = calculateActivityScore(
    "ANCHORING",
    data.anchoringCount,
  );
  const calibrationScore = calculateActivityScore(
    "CALIBRATION",
    1,
    data.calibrationPi.toNumber(),
  );
  const loreScore = calculateActivityScore(
    "LORE_STAKING",
    1,
    data.loreStakingPi.toNumber(),
  );
  const chamberScore = calculateActivityScore(
    "CHAMBER_MAINTENANCE",
    data.chamberMaintenance,
  );
  const driftScore = calculateActivityScore("DRIFTING", data.driftCount);

  return (
    miningScore +
    tuningScore +
    anchoringScore +
    calibrationScore +
    loreScore +
    chamberScore +
    driftScore
  );
}

/**
 * ENHANCED: Weighted random selection of hexes for spawning
 *
 * Uses cumulative distribution function for probability
 * Allows replacement (same hex can receive multiple nodes up to diversity cap)
 *
 * @param hexScores - Map of h3Index to activity score
 * @param targetNodeCount - Total nodes to spawn
 * @returns Map of h3Index to allocated node count
 */
export function selectSpawnHexes(
  hexScores: Map<string, number>,
  targetNodeCount: number,
): Map<string, number> {
  // Returns { h3Index: nodeCount }

  const sortedHexes = Array.from(hexScores.entries()).sort(
    (a, b) => b[1] - a[1],
  ); // Descending by score

  if (sortedHexes.length === 0) {
    return new Map();
  }

  // Calculate total score for probability distribution
  const totalScore = sortedHexes.reduce((sum, [, score]) => sum + score, 0);

  // Build cumulative distribution
  const cumulativeProbs: number[] = [];
  let cumSum = 0;
  for (const [, score] of sortedHexes) {
    cumSum += score / totalScore;
    cumulativeProbs.push(cumSum);
  }

  // Allocate nodes using weighted probability
  const hexAllocations = new Map<string, number>();

  for (let i = 0; i < targetNodeCount; i++) {
    const rand = Math.random();
    const hexIndex = cumulativeProbs.findIndex((prob) => rand <= prob);
    const [h3Index] = sortedHexes[hexIndex];

    hexAllocations.set(h3Index, (hexAllocations.get(h3Index) || 0) + 1);
  }

  return hexAllocations;
}
