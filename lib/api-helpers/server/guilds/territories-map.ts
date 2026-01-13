import { featureToH3Set } from "geojson2h3";

import prisma from "@/lib/prisma";

export type TerritoryForMap = {
  id: string;
  hexId: string;
  centerLat: number;
  centerLon: number;
  guild: { id: string; name: string; tag: string; emblem: string } | null;
  trafficScore: number;
  nodeCount: number;
  controlEndsAt: Date | null;
  activeChallengeId?: string | null;
  activeChallengeEndsAt?: Date | null;
};

export async function getTerritoriesForMap(): Promise<TerritoryForMap[]> {
  const territories = await prisma.territory.findMany({
    select: {
      id: true,
      hexId: true,
      centerLat: true,
      centerLon: true,
      guild: { select: { id: true, emblem: true, tag: true, name: true } },
      trafficScore: true,
      controlEndsAt: true,
      activeChallenge: { select: { id: true, endsAt: true } },
      _count: { select: { nodes: true } },
    },
  });

  return territories.map((t) => {
    // Convert boundary to [lng, lat] pairs for maplibre

    return {
      id: t.id,
      hexId: t.hexId,
      centerLat: t.centerLat,
      centerLon: t.centerLon,
      guild: t.guild,
      trafficScore: t.trafficScore,
      nodeCount: t._count.nodes,
      controlEndsAt: t.controlEndsAt,
      activeChallengeId: t.activeChallenge?.id ?? null,
      activeChallengeEndsAt: t.activeChallenge?.endsAt ?? null,
    };
  });
}

/**
 * Convert a GeoJSON polygon to H3 cells at the given resolution.
 * Uses the installed geojson2h3 helper.
 */
export function polygonToHexes(
  geojson: GeoJSON.Feature<GeoJSON.Polygon>,
  res: number
) {
  return featureToH3Set(geojson, res);
}
