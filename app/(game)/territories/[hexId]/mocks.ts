import { addDays, subDays } from "date-fns";
import { cellToLatLng, isValidCell } from "h3-js";

import { NodeTypeRarity } from "@/lib/generated/prisma/enums";
import type { TerritoryDetail } from "./services";

/**
 * Lightweight deterministic helper to derive a number from a string.
 * Keeps mock outputs predictable based on `hexId`.
 */
function simpleSeed(hexId: string) {
  let s = 0;
  for (let i = 0; i < hexId.length; i++) s += hexId.charCodeAt(i);
  return s;
}

export function getMockTerritoryDetail(hexId: string): TerritoryDetail | null {
  if (!isValidCell(hexId)) {
    return null;
  }

  const seed = simpleSeed(hexId);
  const now = new Date();

  const guild =
    seed % 3 === 0
      ? {
          id: `guild-${(seed % 1000).toString()}`,
          name: `Guild ${(seed % 1000).toString()}`,
          tag: `G${(seed % 100).toString()}`,
          emblem: `/images/emblems/${(seed % 6) + 1}.png`,
          vaultBalance: 5000 + (seed % 5000),
          members: [
            { username: "leader_one", role: "LEADER" as const },
            { username: "officer_two", role: "OFFICER" as const },
          ],
        }
      : null;

  const nodeCount = 6 + (seed % 12);

  const [centerLat, centerLon] = cellToLatLng(hexId);

  const nodes = Array.from({ length: Math.min(nodeCount, 50) }).map((_, i) => {
    // deterministic small offsets around center (within ~300m)
    const angle = ((seed + i * 37) % 360) * (Math.PI / 180);
    const radius = 0.0004 + ((seed + i) % 10) / 10000; // ~0.0004 deg ~44m base
    const lat = centerLat + Math.sin(angle) * radius;
    const lon = centerLon + Math.cos(angle) * radius;
    return {
      id: `node-${seed}-${i}`,
      name: `Node ${i + 1}`,
      latitude: lat,
      longitude: lon,
      type: {
        name: ["Solar Core", "Resonant Cache", "Harmonic Vault"][i % 3],
        rarity: ["Common", "Uncommon", "Rare", "Epic", "Legendary"][
          i % 5
        ] as NodeTypeRarity,
      },
    };
  });

  const activeChallenge =
    seed % 5 === 0
      ? {
          id: `challenge-${seed}`,
          createdAt: addDays(now, -1),
          territoryId: `terr-${hexId}`,
          defenderId: guild ? guild.id : `guild-${(seed + 1) % 10}`,
          defenderStake: 500,
          defenderScore: 120,
          attackerId: `guild-${(seed + 2) % 10}`,
          attackerStake: 500,
          attackerScore: 100,
          endsAt: addDays(now, 2),
          resolved: false,
          winnerId: null,
          defender: guild
            ? {
                id: guild.id,
                name: guild.name,
                tag: guild.tag,
                emblem: "🫀",
              }
            : {
                id: `guild-${(seed + 1) % 10}`,
                name: "Defender Guild",
                tag: "DF",
                emblem: "🧠",
              },
          attacker: {
            id: `guild-${(seed + 2) % 10}`,
            name: "Attacker Guild",
            tag: "AT",
            emblem: "🧠",
          },
          contributions: Array.from({ length: Math.min(8, nodes.length) }).map(
            (_, j) => ({
              username: `player_${j + 1}`,
              sharePoints: Math.round(50 + j * 10 + (seed % 30)),
              tuneCount: 1 + (j % 3),
            })
          ),
        }
      : null;

  const challengeHistory = Array.from({ length: Math.min(3, seed % 4) }).map(
    (_, k) => ({
      id: `hist-${seed}-${k}`,
      createdAt: addDays(now, -30 + k * 5),
      endsAt: addDays(now, -25 + k * 5),
      resolved: true,
      winnerId: k % 2 === 0 ? (guild ? guild.id : `guild-win-${k}`) : null,
      defenderId: guild ? guild.id : `guild-def-${k}`,
      defender: { name: guild ? guild.name : `Guild Def ${k}`, tag: `D${k}` },
      attacker: { name: `Guild Att ${k}`, tag: `A${k}` },
      defenderScore: 100 + k * 10,
      attackerScore: 80 + k * 5,
    })
  );

  return {
    id: `mock-territory-${hexId}`,
    hexId,
    centerLat: centerLat,
    centerLon: centerLon,
    trafficScore: 100 + (seed % 200),
    currentStake: 200 + (seed % 800),
    controlEndsAt: guild ? addDays(now, 7) : null,
    controlledAt: guild ? addDays(now, -3) : null,
    guild: guild
      ? {
          id: guild.id,
          name: guild.name,
          tag: guild.tag,
          emblem: guild.emblem,
          vaultBalance: guild.vaultBalance,
          members: guild.members,
        }
      : null,
    activeChallenge: activeChallenge,
    nodes,
    challengeHistory,
    activeChallengeId: activeChallenge?.id || null,
    createdAt: subDays(now, 1),
    resolution: 1,
    guildId: guild?.id || null,
    // _count: { nodes: nodes.length },
  };
}

export function getMockTerritoryDetailMeta(hexId: string) {
  const seed = simpleSeed(hexId);
  return {
    trafficScore: 100 + (seed % 200),
    guild:
      seed % 3 === 0 ? { name: `Guild ${(seed % 1000).toString()}` } : null,
    _count: { nodes: 6 + (seed % 12) },
  };
}
