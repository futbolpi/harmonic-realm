// ========================================
// HarmonicRealm Mastery Progression System
// ========================================

import { defaultSessionMastery } from "../api-helpers/client/masteries";
import {
  NodeType,
  PrismaClient,
  UserNodeMastery,
} from "../generated/prisma/client";
import { NodeTypeRarity } from "../generated/prisma/enums";
import {
  MasteryInfoResponse,
  MasteryThreshold,
  ProgressInfo,
  TierName,
  UserMasteryProgression,
} from "../schema/mastery";

// ========================================
// Core Mathematical Foundations
// ========================================

/**
 * Calculates the Fibonacci-based progression thresholds for mastery levels
 *
 * Why Fibonacci? In HarmonicRealm lore, Fibonacci numbers naturally appear within
 * Pi's digit sequences and represent the golden ratio governing cosmic harmonies.
 * This creates a progression that feels both mathematical and mystical.
 *
 * The psychological benefit: early levels come quickly (1,1,2,3,5 sessions)
 * providing immediate gratification, while later levels require meaningful
 * commitment without feeling impossible.
 */
function calculateMasteryThresholds(): MasteryThreshold[] {
  // Base Fibonacci sequence extended to 16 levels for deep specialization
  const fibonacciBase = [
    1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987,
  ];

  // Define the lore tiers that give narrative meaning to progression
  const tierDefinitions: {
    name: TierName;
    range: number[];
  }[] = [
    { name: "Initiate", range: [1, 3] },
    { name: "Apprentice", range: [4, 7] },
    { name: "Adept", range: [8, 12] },
    { name: "Master", range: [13, 16] },
  ];

  let cumulativeSessions = 0;

  return fibonacciBase.map((sessionRequirement, index) => {
    const level = index + 1;
    cumulativeSessions += sessionRequirement;

    // Determine which tier this level belongs to
    const tier = tierDefinitions.find(
      (tier) => level >= tier.range[0] && level <= tier.range[1]
    ) || { name: "Unknown" };

    // Generate contextual lore narrative based on level and tier
    const loreNarrative = generateMasteryLoreNarrative(level, tier.name);

    return {
      level,
      sessionsRequired: sessionRequirement,
      totalSessions: cumulativeSessions,
      loreNarrative,
      tierName: tier.name,
    };
  });
}

/**
 * Generates immersive lore narratives for each mastery level
 * This transforms mechanical progression into storytelling moments
 */
function generateMasteryLoreNarrative(level: number, tierName: string): string {
  const narratives: Record<string, string[]> = {
    Initiate: [
      "You begin to sense the faint harmonic whispers within the Node's Pi-signature...",
      "The Lattice's frequencies become slightly more distinct to your consciousness...",
      "Your resonance with this Node type deepens, revealing glimpses of its mathematical poetry...",
    ],
    Apprentice: [
      "The Node's harmonic patterns start to make intuitive sense, like learning a cosmic language...",
      "You can now anticipate the rhythm of the Lattice's energy fluctuations within this Node type...",
      "Your understanding grows as Pi's infinite digits reveal their hidden harmonies to you...",
      "The Echo Guardians begin to recognize your dedication to this Node frequency...",
    ],
    Adept: [
      "You achieve true harmonic synchronization, your mind attuned to this Node's deepest patterns...",
      "The mathematical relationship between Pi and this Node type becomes crystal clear...",
      "Your mastery allows you to extract maximum resonance from each mining session...",
      "Other Pioneers seek your wisdom about the secrets of this Node classification...",
      "You begin to perceive how this Node type connects to the greater Lattice structure...",
    ],
    Master: [
      "Perfect resonance achieved - you and the Node frequency exist in complete harmony...",
      "The cosmic truths embedded in Pi's infinite sequence reveal themselves through your specialization...",
      "You become a living embodiment of this Node type's harmonic principles...",
      "Your mastery transcends mere technique, approaching the realm of Lattice enlightenment...",
    ],
  };

  const tierNarratives = narratives[tierName] || [
    "Your mastery continues to evolve...",
  ];
  // Use level to select narrative, cycling through available options
  const narrativeIndex = (level - 1) % tierNarratives.length;
  return tierNarratives[narrativeIndex];
}

