import {
  BASE_DRIFT_COST,
  rarityMultipliers,
  DISTANCE_PREMIUM_RATE,
  USAGE_PENALTY_RATE,
  USAGE_PENALTY_CAP,
  getFirstTimeDiscount,
  getDensityTier,
} from "@/config/drift";
import type { NodeTypeRarity } from "../generated/prisma/enums";

// ============================================================================
// DRIFT COST CALCULATION V2.0
// ============================================================================

/**
 * Input parameters for drift cost calculation
 */
export interface DriftCostParams {
  /** Number of previous drifts by this user (lifetime) */
  driftCount: number;
  /** Distance from user to target node (in kilometers) */
  distance: number;
  /** Rarity tier of the target node */
  rarity: NodeTypeRarity;
  /** Number of nodes within 10km of user's current location */
  nodeCountWithin10km: number;
}

/**
 * Detailed breakdown of drift cost calculation
 */
export interface DriftCostBreakdown {
  /** Base cost before any multipliers */
  baseCost: number;
  /** Rarity-based multiplier */
  rarityMultiplier: number;
  /** Distance-based factor */
  distanceFactor: number;
  /** Usage penalty factor (capped) */
  usagePenalty: number;
  /** Density-based multiplier (1.0, 1.5, or null) */
  densityMultiplier: number | null;
  /** First-time discount percentage (0-0.85) */
  firstTimeDiscount: number;
  /** Human-readable density tier label */
  densityTier: string;
}

/**
 * Result of drift cost calculation
 */
export interface DriftCostResult {
  /** Final cost in sharePoints */
  cost: number;
  /** Whether user is eligible to drift based on density */
  eligible: boolean;
  /** Detailed cost breakdown for UI display */
  breakdown: DriftCostBreakdown;
}

/**
 * Calculate drift cost using v2.0 formula optimized for rural player retention
 *
 * @formula C_drift = C_base × (1 - Discount) × R_mult × D_factor × U_penalty × Density_mult
 *
 * Where:
 * - C_base = BASE_DRIFT_COST (100 SP in v2.0)
 * - Discount = FIRST_TIME_DISCOUNTS[driftCount] (0.85 → 0 over 5 drifts)
 * - R_mult = rarityMultipliers[rarity] (1.0 → 5.0 linear)
 * - D_factor = 1 + (distance / 100) × 0.3
 * - U_penalty = 1 + MIN(driftCount × 0.15, 0.75)
 * - Density_mult = getDensityTier(nodeCount).multiplier (1.0, 1.5, or null)
 *
 * @param params - Drift cost calculation parameters
 * @returns Drift cost result with eligibility and breakdown
 *
 * @example
 * // First drift, Rare node, 50km away, void zone
 * const result = getDriftCost({
 *   driftCount: 0,
 *   distance: 50,
 *   rarity: "Rare",
 *   nodeCountWithin10km: 0
 * });
 * // result.cost ≈ 23 SP (15 base × 2.0 rarity × 1.15 distance × 1.0 penalty × 1.0 density)
 * // result.eligible = true
 */
export const getDriftCost = ({
  driftCount,
  distance,
  rarity,
  nodeCountWithin10km,
}: DriftCostParams): DriftCostResult => {
  // ============================================================================
  // STEP 1: CHECK DENSITY-BASED ELIGIBILITY
  // ============================================================================

  const densityTier = getDensityTier(nodeCountWithin10km);
  const densityMultiplier = densityTier.multiplier;

  // If multiplier is null, user is not eligible (6+ nodes within 10km)
  if (densityMultiplier === null) {
    return {
      cost: 0,
      eligible: false,
      breakdown: {
        baseCost: 0,
        rarityMultiplier: 0,
        distanceFactor: 0,
        usagePenalty: 0,
        densityMultiplier: null,
        firstTimeDiscount: 0,
        densityTier: densityTier.label,
      },
    };
  }

  // ============================================================================
  // STEP 2: CALCULATE BASE COST WITH FIRST-TIME DISCOUNT
  // ============================================================================

  const firstTimeDiscount = getFirstTimeDiscount(driftCount);
  const baseCost = BASE_DRIFT_COST * (1 - firstTimeDiscount);

  // ============================================================================
  // STEP 3: APPLY RARITY MULTIPLIER (LINEARIZED)
  // ============================================================================

  const rarityMultiplier = rarityMultipliers[rarity];

  // ============================================================================
  // STEP 4: CALCULATE DISTANCE FACTOR (REDUCED PREMIUM RATE)
  // ============================================================================

  const distanceFactor = 1 + (distance / 100) * DISTANCE_PREMIUM_RATE;

  // ============================================================================
  // STEP 5: CALCULATE USAGE PENALTY (CAPPED)
  // ============================================================================

  const rawPenalty = driftCount * USAGE_PENALTY_RATE;
  const cappedPenalty = Math.min(rawPenalty, USAGE_PENALTY_CAP);
  const usagePenalty = 1 + cappedPenalty;

  // ============================================================================
  // STEP 6: FINAL COST CALCULATION
  // ============================================================================

  const finalCost =
    baseCost *
    rarityMultiplier *
    distanceFactor *
    usagePenalty *
    densityMultiplier;

  return {
    cost: Math.round(finalCost),
    eligible: true,
    breakdown: {
      baseCost,
      rarityMultiplier,
      distanceFactor,
      usagePenalty,
      densityMultiplier,
      firstTimeDiscount,
      densityTier: densityTier.label,
    },
  };
};

