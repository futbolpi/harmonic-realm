import { headers as nextHeaders } from "next/headers";

import { calculateDistance } from "@/lib/utils";
import { redis } from "@/lib/redis";
import {
  BASE_MAX_DISTANCE_KM,
  COUNTRY_IP_GEO_SLACK_KM,
} from "@/config/spoof-detection";

// Interface for stored location (persisted in Redis)
interface StoredLocation {
  lat: number;
  lng: number;
  timestamp: number;
  ipLat: number;
  ipLng: number;
}

interface ValidateCoordinatesParams {
  submittedLat: number;
  submittedLng: number;
  userId: string;
  avoidRapidFire: boolean;
}

/**
 * Realistic velocity threshold for location-based gaming:
 * - Walking: ~5 km/h
 * - Cycling: ~20 km/h
 * - Car/transit: ~100 km/h (reasonable highway speed)
 * - Emergency cases (teleport/VPN switch): up to 200 km/h
 * Beyond 200 km/h in a single session is highly suspicious (jets, instant teleport).
 */
const MAX_VELOCITY_KMH = 200;

/**
 * Acceleration anomaly threshold: detect if velocity increased drastically
 * between consecutive requests. A 10x jump in velocity suggests bot-like behavior.
 */
const MAX_ACCELERATION_MULTIPLIER = 10;

/**
 * Minimum time between updates (in seconds) to avoid rapid-fire submissions.
 * Bots often spam requests; enforcing 30s minimum helps detect them.
 */
const MIN_TIME_BETWEEN_UPDATES_SECONDS = 30;

/**
 * Redis key prefix for storing user location history.
 */
const LOCATION_CACHE_PREFIX = "geoloc:";
const LOCATION_CACHE_TTL_SECONDS = 86400; // 24 hours

/**
 * Enhanced geolocation validation with velocity tracking, acceleration detection,
 * and anti-bot complexity. Uses Redis for persistent cross-request validation.
 */