// ========================================
// Bonus Calculation System
// ========================================

/**
 * Calculates the mastery bonus percentage using harmonic logarithmic progression
 *
 * This formula balances several important factors:
 * 1. Substantial early rewards to maintain engagement
 * 2. Meaningful progression throughout the entire curve
 * 3. Reasonable caps to prevent game-breaking bonuses
 * 4. Rarity multipliers that encourage specialization in rare Node types
 */
function calculateMasteryBonus(
  level: number,
  nodeTypeRarity: NodeTypeRarity
): number {
  // No bonus for level 0 (unmastered)
  if (level === 0) return 0;

  // Harmonic resonance follows logarithmic growth for natural feel
  // Formula breakdown:
  // - level^1.5 provides accelerating growth that feels substantial
  // - Multiplied by 10 for percentage-appropriate scaling
  // - Added level * 5 ensures each level provides minimum 5% improvement
  // Result: Level 1=15%, Level 2≈24%, Level 3≈37%, Level 5≈67%, etc.
  const baseBonus = Math.floor(Math.pow(level, 1.5) * 10 + level * 5);

  // Rarity multipliers encourage specialization in harder-to-find Node types
  // This creates natural player segmentation and diverse gameplay strategies
  const rarityMultipliers: Record<NodeTypeRarity, number> = {
    Common: 1.0, // Standard progression - accessible to all players
    Uncommon: 1.1, // 10% bonus encourages slight specialization
    Rare: 1.25, // 25% bonus makes rare node hunting worthwhile
    Epic: 1.4, // 40% bonus rewards serious commitment to rare types
    Legendary: 1.6, // 60% bonus creates true specialization incentive
  };

  const rarityMultiplier = rarityMultipliers[nodeTypeRarity] || 1.0;

  // Apply rarity multiplier and cap at 300% to prevent game balance issues
  // 300% cap ensures maximum mastery feels incredibly powerful without being broken
  return Math.min(Math.floor(baseBonus * rarityMultiplier), 300);
}

// ========================================
// Core Mastery Management Functions
// ========================================

/**
 * Determines the appropriate mastery level based on total sessions completed
 * This is the heart of our progression system - it translates raw activity
 * into meaningful character advancement
 */
function calculateMasteryLevel(totalSessions: number): number {
  const thresholds = calculateMasteryThresholds();

  // Find the highest level threshold that the player has reached
  // We iterate through levels to find the maximum achieved
  let achievedLevel = 0;

  for (const threshold of thresholds) {
    if (totalSessions >= threshold.totalSessions) {
      achievedLevel = threshold.level;
    } else {
      // Once we find a threshold they haven't reached, we stop
      break;
    }
  }

  return achievedLevel;
}

/**
 * Calculates how many sessions are needed to reach the next mastery level
 * This information drives UI elements that create anticipation and motivation
 */
function getSessionsToNextLevel(currentTotalSessions: number): ProgressInfo {
  const thresholds = calculateMasteryThresholds();
  const currentLevel = calculateMasteryLevel(currentTotalSessions);

  // Find the next threshold
  const nextThreshold = thresholds.find(
    (t) => t.totalSessions > currentTotalSessions
  );

  if (!nextThreshold) {
    // Player has achieved maximum mastery
    return {
      currentLevel,
      nextLevel: null,
      sessionsNeeded: null,
      progressPercent: 100,
    };
  }

  // Calculate progress toward next level
  const currentThreshold = thresholds.find((t) => t.level === currentLevel);
  const previousTotalSessions = currentThreshold?.totalSessions || 0;
  const sessionRange = nextThreshold.totalSessions - previousTotalSessions;
  const sessionsIntoLevel = currentTotalSessions - previousTotalSessions;
  const progressPercent = Math.floor((sessionsIntoLevel / sessionRange) * 100);

  return {
    currentLevel,
    nextLevel: nextThreshold.level,
    sessionsNeeded: nextThreshold.totalSessions - currentTotalSessions,
    progressPercent: Math.max(0, Math.min(100, progressPercent)),
  };
}

// ========================================
// Database Integration Functions
// ========================================

