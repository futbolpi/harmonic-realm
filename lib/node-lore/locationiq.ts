import { Redis } from "@upstash/redis";
import { z } from "zod";

import { env } from "@/env";
import type {
  LocationIQReverseResponse,
  LocationContext,
} from "@/lib/node-lore/location-lore";
import { redis } from "../redis";

const coordinateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const locationiqErrorCodes = [
  "INVALID_COORDINATES",
  "INVALID_RESPONSE",
  "CLIENT_ERROR",
  "RATE_LIMIT_EXCEEDED",
  "REQUEST_FAILED",
  "HTTP_ERROR",
  "TIMEOUT",
  "NETWORK_ERROR",
] as const;

type LocationIQErrorCodes = (typeof locationiqErrorCodes)[number];

/**
 * Custom error class for LocationIQ service errors
 */
class LocationIQError extends Error {
  constructor(
    message: string,
    public readonly code: LocationIQErrorCodes,
    public readonly details: Record<string, string | number> = {}
  ) {
    super(message);
    this.name = "LocationIQError";
  }
}

/**
 * LocationIQ API service for reverse geocoding with enterprise-grade features
 */
export class LocationIQService {
  private readonly apiKey: string;
  private readonly baseUrl = "https://us1.locationiq.com/v1/reverse.php";
  private readonly cache: Map<string, LocationContext> | Redis;
  private readonly maxCacheSize = 10000;
  private readonly rateLimitDelay = 100;
  private lastRequestTime = 0;

  constructor() {
    this.apiKey = env.LOCATIONIQ_API_KEY;

    // Initialize cache based on environment
    this.cache =
      env.NODE_ENV === "production"
        ? redis
        : new Map<string, LocationContext>();
  }

  /**
   * Validate coordinates using Zod
   */
  private validateCoordinates(latitude: number, longitude: number): void {
    try {
      coordinateSchema.parse({ latitude, longitude });
    } catch (error) {
      throw new LocationIQError("Invalid coordinates", "INVALID_COORDINATES", {
        latitude,
        longitude,
        error: error instanceof Error ? error.message : "Invalid coordinates",
      });
    }
  }

  /**
   * Generate cache key from coordinates
   */
  private getCacheKey(latitude: number, longitude: number): string {
    return `${latitude.toFixed(6)}:${longitude.toFixed(6)}`;
  }

