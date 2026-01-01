import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInHours, differenceInMinutes } from "date-fns";

import { MINING_RANGE_METERS } from "@/config/site";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
  }
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

export function formatMastery(masteryPct: number) {
  return masteryPct > 20 ? masteryPct : masteryPct * 100;
}

/**
 * Helper function to format cooldown time remaining (e.g., "23h 14m")
 */
export function formatCooldown(cooldownEnd: Date): string {
  const now = new Date();
  if (now >= cooldownEnd) return "Ready";

  const hours = differenceInHours(cooldownEnd, now);
  const minutes = differenceInMinutes(cooldownEnd, now) % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Calculates what percentage `part` is of `total`.
 * * @param part - The numerator (a)
 * @param total - The denominator (b)
 * @returns The percentage as a number rounded to 2 decimal places.
 * Returns 0 if total is 0 or inputs are invalid.
 */
export function calculatePercentage(part: number, total: number): number {
  // 1. Guard clause: Handle Division by Zero immediately
  if (total === 0) {
    return 0;
  }

  // 2. Guard clause: Ensure inputs are finite numbers (handles NaN and Infinity)
  if (!Number.isFinite(part) || !Number.isFinite(total)) {
    return 0;
  }

  // 3. Calculate the raw percentage
  const rawPercentage = (part / total) * 100;

  // 4. Robust Rounding
  // We use Number.EPSILON to handle floating point math errors (e.g. 1.005 rounding down)
  // Logic: Shift decimal right by 2, round, then shift left by 2.
  return Math.round((rawPercentage + Number.EPSILON) * 100) / 100;
}
