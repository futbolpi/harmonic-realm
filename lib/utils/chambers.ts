import { latLngToCell } from "h3-js";
import { addDays, differenceInDays } from "date-fns";

import { calculateDistance } from "@/lib/utils";

// ===================================
// CONSTANTS
// ===================================

export const CHAMBER_CONSTANTS = {
  MAX_CHAMBERS_PER_USER: 3,
  MIN_CHAMBER_SPACING_KM: 2, // Minimum distance between own chambers
  BOOST_RADIUS_KM: 5, // 5km boost radius
  BASE_BOOST_PERCENT: 5, // 5% boost at level 1
  BOOST_INCREMENT_PER_LEVEL: 5, // +5% per level
  MAX_LEVEL: 10,
  DURABILITY_DECAY_PER_DAY: 14.28, // 100% / 7 days = ~14.28% per day
  MAINTENANCE_INTERVAL_DAYS: 7,
  MAINTENANCE_WARNING_THRESHOLD: 20, // Notify when durability < 20%
  DEACTIVATION_REFUND_PERCENT: 50, // 50% refund on deactivation
  H3_RESOLUTION: 8, // ~0.7km² hexes
} as const;

// ===================================
// COST CALCULATIONS
// ===================================

/**
 * Calculate cost to create a new chamber
 * Formula: 200 + (existingCount * 100)
 * - First chamber: 200 RES
 * - Second chamber: 300 RES
 * - Third chamber: 400 RES
 */
export function calculateChamberCreationCost(existingCount: number): number {
  if (
    existingCount < 0 ||
    existingCount >= CHAMBER_CONSTANTS.MAX_CHAMBERS_PER_USER
  ) {
    throw new Error(`Invalid existing count: ${existingCount}`);
  }
  return 200 + existingCount * 100;
}

/**
 * Calculate cost to upgrade chamber to next level
 * Formula: currentLevel * 300
 * - L1→L2: 300 RES
 * - L2→L3: 600 RES
 * - L9→L10: 2700 RES
 */
export function calculateChamberUpgradeCost(currentLevel: number): number {
  if (currentLevel < 1 || currentLevel >= CHAMBER_CONSTANTS.MAX_LEVEL) {
    throw new Error(`Invalid level for upgrade: ${currentLevel}`);
  }
  return currentLevel * 300;
}

/**
 * Calculate cost to maintain chamber (restore durability to 100%)
 * Formula: level * 50
 * - L1: 50 RES
 * - L5: 250 RES
 * - L10: 500 RES
 */
export function calculateChamberMaintenanceCost(level: number): number {
  if (level < 1 || level > CHAMBER_CONSTANTS.MAX_LEVEL) {
    throw new Error(`Invalid level: ${level}`);
  }
  return level * 50;
}

/**
 * Calculate sharePoint boost percentage at given level
 * Formula: 5% + (level - 1) * 5%
 * - L1: 5%
 * - L5: 25%
 * - L10: 50%
 */
export function calculateChamberBoost(level: number): number {
  if (level < 1 || level > CHAMBER_CONSTANTS.MAX_LEVEL) {
    throw new Error(`Invalid level: ${level}`);
  }
  const boost =
    (CHAMBER_CONSTANTS.BASE_BOOST_PERCENT +
      (level - 1) * CHAMBER_CONSTANTS.BOOST_INCREMENT_PER_LEVEL) /
    100;
  return boost; // Return as decimal (0.05 = 5%)
}

/**
 * Calculate current durability based on last maintenance time
 * Formula: 100 - (daysSinceMaintenance * 14.28)
 * Decays linearly from 100% to 0% over 7 days
 */
export function calculateCurrentDurability(lastMaintenanceAt: Date): number {
  const daysSince = differenceInDays(new Date(), lastMaintenanceAt);

  const durability = Math.max(
    0,
    100 - daysSince * CHAMBER_CONSTANTS.DURABILITY_DECAY_PER_DAY,
  );
  return Math.round(durability * 100) / 100; // Round to 2 decimals
}

/**
 * Calculate next maintenance due date
 */