// ============================================================================
// HELPER FUNCTIONS FOR UI DISPLAY
// ============================================================================

/**
 * Format cost breakdown for display in UI
 *
 * @param breakdown - Cost breakdown from getDriftCost
 * @returns Human-readable cost breakdown
 */
export const formatCostBreakdown = (breakdown: DriftCostBreakdown) => {
  return {
    baseCost: `${Math.round(breakdown.baseCost)} SP`,
    rarityMultiplier: `×${breakdown.rarityMultiplier.toFixed(1)}`,
    distanceFactor: `×${breakdown.distanceFactor.toFixed(2)}`,
    usagePenalty: `×${breakdown.usagePenalty.toFixed(2)}`,
    densityMultiplier: breakdown.densityMultiplier
      ? `×${breakdown.densityMultiplier.toFixed(1)}`
      : "N/A",
    firstTimeDiscount: breakdown.firstTimeDiscount
      ? `${(breakdown.firstTimeDiscount * 100).toFixed(0)}% off`
      : "None",
    densityTier: breakdown.densityTier,
  };
};

/**
 * Calculate total savings from v1.0 to v2.0 pricing
 *
 * @param v1Cost - Cost under old system
 * @param v2Cost - Cost under new system
 * @returns Savings amount and percentage
 */
export const calculateSavings = (v1Cost: number, v2Cost: number) => {
  const savingsAmount = v1Cost - v2Cost;
  const savingsPercent = ((savingsAmount / v1Cost) * 100).toFixed(0);

  return {
    amount: Math.round(savingsAmount),
    percent: savingsPercent,
    displayText: `${savingsAmount.toLocaleString()} SP (${savingsPercent}% savings)`,
  };
};

/**
 * Validate drift cost parameters
 *
 * @param params - Drift cost parameters
 * @returns Validation result with error message if invalid
 */
export const validateDriftParams = (
  params: DriftCostParams,
): { valid: boolean; error?: string } => {
  if (params.driftCount < 0) {
    return { valid: false, error: "Drift count cannot be negative" };
  }

  if (params.distance < 0 || params.distance > 100) {
    return { valid: false, error: "Distance must be between 0-100km" };
  }

  if (params.nodeCountWithin10km < 0) {
    return { valid: false, error: "Node count cannot be negative" };
  }

  const validRarities: NodeTypeRarity[] = [
    "Common",
    "Uncommon",
    "Rare",
    "Epic",
    "Legendary",
  ];

  if (!validRarities.includes(params.rarity)) {
    return { valid: false, error: "Invalid rarity tier" };
  }

  return { valid: true };
};

// ============================================================================
// LEGACY V1.0 COST CALCULATION (FOR COMPARISON)
// ============================================================================

/**
 * Calculate drift cost using old v1.0 formula
 * Used for savings comparison in UI
 *
 * @deprecated Use getDriftCost instead
 */
export const getLegacyDriftCost = ({
  driftCount,
  distance,
  rarity,
}: Omit<DriftCostParams, "nodeCountWithin10km">): number => {
  // V1.0: First-time flat rate
  if (driftCount === 0) {
    return 75;
  }

  // V1.0: Veteran pricing
  const C_base = 200;

  // V1.0: Exponential rarity multipliers
  const legacyRarityMultipliers: Record<NodeTypeRarity, number> = {
    Common: 1.0,
    Uncommon: 2.5,
    Rare: 6.25,
    Epic: 15.625,
    Legendary: 39.0625,
  };

  const R_multiplier = legacyRarityMultipliers[rarity];

  // V1.0: Distance factor (higher premium)
  const D_factor = 1 + (distance / 100) * 0.5;

  // V1.0: Uncapped usage penalty
  const U_penalty = 1 + driftCount * 0.15;

  return Math.round(C_base * R_multiplier * D_factor * U_penalty);
};