export async function validateGeolocation({
  submittedLat,
  submittedLng,
  userId,
  avoidRapidFire,
}: ValidateCoordinatesParams): Promise<boolean> {
  // Bypass in non-production environments
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  // Get Vercel geo headers (IP-derived)
  const headersList = await nextHeaders();
  const ipLatitude = parseFloat(headersList.get("x-vercel-ip-latitude") || "0");
  const ipLongitude = parseFloat(
    headersList.get("x-vercel-ip-longitude") || "0",
  );
  const country = headersList.get("x-vercel-ip-country") ?? "";

  const slack = COUNTRY_IP_GEO_SLACK_KM[country] ?? 1;
  const MAX_DISTANCE_KM = BASE_MAX_DISTANCE_KM + slack * 10;

  // Edge case: No geo headers (e.g., local dev or rare failures)—bypass
  if (ipLatitude === 0 && ipLongitude === 0) {
    console.warn("No valid geo headers; bypassing validation");
    return true;
  }

  // --- 1. IP vs Submitted Distance Check (100km threshold for IP inaccuracy/VPN tolerance) ---
  const distanceKm = calculateDistance(
    submittedLat,
    submittedLng,
    ipLatitude,
    ipLongitude,
  );

  if (distanceKm > MAX_DISTANCE_KM) {
    console.warn(
      `[GEO] Suspicious distance: ${distanceKm.toFixed(
        1,
      )}km (IP: ${ipLatitude},${ipLongitude})`,
    );
    return false;
  }

  // --- 2. Velocity Check using Redis (requires userId for tracking) ---
  // If no userId provided, skip velocity check but don't fail validation
  if (!userId) {
    console.warn("[GEO] No userId provided; skipping velocity check");
    return true;
  }

  try {
    const locationKey = `${LOCATION_CACHE_PREFIX}${userId}`;
    const prevLocation = await redis.get<StoredLocation>(locationKey);

    const now = Date.now();
    const currentLocation: StoredLocation = {
      lat: submittedLat,
      lng: submittedLng,
      timestamp: now,
      ipLat: ipLatitude,
      ipLng: ipLongitude,
    };

    if (avoidRapidFire && prevLocation) {
      // --- 2a. Check minimum time between updates (rapid-fire bot detection) ---
      const timeDiffSeconds = (now - prevLocation.timestamp) / 1000;

      if (timeDiffSeconds < MIN_TIME_BETWEEN_UPDATES_SECONDS) {
        console.warn(
          `[GEO] Submission too frequent: ${timeDiffSeconds.toFixed(
            1,
          )}s (userId: ${userId})`,
        );
        return false;
      }

      // --- 2b. Compute velocity from previous location ---
      const distanceFromPrevKm = calculateDistance(
        submittedLat,
        submittedLng,
        prevLocation.lat,
        prevLocation.lng,
      );
      const timeDiffHours = timeDiffSeconds / 3600;
      const velocityKmh =
        timeDiffHours > 0 ? distanceFromPrevKm / timeDiffHours : 0;

      if (velocityKmh > MAX_VELOCITY_KMH) {
        console.warn(
          `[GEO] Impossible velocity: ${velocityKmh.toFixed(
            1,
          )} km/h (userId: ${userId})`,
        );
        return false;
      }

      // --- 2c. Acceleration anomaly detection (bot-like sudden velocity jumps) ---
      // Track velocity history to detect if the player suddenly jumped speed
      // (e.g., walking at 5 km/h, then teleporting to 500 km/h)
      const velocityHistoryKey = `${locationKey}:velocity-history`;
      const velocityHistory =
        (await redis.get<number[]>(velocityHistoryKey)) || [];

      if (velocityHistory.length > 0) {
        const prevVelocity = velocityHistory[velocityHistory.length - 1];
        const accelerationMultiplier =
          prevVelocity > 0 ? velocityKmh / prevVelocity : 1;

        if (accelerationMultiplier > MAX_ACCELERATION_MULTIPLIER) {
          console.warn(
            `[GEO] Suspicious acceleration: ${accelerationMultiplier.toFixed(
              1,
            )}x jump (userId: ${userId}, from ${prevVelocity.toFixed(
              1,
            )} to ${velocityKmh.toFixed(1)} km/h)`,
          );
          // return false;
        }
      }

      // --- 2d. IP location consistency check (if IP jumped dramatically, flag it) ---
      // This catches VPN or proxy switching mid-session
      const ipDistanceFromPrevKm = calculateDistance(
        ipLatitude,
        ipLongitude,
        prevLocation.ipLat,
        prevLocation.ipLng,
      );
      if (ipDistanceFromPrevKm > MAX_DISTANCE_KM) {
        console.warn(
          `[GEO] IP location jumped: ${ipDistanceFromPrevKm.toFixed(
            1,
          )}km (userId: ${userId})`,
        );
        return false;
      }

      // Update velocity history (keep last 5 for context)
      velocityHistory.push(velocityKmh);
      if (velocityHistory.length > 5) {
        velocityHistory.shift();
      }
      await redis.setex<number[]>(
        velocityHistoryKey,
        LOCATION_CACHE_TTL_SECONDS,
        velocityHistory,
      );
    }

    // Update stored location for next validation
    await redis.setex<StoredLocation>(
      locationKey,
      LOCATION_CACHE_TTL_SECONDS,
      currentLocation,
    );

    return true;
  } catch (error) {
    // Error handling: graceful degradation if Redis fails
    // Don't block gameplay but log for monitoring
    console.error("[GEO] Redis error during velocity check:", error);

    if (error instanceof SyntaxError) {
      console.error("[GEO] Failed to parse stored location JSON");
    }

    // Fallback: allow submission but flag for review (don't fail validation)
    // In production, you might want to alert security team
    console.warn(
      "[GEO] Validation degraded due to Redis error; allowing submission (monitor logs)",
    );
    return true;
  }
}