export function calculateMaintenanceDueDate(lastMaintenanceAt: Date): Date {
  return addDays(
    lastMaintenanceAt,
    CHAMBER_CONSTANTS.MAINTENANCE_INTERVAL_DAYS,
  );
}

// ===================================
// SPATIAL UTILITIES
// ===================================

/**
 * Get H3 index for chamber location
 */
export function getChamberH3Index(lat: number, lng: number): string {
  return latLngToCell(lat, lng, CHAMBER_CONSTANTS.H3_RESOLUTION);
}

/**
 * Check if a location is within chamber boost radius
 */
export function isWithinChamberRadius(
  chamberLat: number,
  chamberLng: number,
  targetLat: number,
  targetLng: number,
): boolean {
  const distance = calculateDistance(
    chamberLat,
    chamberLng,
    targetLat,
    targetLng,
  );
  return distance <= CHAMBER_CONSTANTS.BOOST_RADIUS_KM;
}

/**
 * Calculate distance between two chambers
 */
export function calculateChamberDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  return calculateDistance(lat1, lng1, lat2, lng2);
}

/**
 * Check if two chambers meet minimum spacing requirement
 */
export function meetsMinimumSpacing(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): boolean {
  const distance = calculateChamberDistance(lat1, lng1, lat2, lng2);
  return distance >= CHAMBER_CONSTANTS.MIN_CHAMBER_SPACING_KM;
}

// ===================================
// PERMISSION CHECKS
// ===================================

export type PermissionCheck = {
  allowed: boolean;
  reason?: string;
};

/**
 * Check if user can create a new chamber
 */
export function canCreateChamber({
  existingCount,
  userBalance,
  proposedLat,
  proposedLng,
  existingChambers,
}: {
  existingCount: number;
  userBalance: number;
  proposedLat: number;
  proposedLng: number;
  existingChambers: Array<{ latitude: number; longitude: number }>;
}): PermissionCheck {
  // Check max chambers limit
  if (existingCount >= CHAMBER_CONSTANTS.MAX_CHAMBERS_PER_USER) {
    return {
      allowed: false,
      reason: `Maximum ${CHAMBER_CONSTANTS.MAX_CHAMBERS_PER_USER} active chambers allowed. Deactivate one to create another.`,
    };
  }

  // Check spacing with existing chambers
  for (const chamber of existingChambers) {
    if (
      !meetsMinimumSpacing(
        proposedLat,
        proposedLng,
        chamber.latitude,
        chamber.longitude,
      )
    ) {
      return {
        allowed: false,
        reason: `Chambers must be at least ${CHAMBER_CONSTANTS.MIN_CHAMBER_SPACING_KM}km apart.`,
      };
    }
  }

  // Check balance
  const cost = calculateChamberCreationCost(existingCount);
  if (userBalance < cost) {
    return {
      allowed: false,
      reason: `Insufficient RESONANCE. Need ${cost}, have ${userBalance}`,
    };
  }

  return { allowed: true };
}

/**
 * Check if user can upgrade chamber
 */
export function canUpgradeChamber({
  currentLevel,
  userBalance,
  chamberActive,
}: {
  currentLevel: number;
  userBalance: number;
  chamberActive: boolean;
}): PermissionCheck {
  // Check if chamber is active
  if (!chamberActive) {
    return { allowed: false, reason: "Chamber is deactivated" };
  }

  // Check max level
  if (currentLevel >= CHAMBER_CONSTANTS.MAX_LEVEL) {
    return { allowed: false, reason: "Chamber already at max level" };
  }

  // Check balance
  const cost = calculateChamberUpgradeCost(currentLevel);
  if (userBalance < cost) {
    return {
      allowed: false,
      reason: `Insufficient RESONANCE. Need ${cost}, have ${userBalance}`,
    };
  }

  return { allowed: true };
}

/**
 * Check if user can maintain chamber
 */
