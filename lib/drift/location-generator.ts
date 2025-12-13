import type {
  FeatureCollection,
  GeoJsonProperties,
  MultiPolygon,
  Polygon,
} from "geojson";
import { isOnLand } from "../node-spawn/node-generator";

interface LandGeneratorParams {
  lat: number;
  lon: number;
  geojson: FeatureCollection<MultiPolygon | Polygon, GeoJsonProperties>;
  minDistanceKm?: number;
  maxDistanceKm?: number;
  maxAttempts?: number;
}

export function generateRandomLandCoordinate({
  geojson,
  lat,
  lon,
  maxAttempts = 100,
  maxDistanceKm = 8,
  minDistanceKm = 2,
}: LandGeneratorParams): { lat: number; lon: number } | null {
  const EARTH_RADIUS_KM = 6371;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Generate random distance within annulus
    const minDistanceRadians = minDistanceKm / EARTH_RADIUS_KM;
    const maxDistanceRadians = maxDistanceKm / EARTH_RADIUS_KM;

    // Use square root for uniform distribution in circular area
    const u = Math.random();
    const distanceRadians = Math.sqrt(
      u * (maxDistanceRadians ** 2 - minDistanceRadians ** 2) +
        minDistanceRadians ** 2
    );

    // Generate random bearing (0 to 2π)
    const bearing = Math.random() * 2 * Math.PI;

    // Convert original coordinates to radians
    const latRad = (lat * Math.PI) / 180;
    const lonRad = (lon * Math.PI) / 180;

    // Calculate new coordinates using haversine formula
    const newLatRad = Math.asin(
      Math.sin(latRad) * Math.cos(distanceRadians) +
        Math.cos(latRad) * Math.sin(distanceRadians) * Math.cos(bearing)
    );

    const newLonRad =
      lonRad +
      Math.atan2(
        Math.sin(bearing) * Math.sin(distanceRadians) * Math.cos(latRad),
        Math.cos(distanceRadians) - Math.sin(latRad) * Math.sin(newLatRad)
      );

    // Convert back to degrees
    const newLat = (newLatRad * 180) / Math.PI;
    const newLon = (newLonRad * 180) / Math.PI;

    // Normalize longitude to [-180, 180]
    const normalizedLon = ((newLon + 540) % 360) - 180;

    // Check if the new coordinate is on land
    if (isOnLand(normalizedLon, newLat, geojson)) {
      return { lat: newLat, lon: normalizedLon };
    }
  }
  // Return null if no valid land coordinate found after max attempts
  return null;
}
