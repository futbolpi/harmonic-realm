import { latLngToCell, cellToBoundary, gridDisk } from "h3-js";

export const SURGE_H3_RESOLUTION = 7; // ~5.1 km² hexes (~461m edge length)

/**
 * Converts lat/lng to H3 index at Surge resolution
 */
export function getH3Index(lat: number, lng: number): string {
  return latLngToCell(lat, lng, SURGE_H3_RESOLUTION);
}

/**
 * Gets H3 boundary as GeoJSON polygon (for map display)
 */
export function getH3Boundary(h3Index: string): number[][] {
  const boundary = cellToBoundary(h3Index, true); // [lng, lat] format
  return boundary;
}

/**
 * Gets neighboring hexes (for proximity analysis)
 */
export function getNeighborHexes(h3Index: string, rings: number = 1): string[] {
  return gridDisk(h3Index, rings);
}
