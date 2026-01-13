import { h3ToFeature, h3SetToFeatureCollection } from "geojson2h3";
import { bbox } from "@turf/bbox";
import { featureCollection, point } from "@turf/helpers";

import { TERRITORY_MIN_STAKE } from "@/config/guilds/constants";
import type { NodeTypeRarity } from "../generated/prisma/enums";

export function calculateMinStake(trafficScore: number): number {
  // High-traffic = expensive
  if (trafficScore > 300) return 1000;
  if (trafficScore > 150) return 500;
  if (trafficScore > 50) return 200;
  return TERRITORY_MIN_STAKE;
}

/**
 * Get bounding box for a hex
 */
export function getHexBoundingBox(hexId: string) {
  const geoJson = h3ToFeature(hexId);
  return bbox(geoJson);
}

/**
 * Create feature collection from hex boundaries
 */
export function createHexFeatureCollection(hexIds: string[]) {
  return h3SetToFeatureCollection(hexIds);
}

type Node = {
  longitude: number;
  latitude: number;
  id: string;
  name: string;
  type: { rarity: NodeTypeRarity };
};

/**
 * Convert node GeoJSON to H3 features
 */
export function nodesToH3Features(nodes: Node[]) {
  const features = nodes.map((node) =>
    point([node.longitude, node.latitude], {
      nodeId: node.id,
      name: node.name,
      rarity: node.type.rarity,
    })
  );

  return featureCollection(features);
}

/**
 * Calculate bounds for multiple hexes
 */
export function calculateHexesBounds(hexIds: string[]) {
  if (hexIds.length === 0) return null;

  const collection = createHexFeatureCollection(hexIds);
  const bounds = bbox(collection);
  return bounds as [number, number, number, number];
}

/**
 * Convert bbox to maplibregl compatible bounds
 */
export function bboxToMapLibreBounds(bounds: [number, number, number, number]) {
  return [
    [bounds[0], bounds[1]], // southwest
    [bounds[2], bounds[3]], // northeast
  ] as [[number, number], [number, number]];
}