  /**
   * Enforce rate limiting
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await this.sleep(this.rateLimitDelay - timeSinceLastRequest);
    }
  }

  /**
   * Add result to cache
   */
  private async addToCache(
    key: string,
    context: LocationContext
  ): Promise<void> {
    if (this.cache instanceof Map) {
      // In-memory cache with LRU eviction
      if (this.cache.size >= this.maxCacheSize) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey || "non-delete");
      }
      this.cache.set(key, context);
    } else {
      // Upstash Redis cache with 24h expiry
      await this.cache.setex<LocationContext>(key, 86400, context);
    }
  }

  /**
   * Check if error is non-retryable
   */
  private isNonRetryableError(error: unknown): boolean {
    if (!(error instanceof LocationIQError)) return false;
    return [
      "INVALID_COORDINATES",
      "INVALID_RESPONSE",
      "CLIENT_ERROR",
      "RATE_LIMIT_EXCEEDED",
    ].includes(error.code);
  }

  /**
   * Sleep for specified duration
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Create fallback context for failed requests
   */
  private createFallbackContext(coords: {
    latitude: number;
    longitude: number;
  }): LocationContext {
    return {
      coordinates: {
        latitude: coords.latitude,
        longitude: coords.longitude,
      },
      address: {},
      displayName: "Unknown location",
      importance: 0,
      extratags: {},
    };
  }

  /**
   * Transform LocationIQ response to LocationContext
   */
  private transformResponse(data: LocationIQReverseResponse): LocationContext {
    return {
      coordinates: {
        latitude: parseFloat(data.lat),
        longitude: parseFloat(data.lon),
      },
      address: {
        country: data.address?.country,
        state: data.address?.state,
        city: data.address?.city,
        district: data.address?.suburb,
        road: data.address?.road,
        postcode: data.address?.postcode,
      },
      displayName:
        data.display_name || data.namedetails?.name || "Unknown location",
      importance: data.importance || 0,
      extratags: data.extratags || {},
    };
  }

  /**
   * Perform reverse geocoding with caching and error handling
   */
  async reverseGeocode(
    latitude: number,
    longitude: number,
    options: {
      useCache?: boolean;
      retries?: number;
      timeout?: number;
    } = {}
  ): Promise<LocationContext> {
    const { useCache = true, retries = 3, timeout = 10000 } = options;

    this.validateCoordinates(latitude, longitude);
    const cacheKey = this.getCacheKey(latitude, longitude);

    // Check cache
    if (useCache) {
      if (this.cache instanceof Map) {
        if (this.cache.has(cacheKey)) {
          return this.cache.get(cacheKey)!;
        }
      } else {
        const cached = await this.cache.get<LocationContext>(cacheKey);
        if (cached) {
          return cached;
        }
      }
    }

    await this.enforceRateLimit();

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await this.performRequest(latitude, longitude, timeout);

        if (useCache) {
          await this.addToCache(cacheKey, result);
        }

        return result;
      } catch (error) {
        if (this.isNonRetryableError(error)) {
          throw error;
        }
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await this.sleep(delay);
        }
      }
    }

    throw new LocationIQError(
      `Reverse geocoding failed after ${retries + 1}`,
      "REQUEST_FAILED",
      { latitude, longitude, attempts: retries + 1 }
    );
  }

  /**
   * Batch reverse geocoding for multiple coordinates
   */
  async batchReverseGeocode(
    coordinates: Array<{ latitude: number; longitude: number }>,
    options: {
      concurrency?: number;
      useCache?: boolean;
    } = {}
  ): Promise<LocationContext[]> {
    const { concurrency = 5, useCache = true } = options;

    const results: LocationContext[] = [];

    for (let i = 0; i < coordinates.length; i += concurrency) {
      const batch = coordinates.slice(i, i + concurrency);
      const batchPromises = batch.map(({ latitude, longitude }) =>
        this.reverseGeocode(latitude, longitude, { useCache })
      );

      const batchResults = await Promise.allSettled(batchPromises);

      for (const result of batchResults) {
        if (result.status === "fulfilled") {
          results.push(result.value);
        } else {
          console.error("Batch geocoding error:", result.reason);
          results.push(this.createFallbackContext(batch[results.length]));
        }
      }
    }

    return results;
  }

  /**
   * Perform the actual HTTP request to LocationIQ API
   */
  private async performRequest(
    latitude: number,
    longitude: number,
    timeout: number
  ): Promise<LocationContext> {
    const url = new URL(this.baseUrl);
    url.searchParams.set("key", this.apiKey);
    url.searchParams.set("lat", latitude.toString());
    url.searchParams.set("lon", longitude.toString());
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("extratags", "1");
    url.searchParams.set("namedetails", "1");
    url.searchParams.set("accept-language", "en");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      this.lastRequestTime = Date.now();

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "User-Agent": "HarmonicRealm/1.0",
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          throw new LocationIQError(
            "Rate limit exceeded",
            "RATE_LIMIT_EXCEEDED",
            { status: response.status }
          );
        }

        if (response.status >= 400 && response.status < 500) {
          throw new LocationIQError(
            `Client error: ${response.status}`,
            "CLIENT_ERROR",
            { status: response.status }
          );
        }

        throw new LocationIQError(
          `HTTP error: ${response.status}`,
          "HTTP_ERROR",
          { status: response.status }
        );
      }

      const data: LocationIQReverseResponse = await response.json();

      if (!data || typeof data !== "object") {
        throw new LocationIQError(
          "Invalid response format",
          "INVALID_RESPONSE",
          { data }
        );
      }

      return this.transformResponse(data);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        throw new LocationIQError(
          `Request timeout after ${timeout}ms`,
          "TIMEOUT",
          { timeout }
        );
      }

      if (error instanceof LocationIQError) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : "Unknown Error";
      console.log(errorMessage, error);

      throw new LocationIQError(
        `Network error: ${errorMessage}`,
        "NETWORK_ERROR"
      );
    }
  }
}

// Singleton instance
export const locationIQ = new LocationIQService();
