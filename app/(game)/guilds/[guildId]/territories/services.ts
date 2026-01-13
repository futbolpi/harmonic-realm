import { addDays } from "date-fns";

import { getTerritoryCategory } from "@/app/(game)/territories/[hexId]/utils";
import prisma from "@/lib/prisma";

/**
 * Get all territories controlled by a guild
 */
export async function getGuildTerritories(guildId: string) {
  const territories = await prisma.territory.findMany({
    where: { guildId },
    include: {
      guild: {
        select: { id: true, name: true, tag: true, emblem: true },
      },
      activeChallenge: {
        select: {
          id: true,
          createdAt: true,
          endsAt: true,
          attacker: { select: { name: true, tag: true, emblem: true } },
          defenderScore: true,
          attackerScore: true,
        },
      },
      nodes: { select: { id: true } },
    },
    orderBy: { controlledAt: "desc" },
  });

  return territories.map((t) => ({
    ...t,
    category: getTerritoryCategory(t.trafficScore),
    nodeCount: t.nodes.length,
  }));
}

/**
 * Get guild statistics for territories overview
 */
export async function getGuildTerritoryStats(guildId: string) {
  const now = new Date();

  const [controlled, underChallenge, expiring, totalStaked] = await Promise.all(
    [
      prisma.territory.count({
        where: {
          guildId,
          controlEndsAt: { gt: now },
          activeChallenge: null,
        },
      }),
      prisma.territory.count({
        where: {
          guildId,
          activeChallengeId: { not: null },
        },
      }),
      prisma.territory.count({
        where: {
          guildId,
          controlEndsAt: {
            gt: now,
            lte: addDays(now, 1),
          },
        },
      }),
      prisma.territory.aggregate({
        where: { guildId },
        _sum: { currentStake: true },
      }),
    ]
  );

  return {
    controlledTerritories: controlled,
    territoriesUnderChallenge: underChallenge,
    expiringTerritories: expiring,
    totalStaked: totalStaked._sum.currentStake || 0,
  };
}

/**
 * Get active and recent challenges for guild
 */
export async function getGuildChallenges(guildId: string, limit = 10) {
  const challenges = await prisma.territoryChallenge.findMany({
    where: {
      OR: [
        { defenderId: guildId, resolved: false },
        { attackerId: guildId, resolved: false },
      ],
    },
    include: {
      territory: { select: { hexId: true, centerLat: true, centerLon: true } },
      attacker: { select: { name: true, tag: true, emblem: true } },
      defender: { select: { name: true, tag: true, emblem: true } },
      contributions: {
        select: { username: true, sharePoints: true, tuneCount: true },
        orderBy: { sharePoints: "desc" },
        take: 5,
      },
    },
    orderBy: { endsAt: "desc" },
    take: limit,
  });

  return challenges;
}

export type InitialTerritories = Awaited<
  ReturnType<typeof getGuildTerritories>
>;

export type InitialChallenges = Awaited<ReturnType<typeof getGuildChallenges>>;
