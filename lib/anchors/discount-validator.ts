import type Decimal from "decimal.js";

import {
  calculateDiscountedCost,
  calculatePointsBurned,
} from "./discount-calculator";

export interface DiscountValidation {
  valid: boolean;
  error?: string;
  maxLevels?: number;
}

/**
 * Validate if a discount can be applied
 * @param originalCost - The original anchor cost
 * @param discountLevels - Number of discount levels requested
 * @param userReferralPoints - User's available referral points
 * @param userFidelity - User's current resonance fidelity
 * @returns Validation result
 */
export function validateDiscount(
  originalCost: Decimal | string | number,
  discountLevels: number,
  userReferralPoints: number,
  userFidelity: number
): DiscountValidation {
  if (discountLevels < 0) {
    return { valid: false, error: "Discount levels cannot be negative" };
  }

  if (discountLevels === 0) {
    return { valid: true };
  }

  // Check if discount would push cost below floor
  const discountResult = calculateDiscountedCost(originalCost, discountLevels);
  if (discountResult === null) {
    return {
      valid: false,
      error: "Cannot apply discount: cost would fall below resonance floor",
    };
  }

  // Check if user has enough referral points
  const pointsNeeded = calculatePointsBurned(userFidelity, discountLevels);
  if (userReferralPoints < pointsNeeded) {
    return {
      valid: false,
      error: `Insufficient resonance points. Need ${pointsNeeded}, have ${userReferralPoints}`,
    };
  }

  return { valid: true };
}
