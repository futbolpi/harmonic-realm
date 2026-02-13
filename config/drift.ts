import type { NodeTypeRarity } from "@/lib/generated/prisma/enums";

// ============================================================================
// DRIFT SYSTEM V2.0 - RURAL PLAYER RETENTION OPTIMIZED
// ============================================================================
// This configuration implements the v2.0 refactor focused on improving
// D7 retention and content accessibility for rural/suburban players.
//
// Key Changes from v1.0:
// - Base cost reduced: 200 SP → 100 SP (50% reduction)
// - Rarity multipliers linearized (exponential → linear scaling)
// - Cooldown reduced: 3 days → 2 days
// - Graduated 5-drift discount system for new players
// - Density-based eligibility (0-5 nodes instead of binary 0 nodes)
// - Usage penalty capped at +75% (prevents infinite escalation)
// - Grace period extended: 72 hours → 7 days
// ============================================================================

// ============================================================================
// CORE DRIFT PARAMETERS
// ============================================================================

/**
 * Cooldown between drift operations (in days)
 * v1.0: 3 days | v2.0: 2 days
 *
 * Rationale: 2-day cooldown maintains scarcity while reducing frustration.
 * Players can drift 3 times per week instead of 2, allowing faster iteration
 * if first drift placement is unlucky.
 */
export const DRIFT_COOL_DOWN_DAYS = 2;

/**
 * Time window for original drifter to tune the node before it becomes
 * available for others to drift (in days)
 * v1.0: N/A | v2.0: 7 days
 *
 * Rationale: 7-day grace period accommodates real-world schedules and travel
 * time to reach drifted nodes. Prevents "drift → can't reach → loses node"
 * frustration loop.
 */
export const DRIFT_GRACE_PERIOD_DAYS = 7;

/**
 * Time window before others can re-drift the same node (in hours)
 * v1.0: 72 hours | v2.0: 72 hours (unchanged)
 *
 * Prevents node sniping while original drifter is traveling to reach it.
 */
export const DRIFT_PERSONAL_LOCK_HOURS = 72;

/**
 * Minimum days of node inactivity before it becomes drift-eligible
 * Unchanged in v2.0
 */
export const ALLOWED_INACTIVITY_DAYS = 7;

// ============================================================================
// ELIGIBILITY ZONES
// ============================================================================

/**
 * Radius defining "void zone" for drift eligibility checks (in km)
 * v1.0: 10km (binary) | v2.0: 10km (with graduated density tiers)
 */
export const VOID_ZONE_RADIUS_KM = 10;

/**
 * Maximum distance a node can be from user to be drift-eligible (in km)
 * Unchanged in v2.0
 */
export const MAX_DRIFT_DISTANCE_KM = 100;

/**
 * Node scatter range after drift completes
 * Node lands randomly within this annulus around user location
 * Unchanged in v2.0
 */
export const DRIFT_MIN_SCATTER_KM = 2;
export const DRIFT_MAX_SCATTER_KM = 8;

// ============================================================================
// COST FORMULA PARAMETERS
// ============================================================================

/**
 * Base cost for drift operation (in sharePoints)
 * v1.0: 200 SP | v2.0: 100 SP
 *
 * Rationale: 50% reduction makes drift a viable content accessibility tool
 * rather than luxury feature. Aligns with daily earning potential.
 */
export const BASE_DRIFT_COST = 100;

/**
 * Rarity-based cost multipliers
 * v1.0: Exponential (1.0, 2.5, 6.25, 15.625, 39.0625)
 * v2.0: Linear (1.0, 1.5, 2.0, 3.0, 5.0)
 *
 * Rationale: Linear scaling preserves tier differentiation without creating
 * insurmountable walls. Makes high-rarity content accessible (95% cost
 * reduction for Legendary drifts).
 */
export const rarityMultipliers: Record<NodeTypeRarity, number> = {
  Common: 1.0,
  Uncommon: 1.5, // Was 2.5 (40% reduction)
  Rare: 2.0, // Was 6.25 (68% reduction)
  Epic: 3.0, // Was 15.625 (81% reduction)
  Legendary: 5.0, // Was 39.0625 (87% reduction)
};

/**
 * Distance-based premium rate (per 100km)
 * v1.0: 0.5 (max 50% premium) | v2.0: 0.3 (max 30% premium)
 *
 * Formula: D_factor = 1 + (distance_km / 100) × DISTANCE_PREMIUM_RATE
 *
 * Rationale: Distance penalty should reflect search cost, not be a scarcity
 * multiplier. Greater savings at longer distances helps truly isolated players.
 */
export const DISTANCE_PREMIUM_RATE = 0.3;

/**
 * Usage penalty rate per drift
 * v1.0: 0.15 (infinite escalation) | v2.0: 0.15 (capped)
 *
 * Each drift adds +15% to cost, but now capped at USAGE_PENALTY_CAP.
 */
export const USAGE_PENALTY_RATE = 0.15;

/**
 * Maximum usage penalty cap
 * v1.0: N/A (infinite) | v2.0: 0.75 (max +75%)
 *
 * Rationale: Prevents runaway costs for engaged rural players. After 5 drifts,
 * cost stabilizes at 1.75× instead of continuing to escalate infinitely.
 */
