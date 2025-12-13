import { rarityMultipliers } from "@/config/drift";
import type { NodeTypeRarity } from "../generated/prisma/enums";

interface DriftCostParams {
  driftCount: number; // how many times this user has already drifted (lifetime)
  distance: number; // distance to the target node in kilometers
  rarity: NodeTypeRarity; // rarity tier of the target node
}

/**
 * Calculates the cost in sharePoints to drift/converge to a node.
 * Implements the "Dynamic Convergence Pricing" formula described in the comments.
 */
export const getDriftCost = ({
  driftCount,
  distance,
  rarity,
}: DriftCostParams): number => {
  // New Pioneers – first ever drift gets a big discount
  if (driftCount === 0) {
    return 75; // flat one-time rate
  }

  // ---------- Veteran Pioneers (driftCount > 0) ----------

  // 1. Base cost
  const C_base = 200;

  // 2. Rarity multiplier (exponential 2.5× per tier)

  const R_multiplier = rarityMultipliers[rarity];

  // 3. Distance factor
  // Every 100 km adds +50% to the cost (linear)
  const D_factor = 1 + (distance / 100) * 0.5;

  // 4. Usage penalty (diminishing returns)
  // Each previous drift adds +15% to the cost
  const U_penalty = 1 + driftCount * 0.15;

  // Final cost (rounded to nearest integer for clean UI)
  const cost = C_base * R_multiplier * D_factor * U_penalty;

  return Math.round(cost);
};
