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
