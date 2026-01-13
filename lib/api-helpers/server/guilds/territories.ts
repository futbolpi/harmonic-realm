import { cellToBoundary, latLngToCell } from "h3-js";

import { TERRITORY_H3_RES } from "@/config/guilds/constants";
import prisma from "@/lib/prisma";

export const getNodesToClaim = async (hexId: string): Promise<string[]> => {
  const boundary = cellToBoundary(hexId);
  const lats = boundary.map((p: [number, number]) => p[0]);
  const lngs = boundary.map((p: [number, number]) => p[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const candidates = await prisma.node.findMany({
    where: {
      latitude: { gte: minLat, lte: maxLat },
      longitude: { gte: minLng, lte: maxLng },
      territoryHexId: null,
    },
    select: { id: true, latitude: true, longitude: true },
  });

  const nodesToClaim = candidates
    .filter(
      (n) => latLngToCell(n.latitude, n.longitude, TERRITORY_H3_RES) === hexId
    )
    .map((n) => n.id);

  return nodesToClaim;
};

/**
 * Add sharePoints as a contribution to an active territory challenge (if present).
 * - nodeId: node where the activity happened
 * - username: player's username (used for upsert and guild membership)
 * - sharePoints: amount of SP to contribute
 */
export async function contributeToChallengeScore(
  nodeId: string,
  username: string,
  sharePoints: number
) {
  if (!nodeId || !username) return { success: false, reason: "missing-args" };
  if (!sharePoints || sharePoints <= 0)
    return { success: false, reason: "no-points" };

  // Fetch node -> territory
  const node = await prisma.node.findUnique({
    where: { id: nodeId },
    select: { territoryHexId: true },
  });
  if (!node?.territoryHexId) return { success: false, reason: "no-territory" };

  // Fetch territory + active challenge
  const territory = await prisma.territory.findUnique({
    where: { hexId: node.territoryHexId },
    select: {
      activeChallenge: {
        select: {
          resolved: true,
          defenderId: true,
          attackerId: true,
          id: true,
        },
      },
      id: true,
    },
  });

  const challenge = territory?.activeChallenge;
  if (!challenge || challenge.resolved)
    return { success: false, reason: "no-active-challenge" };

  // Find player's guild membership (must be active)
  const member = await prisma.guildMember.findFirst({
    where: { username, isActive: true },
    select: { guildId: true },
  });
  if (!member) return { success: false, reason: "not-a-member" };

  if (![challenge.defenderId, challenge.attackerId].includes(member.guildId)) {
    return { success: false, reason: "not-participating-guild" };
  }

  // Upsert contribution and increment challenge score atomically
  try {
    await prisma.$transaction(async (tx) => {
      await tx.territoryContribution.upsert({
        where: {
          challengeId_username: {
            challengeId: challenge.id,
            username,
          },
        },
        create: {
          challengeId: challenge.id,
          username,
          sharePoints,
          tuneCount: 1,
        },
        update: {
          sharePoints: { increment: sharePoints },
          tuneCount: { increment: 1 },
        },
      });

      // Increment the correct challenge-side score
      if (member.guildId === challenge.defenderId) {
        await tx.territoryChallenge.update({
          where: { id: challenge.id },
          data: { defenderScore: { increment: sharePoints } },
        });
      } else {
        await tx.territoryChallenge.update({
          where: { id: challenge.id },
          data: { attackerScore: { increment: sharePoints } },
        });
      }
    });

    return { success: true };
  } catch (e) {
    console.warn("Failed to record territory contribution", e);
    return { success: false, reason: "db-error" };
  }
}
