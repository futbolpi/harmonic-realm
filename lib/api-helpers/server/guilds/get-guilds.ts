/**
 * Temporary mock guilds data for UI prototyping
 * Exports getGuilds() and getGuild(guildId)
 */

export type VaultTransaction = {
  id: string;
  createdAt: string;
  guildMemberId: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reason?: string;
};

export type GuildMember = {
  id: string;
  joinedAt: string;
  userId: string;
  username: string;
  role: "LEADER" | "OFFICER" | "MEMBER";
  vaultContribution: number;
  weeklySharePoints: number;
};

export type Challenge = {
  id: string;
  title: string;
  progress: number; // 0..100
  current: number;
  target: number;
  rewardRes: number;
  rewardPrestige: number;
  endsIn: string; // human readable
};

export type Territory = {
  id: string;
  zone: string;
  status: "WAR" | "CONTROLLED" | "COOLDOWN";
  timeLeft: string;
};

export type Artifact = {
  id: string;
  name: string;
  level: number;
  effect: string;
};

export type Activity = {
  id: string;
  text: string;
  when: string;
};

export type Contributor = {
  id: string;
  username: string;
  sharePoints: number;
};

export type Guild = {
  id: string;
  createdAt: string;
  name: string;
  description?: string;
  emblem: string;
  tag: string;
  leaderId: string;
  leaderName: string;
  members: GuildMember[];
  maxMembers: number;
  vaultBalance: number;
  totalContributed: number;
  vaultLevel: number;
  totalSharePoints: number;
  totalNodesMined: number;
  totalTunesPerfect: number;
  weeklyActivity: number;
  isPublic: boolean;
  requireApproval: boolean;
  minRF: number;
  vaultTransactions: VaultTransaction[];
  activeChallenges: Challenge[];
  territories: Territory[];
  artifacts: Artifact[];
  recentActivity: Activity[];
  topContributors: Contributor[];
  // Optional: creation payment info
  paymentId?: string | null;
  piTransactionId?: string | null;
};

// Helper to get current ISO timestamp minus some minutes
const iso = (mins = 0) => new Date(Date.now() - mins * 60_000).toISOString();

