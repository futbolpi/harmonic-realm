import type { GuildChallengesData } from "../services";

/**
 * Mock data generator for guild challenges page testing
 * Provides realistic test data matching the GuildChallengesData structure
 */

export interface MockGuildChallengesOptions {
  guildId?: string;
  guildName?: string;
  vaultLevel?: number;
  memberCount?: number;
  activeChallengeCount?: number;
  completedChallengeCount?: number;
  availableChallengeCount?: number;
}

const DIFFICULTY_LEVELS = ["EASY", "MEDIUM", "HARD", "BRUTAL"] as const;
const CHALLENGE_ICONS = [
  "⚔️",
  "🏆",
  "💎",
  "🔥",
  "⚡",
  "🌟",
  "🎯",
  "🚀",
] as const;
const GOAL_TYPES = [
  "TOTAL_SHAREPOINTS",
  "UNIQUE_NODES_MINED",
  "PERFECT_TUNES",
  "TERRITORY_CAPTURED",
  "VAULT_CONTRIBUTIONS",
  "MEMBER_STREAKS",
] as const;

/**
 * Generate a mock challenge template
 */
function generateMockChallengeTemplate(index: number) {
  const difficulty = DIFFICULTY_LEVELS[index % DIFFICULTY_LEVELS.length];
  const goalType = GOAL_TYPES[index % GOAL_TYPES.length];
  const icon = CHALLENGE_ICONS[index % CHALLENGE_ICONS.length];

  return {
    id: `template-${index}`,
    name: `Challenge ${index + 1}: ${goalType.replace(/_/g, " ")}`,
    icon,
    description: `Complete ${goalType.toLowerCase()} to earn rewards. This is a ${difficulty.toLowerCase()} difficulty challenge.`,
    difficulty,
    goalType,
    targetValue: 100 + index * 50,
    minMembers: 3 + (index % 5),
    minVaultLevel: 1 + (index % 3),
    resonanceReward: 50 + index * 10,
    prestigeReward: 100 + index * 20,
  };
}

/**
 * Generate mock member contributions (randomized username-value pairs)
 */
function generateMockContributions(count: number = 3): Record<string, number> {
  const usernames = [
    "luminous_knight",
    "echo_sage",
    "void_wanderer",
    "harmony_keeper",
    "stellar_miner",
    "cosmic_guardian",
    "prismatic_weaver",
    "resonant_soul",
  ];

  const contributions: Record<string, number> = {};
  for (let i = 0; i < count; i++) {
    const username = usernames[i % usernames.length];
    contributions[username] = Math.floor(Math.random() * 200) + 10;
  }
  return contributions;
}

/**
 * Generate a mock active challenge progress
 */
function generateMockActiveChallengeProgress(index: number) {
  const template = generateMockChallengeTemplate(index);
  const currentValue = Math.floor(Math.random() * template.targetValue);

  return {
    id: `progress-active-${index}`,
    currentValue,
    targetValue: template.targetValue,
    updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last week
    challenge: {
      id: `challenge-${index}`,
      startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      rewardResonance: template.resonanceReward,
      rewardPrestige: template.prestigeReward,
      template,
    },
    contributions: generateMockContributions(3),
  };
}

/**
 * Generate a mock completed challenge progress
 */
function generateMockCompletedChallengeProgress(index: number) {
  const template = generateMockChallengeTemplate(index + 10);

  return {
    id: `progress-completed-${index}`,
    currentValue: template.targetValue,
    targetValue: template.targetValue,
    completedAt: new Date(
      Date.now() -
        (index + 1) * 24 * 60 * 60 * 1000 -
        Math.random() * 12 * 60 * 60 * 1000
    ), // Within last 7 days
    challenge: {
      id: `challenge-completed-${index}`,
      rewardResonance: template.resonanceReward,
      rewardPrestige: template.prestigeReward,
      template: {
        name: template.name,
        icon: template.icon,
        difficulty: template.difficulty,
      },
    },
    contributions: generateMockContributions(4),
  };
}

/**
 * Generate a mock available challenge template
 */
function generateMockAvailableChallengeTemplate(index: number) {
  const template = generateMockChallengeTemplate(index + 20);

  return {
    id: `available-${index}`,
    endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    template,
  };
}

/**
 * Main mock data generator function
 * Returns complete guild challenges data structure with customizable options
 */