export function canMaintainChamber({
  level,
  lastMaintenanceAt,
  userBalance,
  chamberActive,
}: {
  level: number;
  lastMaintenanceAt: Date;
  userBalance: number;
  chamberActive: boolean;
}): PermissionCheck {
  // Check if chamber is active
  if (!chamberActive) {
    return { allowed: false, reason: "Chamber is deactivated" };
  }

  // Check if maintenance is needed
  const currentDurability = calculateCurrentDurability(lastMaintenanceAt);
  if (currentDurability > 90) {
    return {
      allowed: false,
      reason: "Chamber doesn't need maintenance yet (>90% durability)",
    };
  }

  // Check balance
  const cost = calculateChamberMaintenanceCost(level);
  if (userBalance < cost) {
    return {
      allowed: false,
      reason: `Insufficient RESONANCE. Need ${cost}, have ${userBalance}`,
    };
  }

  return { allowed: true };
}

/**
 * Check if user can deactivate chamber
 */
export function canDeactivateChamber({
  chamberActive,
}: {
  chamberActive: boolean;
}): PermissionCheck {
  if (!chamberActive) {
    return { allowed: false, reason: "Chamber is already deactivated" };
  }

  return { allowed: true };
}

// ===================================
// DISPLAY HELPERS
// ===================================

/**
 * Get durability status color/label
 */
export function getDurabilityStatus(durability: number): {
  label: string;
  color: string;
  variant: "default" | "secondary" | "destructive" | "outline";
} {
  if (durability >= 70) {
    return { label: "Optimal", color: "text-green-500", variant: "default" };
  }
  if (durability >= 40) {
    return { label: "Stable", color: "text-yellow-500", variant: "secondary" };
  }
  if (durability >= 20) {
    return { label: "Degrading", color: "text-orange-500", variant: "outline" };
  }
  return { label: "Critical", color: "text-red-500", variant: "destructive" };
}

/**
 * Calculate refund amount for deactivation
 */
export function calculateDeactivationRefund(totalInvested: number): number {
  return Math.floor(
    totalInvested * (CHAMBER_CONSTANTS.DEACTIVATION_REFUND_PERCENT / 100),
  );
}

/**
 * Format boost percentage for display
 */
export function formatBoostPercentage(level: number): string {
  const boost = calculateChamberBoost(level);
  return `+${(boost * 100).toFixed(0)}%`;
}

/**
 * Toast message enhancement
 *
 * Integration Point: Mining/Tuning completion toasts
 *
 * Add chamber bonus info to success messages:
 *
 * ```typescript
 * toast.success("Mining session completed!", {
 *   description: (
 *     <div className="space-y-1 mt-2">
 *       <div className="flex justify-between text-sm">
 *         <span>Shares Earned:</span>
 *         <span className="text-cyan-400 font-bold">
 *           +{finalShares} Shares
 *         </span>
 *       </div>
 *
 *       {chamberBonus.hasBoost && (
 *         <div className="text-xs text-emerald-300 bg-emerald-950/10 p-2 rounded border border-emerald-700">
 *           <div className="font-semibold">Echo Chamber Bonus!</div>
 *           <div>
 *             Level {chamberBonus.chamberLevel} Chamber boosted your earnings by{" "}
 *             {(chamberBonus.boostMultiplier * 100).toFixed(0)}%
 *           </div>
 *         </div>
 *       )}
 *     </div>
 *   ),
 *   duration: 10000,
 * });
 * ```
 */
export function getChamberBonusToastContent({
  finalShares,
  chamberBonus,
  action,
}: {
  finalShares: number;
  chamberBonus: {
    hasBoost: boolean;
    boostMultiplier: number;
    chamberId?: string;
    chamberLevel?: number;
  };
  action: "mining" | "tuning";
}) {
  return {
    title:
      action === "mining"
        ? "Mining session completed!"
        : "Resonance Stabilized!",
    description: chamberBonus.hasBoost
      ? `+${finalShares} Shares • Echo Chamber Level ${chamberBonus.chamberLevel} boosted earnings by ${(chamberBonus.boostMultiplier * 100).toFixed(0)}%`
      : `+${finalShares} Shares`,
  };
}