const GUILDS: Guild[] = [
  {
    id: "guild-1",
    createdAt: iso(60 * 24 * 10),
    name: "Astra Conservatory",
    description: "We tune the stars into harmonic resonance.",
    emblem: "🌌",
    tag: "ASTR",
    leaderId: "user-1",
    leaderName: "PlayerX",
    members: [
      {
        id: "gm-1",
        joinedAt: iso(60 * 24 * 30),
        userId: "user-1",
        username: "PlayerX",
        role: "LEADER",
        vaultContribution: 1250,
        weeklySharePoints: 2450,
      },
      {
        id: "gm-2",
        joinedAt: iso(60 * 24 * 12),
        userId: "user-2",
        username: "PlayerY",
        role: "OFFICER",
        vaultContribution: 890,
        weeklySharePoints: 1890,
      },
      {
        id: "gm-3",
        joinedAt: iso(60 * 24 * 8),
        userId: "user-3",
        username: "PlayerZ",
        role: "MEMBER",
        vaultContribution: 430,
        weeklySharePoints: 1230,
      },
    ],
    maxMembers: 30,
    vaultBalance: 12450,
    totalContributed: 54321,
    vaultLevel: 12,
    totalSharePoints: 12340,
    totalNodesMined: 820,
    totalTunesPerfect: 180,
    weeklyActivity: 420,
    isPublic: true,
    requireApproval: false,
    minRF: 0,
    vaultTransactions: [
      {
        id: "vt-1",
        createdAt: iso(60 * 6),
        guildMemberId: "gm-1",
        type: "DEPOSIT",
        amount: 250,
        balanceBefore: 12100,
        balanceAfter: 12350,
        reason: "Member deposit",
      },
    ],
    activeChallenges: [
      {
        id: "c-1",
        title: "Harmonic Marathon",
        progress: 78,
        current: 7845,
        target: 10000,
        rewardRes: 500,
        rewardPrestige: 100,
        endsIn: "2d 14h",
      },
      {
        id: "c-2",
        title: "Territory Defense",
        progress: 23,
        current: 2300,
        target: 10000,
        rewardRes: 250,
        rewardPrestige: 40,
        endsIn: "18h 32m",
      },
    ],
    territories: [
      { id: "t-1", zone: "#8472", status: "WAR", timeLeft: "2h 14m" },
      { id: "t-2", zone: "#9103", status: "CONTROLLED", timeLeft: "5d 3h" },
      { id: "t-3", zone: "#7456", status: "CONTROLLED", timeLeft: "6d 18h" },
    ],
    artifacts: [
      { id: "a-1", name: "Harmonic Amplifier", level: 5, effect: "+8% SP" },
      { id: "a-2", name: "Resonance Lens", level: 3, effect: "+10% Acc" },
    ],
    recentActivity: [
      { id: "act-1", text: "PlayerX deposited 250 RES", when: "2h ago" },
      { id: "act-2", text: "Captured Zone #9103 (+200 🏆)", when: "5h ago" },
      { id: "act-3", text: "Challenge completed (+500 RES)", when: "8h ago" },
      { id: "act-4", text: "PlayerY joined the guild", when: "12h ago" },
    ],
    topContributors: [
      { id: "c1", username: "PlayerX", sharePoints: 2450 },
      { id: "c2", username: "PlayerY", sharePoints: 1890 },
      { id: "c3", username: "PlayerZ", sharePoints: 1230 },
    ],
      paymentId: null,
      piTransactionId: null,
  },

  {
    id: "guild-2",
    createdAt: iso(60 * 24 * 20),
    name: "Resonant Sanctum",
    description: "Guardians of locality resonance",
    emblem: "🏛️",
    tag: "RSCT",
    leaderId: "user-4",
    leaderName: "LeaderA",
    members: [
      { id: "gm-4", joinedAt: iso(60 * 24 * 22), userId: "user-4", username: "LeaderA", role: "LEADER", vaultContribution: 5120, weeklySharePoints: 1120 },
      { id: "gm-5", joinedAt: iso(60 * 24 * 15), userId: "user-5", username: "Alpha", role: "OFFICER", vaultContribution: 2100, weeklySharePoints: 820 },
    ],
    maxMembers: 20,
    vaultBalance: 8450,
    totalContributed: 28500,
    vaultLevel: 8,
    totalSharePoints: 8600,
    totalNodesMined: 420,
    totalTunesPerfect: 72,
    weeklyActivity: 210,
    isPublic: false,
    requireApproval: true,
    minRF: 50,
    vaultTransactions: [],
    activeChallenges: [],
    territories: [{ id: "t-4", zone: "#6655", status: "CONTROLLED", timeLeft: "3d 2h" }],
    artifacts: [{ id: "a-3", name: "Echo Totem", level: 2, effect: "+3% SP" }],
    recentActivity: [{ id: "act-5", text: "Member Alpha joined the guild", when: "1d ago" }],
    topContributors: [{ id: "c4", username: "LeaderA", sharePoints: 1120 }],
      paymentId: "pay-1",
      piTransactionId: "tx-1",
  },

  {
    id: "guild-3",
    createdAt: iso(60 * 24 * 60),
    name: "Lattice Wardens",
    description: "Securing harmonics through discipline",
    emblem: "⚔️",
    tag: "WARD",
    leaderId: "user-6",
    leaderName: "Warden",
    members: [
      { id: "gm-6", joinedAt: iso(60 * 24 * 40), userId: "user-6", username: "Warden", role: "LEADER", vaultContribution: 760, weeklySharePoints: 340 },
    ],
    maxMembers: 15,
    vaultBalance: 3200,
    totalContributed: 12200,
    vaultLevel: 4,
    totalSharePoints: 4200,
    totalNodesMined: 210,
    totalTunesPerfect: 40,
    weeklyActivity: 120,
    isPublic: true,
    requireApproval: false,
    minRF: 0,
    vaultTransactions: [],
    activeChallenges: [],
    territories: [],
    artifacts: [],
    recentActivity: [],
    topContributors: [],
  },

  {
    id: "guild-4",
    createdAt: iso(60 * 24 * 4),
    name: "Echo Nomads",
    description: "Traveling artisans of resonance",
    emblem: "🧭",
    tag: "NOMD",
    leaderId: "user-7",
    leaderName: "Nomad",
    members: [
      { id: "gm-7", joinedAt: iso(60 * 24 * 5), userId: "user-7", username: "Nomad", role: "LEADER", vaultContribution: 60, weeklySharePoints: 50 },
    ],
    maxMembers: 25,
    vaultBalance: 90,
    totalContributed: 900,
    vaultLevel: 1,
    totalSharePoints: 240,
    totalNodesMined: 20,
    totalTunesPerfect: 1,
    weeklyActivity: 5,
    isPublic: true,
    requireApproval: false,
    minRF: 0,
    vaultTransactions: [],
    activeChallenges: [],
    territories: [],
    artifacts: [],
    recentActivity: [],
    topContributors: [],
  },

  {
    id: "guild-5",
    createdAt: iso(60 * 24 * 180),
    name: "Resonance Guild",
    description: "Veteran artisans with long histories",
    emblem: "🏆",
    tag: "RSGD",
    leaderId: "user-8",
    leaderName: "Veteran",
    members: [
      { id: "gm-8", joinedAt: iso(60 * 24 * 200), userId: "user-8", username: "Veteran", role: "LEADER", vaultContribution: 10240, weeklySharePoints: 3200 },
      { id: "gm-9", joinedAt: iso(60 * 24 * 190), userId: "user-9", username: "Ancient", role: "OFFICER", vaultContribution: 4200, weeklySharePoints: 2100 },
    ],
    maxMembers: 40,
    vaultBalance: 45200,
    totalContributed: 120000,
    vaultLevel: 15,
    totalSharePoints: 43200,
    totalNodesMined: 2400,
    totalTunesPerfect: 800,
    weeklyActivity: 980,
    isPublic: true,
    requireApproval: false,
    minRF: 10,
    vaultTransactions: [],
    activeChallenges: [],
    territories: [],
    artifacts: [],
    recentActivity: [],
    topContributors: [],
  },
];

export async function getGuilds(): Promise<Guild[]> {
  // In future this will fetch from prisma
  return GUILDS;
}

export async function getGuild(guildId: string): Promise<Guild | null> {
  const guild = GUILDS.find((g) => g.id === guildId) ?? null;
  return guild;
}

export default getGuilds;
