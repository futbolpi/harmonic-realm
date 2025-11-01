export const BIN_SIZE = 0.1;

// Utility: Bin lat/lon (call when creating MiningSession, e.g., in API)
export function binLatLon(
  lat: number,
  lon: number,
  binSize = BIN_SIZE
): { latitudeBin: number; longitudeBin: number } {
  if (isNaN(lat) || isNaN(lon)) throw new Error("Invalid lat/lon");
  return {
    latitudeBin: Math.floor(lat / binSize) * binSize,
    longitudeBin: Math.floor(lon / binSize) * binSize,
  };
}

// Bin ID
export function getBinId(latitudeBin: number, longitudeBin: number): string {
  return `${latitudeBin}_${longitudeBin}`;
}

/**
 * Get bin bounds for map display
 */
export function getBinBounds(
  latBin: number,
  lonBin: number,
  binSize = BIN_SIZE
) {
  return {
    north: latBin + binSize,
    south: latBin,
    east: lonBin + binSize,
    west: lonBin,
  };
}

/**
 * Checks if a given latitude and longitude pair is valid.
 *
 * @param lat - The latitude value (number).
 * @param lon - The longitude value (number).
 * @returns {boolean} - True if coordinates are valid, false otherwise.
 */
export function isValidCoordinates(lat: number, lon: number): boolean {
  // Check if the values are actual numbers.
  // This check correctly handles NaN, as NaN is the only
  // value in JavaScript that is not equal to itself.
  // A more explicit check is `if (isNaN(lat) || isNaN(lon))`.
  if (
    typeof lat !== "number" ||
    typeof lon !== "number" ||
    isNaN(lat) ||
    isNaN(lon)
  ) {
    return false;
  }

  // Check if latitude is within the valid range [-90, 90]
  if (lat < -90 || lat > 90) {
    return false;
  }

  // Check if longitude is within the valid range [-180, 180]
  if (lon < -180 || lon > 180) {
    return false;
  }

  // If all checks pass, the coordinates are valid
  return true;
}