export const USAGE_PENALTY_CAP = 0.75;

// ============================================================================
// DENSITY-BASED ELIGIBILITY TIERS
// ============================================================================

/**
 * Density tier configuration for graduated eligibility
 * v1.0: Binary (0 nodes = eligible, 1+ nodes = ineligible)
 * v2.0: Graduated (0-2 nodes = full access, 3-5 nodes = 1.5× cost)
 */
export interface DensityTier {
  maxNodes: number; // Maximum nodes within 10km for this tier
  multiplier: number | null; // Cost multiplier (null = not eligible)
  label: string; // UI display label
  description: string; // Detailed description for tooltips
}

export const DENSITY_TIERS: DensityTier[] = [
  {
    maxNodes: 0,
    multiplier: 1.0,
    label: "Void Zone",
    description: "True void - no nodes within 10km. Full drift access.",
  },
  {
    maxNodes: 2,
    multiplier: 1.0,
    label: "Sparse Zone",
    description: "1-2 nodes nearby. Still eligible for full-price drift.",
  },
  {
    maxNodes: 5,
    multiplier: 1.5,
    label: "Low Density",
    description: "3-5 nodes nearby. Drift available with 50% cost premium.",
  },
  {
    maxNodes: 10,
    multiplier: null,
    label: "Medium Density",
    description: "6-10 nodes nearby. Drift not needed.",
  },
  {
    maxNodes: Infinity,
    multiplier: null,
    label: "Dense Zone",
    description: "11+ nodes nearby. Rich content area, drift blocked.",
  },
];

/**
 * Helper function to get density tier for a given node count
 */
export const getDensityTier = (nodeCount: number): DensityTier => {
  return (
    DENSITY_TIERS.find((tier) => nodeCount <= tier.maxNodes) ??
    DENSITY_TIERS[DENSITY_TIERS.length - 1]
  );
};

// ============================================================================
// FIRST-TIME DISCOUNT SYSTEM (5-DRIFT GRADUATED RAMP)
// ============================================================================

/**
 * Discount percentages for first 5 drifts
 * v1.0: 75 SP flat rate for first drift only
 * v2.0: Graduated 5-drift system (85% → 70% → 50% → 30% → 15% → 0%)
 *
 * Rationale: Creates positive first-time experience during critical D1-D14
 * retention window. By drift 6, player has established patterns and understands
 * game economy.
 *
 * Implementation: Discount applies to BASE_DRIFT_COST before other multipliers
 */
export const FIRST_TIME_DISCOUNTS: Record<number, number> = {
  0: 0.85, // 85% off first drift  → ~15 SP base cost
  1: 0.7, // 70% off second drift → ~30 SP base cost
  2: 0.5, // 50% off third drift  → ~50 SP base cost
  3: 0.3, // 30% off fourth drift → ~70 SP base cost
  4: 0.15, // 15% off fifth drift  → ~85 SP base cost
};

/**
 * Helper function to get discount for a given drift count
 */
export const getFirstTimeDiscount = (driftCount: number): number => {
  return FIRST_TIME_DISCOUNTS[driftCount] ?? 0;
};

/**
 * Helper function to get remaining discounted drifts
 */
export const getRemainingDiscounts = (driftCount: number): number => {
  const maxDiscountedDrifts = Object.keys(FIRST_TIME_DISCOUNTS).length;
  return Math.max(0, maxDiscountedDrifts - driftCount);
};

// ============================================================================
// COST CALCULATION HELPERS
// ============================================================================

/**
 * Calculate base cost with first-time discount applied
 */
export const getDiscountedBaseCost = (driftCount: number): number => {
  const discount = getFirstTimeDiscount(driftCount);
  return BASE_DRIFT_COST * (1 - discount);
};

/**
 * Calculate distance factor
 */
export const getDistanceFactor = (distanceKm: number): number => {
  return 1 + (distanceKm / 100) * DISTANCE_PREMIUM_RATE;
};

/**
 * Calculate usage penalty (capped)
 */
export const getUsagePenalty = (driftCount: number): number => {
  const rawPenalty = driftCount * USAGE_PENALTY_RATE;
  const cappedPenalty = Math.min(rawPenalty, USAGE_PENALTY_CAP);
  return 1 + cappedPenalty;
};

// ============================================================================
// UI DISPLAY CONSTANTS
// ============================================================================

/**
 * Human-readable labels for UI display
 */
export const UI_LABELS = {
  VOID_ZONE: "Void Zone",
  SPARSE_ZONE: "Sparse Zone",
  LOW_DENSITY: "Low Density Zone",
  MEDIUM_DENSITY: "Medium Density Zone",
  DENSE_ZONE: "Dense Zone",
  NOT_ELIGIBLE: "Not Eligible",
  FIRST_DRIFT: "First Drift Discount",
  VETERAN_PRICING: "Standard Pricing",
} as const;

/**
 * Badge colors for density tiers (shadcn variants)
 */
export const DENSITY_TIER_COLORS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  "Void Zone": "destructive",
  "Sparse Zone": "destructive",
  "Low Density": "secondary",
  "Medium Density": "outline",
  "Dense Zone": "outline",
};
