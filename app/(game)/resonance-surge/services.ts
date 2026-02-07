import { format } from "date-fns";
import { cache } from "react";

import prisma from "@/lib/prisma";
import type { NodeTypeRarity } from "@/lib/generated/prisma/enums";

export type SurgeNode = {
  id: string;
  h3Index: string;
  activityScore: number;
  hexRank: number;
  isStabilized: boolean;
  stabilizedAt: Date | null;
  stabilizedBy: string | null;
  spawnedAt: Date;
  expiresAt: Date;
  baseMultiplier: number;
  node: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    type: {
      name: string;
      rarity: NodeTypeRarity;
      baseYieldPerMinute: number;
    };
  };
};

export type SurgeSpawnLog = {
  spawnCycle: string;
  totalNodesSpawned: number;
  totalHexesConsidered: number;
  topHexes: PrismaJson.TopHexes[];
};

/**
 * Fetch all surge data for today (cached per request)
 * Use React cache() to deduplicate across components
 */
export const getSurgeData = cache(async () => {
  const today = format(new Date(), "yyyy-MM-dd");

  const [surges, spawnLog] = await Promise.all([
    prisma.resonanceSurge.findMany({
      where: { spawnCycle: today },
      include: {
        node: {
          select: {
            id: true,
            name: true,
            latitude: true,
            longitude: true,
            type: {
              select: {
                name: true,
                rarity: true,
                baseYieldPerMinute: true,
              },
            },
          },
        },
      },
      orderBy: { hexRank: "asc" },
    }),
    prisma.surgeSpawnLog.findUnique({
      where: { spawnCycle: today },
    }),
  ]);

  return { surges: surges as SurgeNode[], spawnLog };
});