/**
 * Main function to update mastery progression after mining sessions
 * This handles all the complex calculations and database updates needed
 * when a player completes mining sessions
 */
async function updateMasteryProgression(
  userId: string,
  nodeTypeId: string,
  completedSessions: number,
  // Prisma client would be passed in real implementation
  prisma: PrismaClient
): Promise<UserMasteryProgression> {
  // First, get the current mastery state or prepare to create new one
  const existingMastery = await prisma.userNodeMastery.upsert({
    where: {
      user_node_mastery_unique: { userId, nodeTypeId },
    },
    create: {
      userId,
      nodeTypeId,
    },
    update: {},
    include: {
      nodeType: {
        select: { rarity: true },
      },
    },
  });

  // Calculate current state
  const previousLevel = existingMastery.level;
  const previousSessions = existingMastery.sessionsCompleted;
  const newTotalSessions = previousSessions + completedSessions;

  // Calculate new progression state
  const newLevel = calculateMasteryLevel(newTotalSessions);
  const leveledUp = newLevel > previousLevel;

  // Get node type information for bonus calculation
  const nodeType = existingMastery.nodeType;

  // Calculate new bonus percentage
  const newBonusPercent = calculateMasteryBonus(newLevel, nodeType.rarity);

  // Determine if new lore should be unlocked
  let newLoreUnlocked: string | null = null;
  if (leveledUp) {
    const thresholds = calculateMasteryThresholds();
    const levelThreshold = thresholds.find((t) => t.level === newLevel);
    newLoreUnlocked = levelThreshold?.loreNarrative || null;
  }

  // Update or create the mastery record
  const updatedMastery = await prisma.userNodeMastery.upsert({
    where: {
      user_node_mastery_unique: { userId, nodeTypeId },
    },
    create: {
      userId,
      nodeTypeId,
      level: newLevel,
      sessionsCompleted: newTotalSessions,
      bonusPercent: newBonusPercent,
    },
    update: {
      level: newLevel,
      sessionsCompleted: newTotalSessions,
      bonusPercent: newBonusPercent,
    },
    include: {
      nodeType: {
        select: { rarity: true },
      },
    },
  });

  return {
    mastery: updatedMastery,
    leveledUp,
    previousLevel,
    newLoreUnlocked,
  };
}

/**
 * Retrieves comprehensive mastery information for a user and node type
 * This provides all the data needed for UI displays and calculations
 */
async function getMasteryInfo(
  userId: string,
  prisma: PrismaClient,
  nodeTypeId?: string
): Promise<MasteryInfoResponse> {
  if (!nodeTypeId) {
    return defaultSessionMastery;
  }

  const availableThresholds = calculateMasteryThresholds();

  const mastery = await prisma.userNodeMastery.findUnique({
    where: { user_node_mastery_unique: { userId, nodeTypeId } },
    include: { nodeType: { select: { rarity: true } } },
  });

  const totalSessions = mastery?.sessionsCompleted || 0;
  const progressInfo = getSessionsToNextLevel(totalSessions);

  return {
    mastery,
    progressInfo,
    availableThresholds,
  };
}

// ========================================
// Utility Functions for UI and Game Logic
// ========================================

/**
 * Calculates the effective mining yield bonus from mastery
 * This is used in actual mining calculations to apply mastery benefits
 */
function applyMasteryBonus(
  baseYield: number,
  masteryBonusPercent: number
): number {
  // Convert percentage to multiplier (e.g., 50% becomes 1.5x)
  const multiplier = 1 + masteryBonusPercent / 100;
  return Math.floor(baseYield * multiplier);
}

/**
 * Gets detailed mastery information for all of a user's node type masteries
 * This is like getMasteryInfo but returns comprehensive data for all mastered node types
 * Perfect for mastery overview pages, player profiles, and dashboard displays
 */
