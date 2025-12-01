import Decimal from "decimal.js";

import { FLOOR_PRICE } from "@/config/site";

/**
 * Calculate the cost in referral points for a specific discount level
 * Uses exponential scaling: 1, 2, 4, 8, 16, etc.
 * @param discountLevel - The discount level (0-indexed, so 0 = 1st discount, 1 = 2nd discount, etc.)
 * @returns Cost in referral points
 */
export function calculateDiscountPointsCost(discountLevel: number): number {
  return Math.pow(2, discountLevel);
}

/**
 * Calculate the cumulative referral points needed to reach a specific discount level
 * @param targetLevel - The discount level to reach (0-indexed)
 * @returns Total cumulative points needed
 */
export function calculateCumulativePointsForLevel(targetLevel: number): number {
  let total = 0;
  for (let i = 0; i <= targetLevel; i++) {
    total += calculateDiscountPointsCost(i);
  }
  return total;
}

/**
 * Determine the maximum discount levels a user can apply based on their referral points
 * @param referralPoints - User's available referral points
 * @param currentFidelity - User's resonance fidelity (number of discounts already used)
 * @returns Maximum discount levels user can apply
 */
export function calculateMaxDiscountLevels(
  referralPoints: number,
  currentFidelity: number
): number {
  let maxLevels = 0;
  let pointsSpent = 0;

  while (true) {
    const nextLevelCost = calculateDiscountPointsCost(
      currentFidelity + maxLevels
    );
    if (pointsSpent + nextLevelCost <= referralPoints) {
      pointsSpent += nextLevelCost;
      maxLevels++;
    } else {
      break;
    }
  }

  return maxLevels;
}

/**
 * Calculate the cost after applying discount levels
 * Each level divides the cost by 10 (shifts decimal place)
 * @param originalCost - The original anchor cost
 * @param discountLevels - Number of discount levels to apply
 * @returns Cost after discount, or null if would fall below floor price
 */
export function calculateDiscountedCost(
  originalCost: Decimal | string | number,
  discountLevels: number
): { cost: Decimal; isAtFloor: boolean } | null {
  let cost = new Decimal(originalCost);

  for (let i = 0; i < discountLevels; i++) {
    cost = cost.dividedBy(10).toDecimalPlaces(2, Decimal.ROUND_DOWN);
  }

  // Check if cost falls below floor price
  if (cost.lessThan(FLOOR_PRICE)) {
    return null;
  }

  return {
    cost,
    isAtFloor: cost.equals(FLOOR_PRICE),
  };
}

/**
 * Calculate referral points burned for applying discount levels
 * @param currentFidelity - User's current resonance fidelity
 * @param discountLevels - Number of levels to apply
 * @returns Total points to burn
 */
export function calculatePointsBurned(
  currentFidelity: number,
  discountLevels: number
): number {
  let pointsBurned = 0;
  for (let i = 0; i < discountLevels; i++) {
    pointsBurned += calculateDiscountPointsCost(currentFidelity + i);
  }
  return pointsBurned;
}

/**
 * Get next discount level details for UI display
 * @param currentFidelity - User's current resonance fidelity
 * @returns Cost and description of next discount tier
 */
export function getNextDiscountTier(currentFidelity: number) {
  const nextLevel = currentFidelity;
  const pointsCost = calculateDiscountPointsCost(nextLevel);
  const cumulativePoints = calculateCumulativePointsForLevel(nextLevel);

  return {
    nextLevel: nextLevel + 1,
    pointsCost,
    cumulativePoints,
  };
}
