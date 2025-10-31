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