async function getAllUserMasteriesInfo(
  userId: string,
  prisma: PrismaClient
): Promise<{
  masteries: Array<{
    mastery: UserNodeMastery & {
      nodeType: {
        rarity: NodeTypeRarity;
        name: string;
        extendedLore: string | null;
        baseYieldPerMinute: number;
      };
    };
    progressInfo: ReturnType<typeof getSessionsToNextLevel>;
    loreNarrative: string | null;
    tierName: string;
    isMaxLevel: boolean;
  }>;
  summary: {
    totalMasteries: number;
    averageLevel: number;
    highestLevel: number;
    totalBonusValue: number;
    masteredNodeTypes: number;
  };
}> {
  // Fetch all masteries for the user with full node type information
  const userMasteries = await prisma.userNodeMastery.findMany({
    where: { userId },
    include: {
      nodeType: {
        select: {
          baseYieldPerMinute: true,
          extendedLore: true,
          rarity: true,
          name: true,
        },
      },
    },
    orderBy: [
      { level: "desc" }, // Highest level first
      { bonusPercent: "desc" }, // Then by bonus percentage
      { updatedAt: "desc" }, // Most recently updated first for ties
    ],
  });

  const thresholds = calculateMasteryThresholds();
  const maxLevel = Math.max(...thresholds.map((t) => t.level));

  // Transform each mastery into detailed information structure
  const detailedMasteries = userMasteries.map((mastery) => {
    const progressInfo = getSessionsToNextLevel(mastery.sessionsCompleted);
    const threshold = thresholds.find((t) => t.level === mastery.level);
    const isMaxLevel = mastery.level >= maxLevel;

    return {
      mastery,
      progressInfo,
      loreNarrative: threshold?.loreNarrative || null,
      tierName: threshold?.tierName || "Unknown",
      isMaxLevel,
    };
  });

  // Calculate summary statistics for overview purposes
  const summary = {
    totalMasteries: userMasteries.length,
    averageLevel: 0,
    highestLevel: 0,
    totalBonusValue: 0,
    masteredNodeTypes: userMasteries.length,
  };

  if (userMasteries.length > 0) {
    const totalLevels = userMasteries.reduce((sum, m) => sum + m.level, 0);
    const totalBonuses = userMasteries.reduce(
      (sum, m) => sum + m.bonusPercent,
      0
    );

    summary.averageLevel = Math.floor(totalLevels / userMasteries.length);
    summary.highestLevel = Math.max(...userMasteries.map((m) => m.level));
    summary.totalBonusValue = totalBonuses;
  }

  return {
    masteries: detailedMasteries,
    summary,
  };
}

/**
 * Gets a user's mastery overview across all node types
 * Useful for profile pages and achievement systems
 * This is a lighter-weight version of getAllUserMasteriesInfo for when you need just summary data
 */
async function getUserMasteryOverview(
  userId: string,
  prisma: PrismaClient
): Promise<{
  totalMasteries: number;
  averageLevel: number;
  highestLevel: number;
  specializations: Array<{
    nodeType: NodeType;
    level: number;
    bonusPercent: number;
    tierName: TierName;
  }>;
}> {
  const masteries = await prisma.userNodeMastery.findMany({
    where: { userId },
    include: { nodeType: true },
    orderBy: { level: "desc" },
  });

  if (masteries.length === 0) {
    return {
      totalMasteries: 0,
      averageLevel: 0,
      highestLevel: 0,
      specializations: [],
    };
  }

  const thresholds = calculateMasteryThresholds();
  const totalLevels = masteries.reduce((sum, m) => sum + m.level, 0);
  const averageLevel = Math.floor(totalLevels / masteries.length);
  const highestLevel = masteries[0].level;

  const specializations = masteries.map((mastery) => {
    const threshold = thresholds.find((t) => t.level === mastery.level);
    return {
      nodeType: mastery.nodeType,
      level: mastery.level,
      bonusPercent: mastery.bonusPercent,
      tierName: threshold?.tierName || "Unknown",
    };
  });

  return {
    totalMasteries: masteries.length,
    averageLevel,
    highestLevel,
    specializations,
  };
}

// ========================================
// Export the main functions for use in your application
// ========================================

export {
  // Core calculation functions
  calculateMasteryThresholds,
  calculateMasteryBonus,
  calculateMasteryLevel,
  getSessionsToNextLevel,

  // Database interaction functions
  updateMasteryProgression,
  getMasteryInfo,
  getUserMasteryOverview,
  getAllUserMasteriesInfo,

  // Utility functions
  applyMasteryBonus,

  // Type definitions
  type MasteryThreshold,
};
