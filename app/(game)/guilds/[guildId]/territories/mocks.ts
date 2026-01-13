import { addDays } from "date-fns";
import type { InitialTerritories, InitialChallenges } from "./services";

function seedFromString(s: string) {
  let v = 0;
  for (let i = 0; i < s.length; i++) v += s.charCodeAt(i);
  return v;
}

export function getMockGuildTerritories(
  guildId: string,
  count = 8
): InitialTerritories {
  const seed = seedFromString(guildId);
  const items: InitialTerritories = Array.from({ length: count }).map(
    (_, i) => {
      const n = (seed + i * 37) % 1000;
      const hexId = `8a${(100000 + n).toString(16)}`;
      const active = n % 4 === 0;
      const controlDays = 7 - (n % 5);

      return {
        id: `terr-${n}`,
        hexId,
        activeChallengeId: active ? `challenge-${n}` : null,
        activeChallenge: null,
        nodes: [],
        createdAt: new Date(),
        centerLat: 7.5,
        controlEndsAt: addDays(new Date(), controlDays),
        trafficScore: 50 + (n % 200),
        nodeCount: 3 + (n % 10),
        centerLon: 0,
        resolution: 1,
        guildId,
        controlledAt: new Date(),
        currentStake: 100,
        guild: {
          id: guildId,
          name: `Guild ${guildId}`,
          tag: `G${guildId.slice(0, 3)}`,
          emblem: "🧠",
        },
        category: n % 3 === 0 ? "high" : n % 3 === 1 ? "medium" : "low",
      };
    }
  );

  return items;
}

export function getMockGuildTerritoryStats(guildId: string) {
  const territories = getMockGuildTerritories(guildId, 9);
  const controlled = territories.filter((t) => !t.activeChallengeId).length;
  const underChallenge = territories.filter(
    (t) => !!t.activeChallengeId
  ).length;
  const expiring = territories.filter((t) => {
    const d = t.controlEndsAt || new Date();
    return d > new Date() && d <= addDays(new Date(), 1);
  }).length;
  const totalStaked = territories.reduce(
    (s, t) => s + Math.round(100 + (t.trafficScore || 0) / 2),
    0
  );

  return {
    controlledTerritories: controlled,
    territoriesUnderChallenge: underChallenge,
    expiringTerritories: expiring,
    totalStaked,
  };
}

export function getMockGuildChallenges(
  guildId: string,
  limit = 5
): InitialChallenges {
  const seed = seedFromString(guildId);
  const items: InitialChallenges = Array.from({ length: limit }).map((_, i) => {
    const n = (seed + i * 13) % 1000;
    return {
      id: `challenge-${n}`,
      territory: {
        hexId: `8a${(100000 + n).toString(16)}`,
        centerLat: 37.7 + (n % 100) / 1000,
        centerLon: -122.4 - (n % 100) / 1000,
      },
      attacker: { name: `Attacker ${n}`, tag: `A${n % 100}`, emblem: "🧠" },
      defender: { name: `Defender ${n}`, tag: `D${n % 100}`, emblem: "🧠" },
      contributions: [],
      defenderScore: 100 + (n % 50),
      attackerScore: 90 + (n % 50),
      endsAt: addDays(new Date(), 2 + (n % 5)),
      createdAt: new Date(),
      territoryId: `8a${(100000 + n).toString(16)}`,
      defenderId: "",
      defenderStake: 100,
      attackerId: "",
      attackerStake: 100,
      resolved: false,
      winnerId: "",
    };
  });

  return items;
}
