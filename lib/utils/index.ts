import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { MINING_RANGE_METERS } from "@/config/site";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

export function formatPi(amount: number): string {
  return `π ${amount.toFixed(4)}`;
}

// Calculate distance between two points (in km)
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if user is within mining range of a node
 * @param userLat User's latitude
 * @param userLon User's longitude
 * @param nodeLat Node's latitude
 * @param nodeLon Node's longitude
 * @returns True if within mining range
 */
export function isWithinMiningRange(
  userLat: number,
  userLon: number,
  nodeLat: number,
  nodeLon: number
): boolean {
  const distance = calculateDistance(userLat, userLon, nodeLat, nodeLon) * 1000; // Convert to meters;
  return distance <= MINING_RANGE_METERS;
}

/**
 * Calculates a halving value based on phase and base value
 * Phase 1: returns base value
 * Phase 2: returns base value / 2
 * Phase 3: returns base value / 4
 * Phase n: returns base value / (2^(n-1))
 */
export function halvingFormula(phase: number, baseValue: number): number {
  if (phase < 1) {
    throw new Error("Phase must be 1 or greater");
  }

  return baseValue / Math.pow(2, phase - 1);
}

export function truncateText(str: string, maxLength: number, ending = "...") {
  if (str.length > maxLength) {
    // Subtract the length of the ending from maxLength to ensure total length
    // including the ending does not exceed maxLength.
    return str.slice(0, maxLength - ending.length) + ending;
  } else {
    return str;
  }
}

// ============================================================================
// Debounce Utility (Fixed: Using generic array A to avoid 'any', using arrow function to avoid 'this' alias)
// ============================================================================

/**
 * Creates a debounced function that delays invoking `func` until after `delay`
 * milliseconds have elapsed since the last time the debounced function was invoked.
 * Includes a `cancel` method to clear any pending debounced invocation.
 *
 * @template A - The array of argument types for the function.
 * @param {(...args: A) => void} func - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {((...args: A) => void) & { cancel: () => void }} The debounced function with a cancel method.
 */
export const debounce = <A extends unknown[]>(
  func: (...args: A) => void,
  delay: number
): ((...args: A) => void) & { cancel: () => void } => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  // Using an arrow function avoids the need to alias 'this' (fixing error 2)
  const debounced = (...args: A) => {
    const later = () => {
      timeout = null;
      // Calling func directly fixes error 1 (no explicit 'any') and works because the
      // wrapped function is a stable, context-less React callback.
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, delay);
  };

  // Assert the type to include the `cancel` method
  const debouncedWithCancel = debounced as ((...args: A) => void) & {
    cancel: () => void;
  };

  debouncedWithCancel.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debouncedWithCancel;
};