export function createMockGuildChallengesData(
  options: MockGuildChallengesOptions = {}
): GuildChallengesData {
  const {
    guildId = "guild-test-001",
    guildName = "Cosmic Sentinels",
    vaultLevel = 3,
    memberCount = 12,
    activeChallengeCount = 2,
    completedChallengeCount = 3,
    availableChallengeCount = 4,
  } = options;

  // Generate active challenges
  const active = Array.from({ length: activeChallengeCount }, (_, i) =>
    generateMockActiveChallengeProgress(i)
  );

  // Generate completed challenges
  const completed = Array.from({ length: completedChallengeCount }, (_, i) =>
    generateMockCompletedChallengeProgress(i)
  );

  // Generate available challenges
  const available = Array.from({ length: availableChallengeCount }, (_, i) =>
    generateMockAvailableChallengeTemplate(i)
  );

  return {
    guild: {
      id: guildId,
      name: guildName,
      vaultLevel,
      _count: {
        members: memberCount,
      },
    },
    active,
    completed,
    available,
  };
}

/**
 * Generate multiple variations of guild challenge data
 * Useful for testing different UI states
 */
export function createMockGuildChallengesVariations() {
  return {
    // No active challenges
    noActiveChallenges: createMockGuildChallengesData({
      activeChallengeCount: 0,
      completedChallengeCount: 2,
    }),

    // All challenges active
    allActive: createMockGuildChallengesData({
      activeChallengeCount: 5,
      completedChallengeCount: 0,
    }),

    // New guild with minimal challenges
    newGuild: createMockGuildChallengesData({
      guildName: "Fledgling Guild",
      vaultLevel: 1,
      memberCount: 3,
      activeChallengeCount: 1,
      completedChallengeCount: 0,
      availableChallengeCount: 6,
    }),

    // Established high-level guild
    highlevelGuild: createMockGuildChallengesData({
      guildName: "Ascended Order",
      vaultLevel: 5,
      memberCount: 50,
      activeChallengeCount: 4,
      completedChallengeCount: 12,
      availableChallengeCount: 2,
    }),

    // Guild with many available challenges
    manyAvailable: createMockGuildChallengesData({
      activeChallengeCount: 1,
      completedChallengeCount: 1,
      availableChallengeCount: 10,
    }),

    // Guild with only completed challenges (no actives, no available)
    completedOnly: createMockGuildChallengesData({
      activeChallengeCount: 0,
      completedChallengeCount: 8,
      availableChallengeCount: 0,
    }),
  };
}

/**
 * Create a mock specific challenge progress state
 * Useful for testing individual challenge components
 */
export function createMockChallengeProgress(progressPercentage: number = 50) {
  const template = generateMockChallengeTemplate(0);
  const currentValue = Math.floor(
    (progressPercentage / 100) * template.targetValue
  );

  return {
    id: "progress-single",
    currentValue,
    targetValue: template.targetValue,
    updatedAt: new Date(),
    challenge: {
      id: "challenge-single",
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      rewardResonance: template.resonanceReward,
      rewardPrestige: template.prestigeReward,
      template,
    },
    contributions: generateMockContributions(5),
  };
}

/**
 * Utility: Create mock data with specific challenge states
 * Useful for testing edge cases
 */
export function createMockGuildChallengesWithEdgeCases(): GuildChallengesData {
  return {
    guild: {
      id: "guild-edge-case",
      name: "Edge Case Guild",
      vaultLevel: 1,
      _count: {
        members: 1, // Minimum members
      },
    },
    active: [
      {
        id: "progress-edge-1",
        currentValue: 0, // No progress yet
        targetValue: 1000,
        updatedAt: new Date(),
        challenge: {
          id: "challenge-edge-1",
          startDate: new Date(),
          endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          rewardResonance: 0.5, // Very low reward
          rewardPrestige: 1,
          template: {
            // id: "template-edge-1",
            name: "Extreme Challenge",
            icon: "🔥",
            description: "A brutally difficult challenge",
            difficulty: "BRUTAL",
            goalType: "TERRITORY_CAPTURED",
            // targetValue: 1000,
            // minMembers: 50,
            // minVaultLevel: 5,
            // resonanceReward: 0.5,
            // prestigeReward: 1,
          },
        },
        contributions: {
          single_player: 0, // No contribution
        },
      },
      {
        id: "progress-edge-2",
        currentValue: 999, // Almost complete
        targetValue: 1000,
        updatedAt: new Date(),
        challenge: {
          id: "challenge-edge-2",
          startDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 1 * 60 * 60 * 1000), // Ending soon
          rewardResonance: 500,
          rewardPrestige: 1000,
          template: {
            // id: "template-edge-2",
            name: "Epic Quest",
            icon: "🏆",
            description: "An epic challenge",
            difficulty: "HARD",
            goalType: "VAULT_CONTRIBUTIONS",
            // targetValue: 1000,
            // minMembers: 1,
            // minVaultLevel: 1,
            // resonanceReward: 500,
            // prestigeReward: 1000,
          },
        },
        contributions: {
          power_player: 999,
        },
      },
    ],
    completed: [],
    available: [],
  };
}
