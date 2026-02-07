import { lazy } from "react";

import {
  SuiteActivityRegistration,
  SuiteActivityType,
  ActivityDifficulty,
  ActivityContext,
} from "@/lib/schema/resonance-suite";

/**
 * RESONANCE SUITE ACTIVITY REGISTRY
 *
 * This registry manages all available activities (games, verification tasks, etc.)
 * in the Resonance Suite. It provides:
 *
 * - Lazy loading of activity components (performance optimization)
 * - Weighted random selection for variety
 * - Availability validation (level requirements, etc.)
 * - Extensible architecture for adding new activities
 *
 * HOW TO ADD A NEW ACTIVITY:
 * 1. Create your activity component in app/(game)/(geo-needed)/nodes/[id]/_components/resonance-suite/activities/
 * 2. Add an entry to this registry with proper configuration
 * 3. That's it! The suite will automatically include it
 */

// ============================================================================
// LAZY-LOADED ACTIVITY COMPONENTS
// ============================================================================

/**
 * Wave Sculptor - Frequency matching minigame
 * The original tuning game, now modularized
 */
const WaveSculptorGame = lazy(
  () =>
    import("@/app/(game)/(geo-needed)/nodes/[id]/_components/resonance-suite/activities/wave-sculptor"),
);

/**
 * Pattern Memory - Memory sequence matching game
 * Tests player's ability to memorize and repeat patterns
 */
const PatternMemoryGame = lazy(
  () =>
    import("@/app/(game)/(geo-needed)/nodes/[id]/_components/resonance-suite/activities/pattern-memory"),
);

/**
 * Harmonic Echo - Rhythm timing game
 * Players sync with node's harmonic pulses
 */
// const HarmonicEchoGame = lazy(
//   () =>
//     import("@/app/(game)/(geo-needed)/nodes/[id]/_components/resonance-suite/activities/harmonic-echo"),
// );

/**
 * Frequency Lock - Multi-dimensional slider puzzle
 * Align multiple frequency channels simultaneously
 */
const FrequencyLockGame = lazy(
  () =>
    import("@/app/(game)/(geo-needed)/nodes/[id]/_components/resonance-suite/activities/frequency-lock"),
);

/**
 * Resonance Cascade - Chain reaction strategy game
 * Trigger cascading resonances for maximum score
 */
const ResonanceCascadeGame = lazy(
  () =>
    import("@/app/(game)/(geo-needed)/nodes/[id]/_components/resonance-suite/activities/resonance-cascade"),
);

/**
 * Lattice Alignment - Spatial rotation puzzle
 * Align rotating lattice rings to match target pattern
 */
const LatticeAlignmentGame = lazy(
  () =>
    import("@/app/(game)/(geo-needed)/nodes/[id]/_components/resonance-suite/activities/lattice-alignment"),
);

// TODO: Add more activities as they're developed
// const POIVerificationEngine = lazy(() => import("..."));
// const BusinessValidationEngine = lazy(() => import("..."));
// const ARCommerceEngine = lazy(() => import("..."));

// ============================================================================
// ACTIVITY REGISTRY
// ============================================================================

/**
 * Central registry of all suite activities
 * Activities are stored in a Map for O(1) lookup
 */
const ACTIVITY_REGISTRY = new Map<string, SuiteActivityRegistration>([
  // -------------------------------------------------------------------------
  // GAMES
  // -------------------------------------------------------------------------

  [
    "wave-sculptor",
    {
      config: {
        id: "wave-sculptor",
        type: SuiteActivityType.GAME,
        name: "Wave Sculptor",
        description:
          "Match the resonance frequency to stabilize the node's harmonic field",
        difficulty: ActivityDifficulty.MEDIUM,
        baseRewardMultiplier: 1.0,

        // Node rarity multipliers (bonus for rare nodes)
        nodeRarityMultiplier: {
          Common: 1.0,
          Uncommon: 1.15,
          Rare: 1.3,
          Epic: 1.5,
          Legendary: 2.0,
        },

        // Visual metadata
        icon: "🌊",
        color: "cyan",
      },
      component: WaveSculptorGame,
      selectionWeight: 1.0,
      isAvailable: () => true,
    },
  ],

  [
    "pattern-memory",
    {
      config: {
        id: "pattern-memory",
        type: SuiteActivityType.GAME,
        name: "Pattern Memory",
        description: "Memorize and repeat the sequence of nodes that light up",
        difficulty: ActivityDifficulty.MEDIUM,
        baseRewardMultiplier: 1.0,
        nodeRarityMultiplier: {
          Common: 1.0,
          Uncommon: 1.15,
          Rare: 1.3,
          Epic: 1.5,
          Legendary: 2.0,
        },
        icon: "🧠",
        color: "purple",
      },
      component: PatternMemoryGame,
      selectionWeight: 1.0,
      isAvailable: () => true,
    },
  ],

  // [
  //   "harmonic-echo",
  //   {
  //     config: {
  //       id: "harmonic-echo",
  //       type: SuiteActivityType.GAME,
  //       name: "Harmonic Echo",
  //       description:
  //         "Synchronize with the node's harmonic pulses by tapping at the perfect moment",
  //       difficulty: ActivityDifficulty.MEDIUM,
  //       baseRewardMultiplier: 1.0,
  //       nodeRarityMultiplier: {
  //         Common: 1.0,
  //         Uncommon: 1.15,
  //         Rare: 1.3,
  //         Epic: 1.5,
  //         Legendary: 2.0,
  //       },
  //       icon: "📡",
  //       color: "purple",
  //     },
  //     component: HarmonicEchoGame,
  //     selectionWeight: 1.0,
  //     isAvailable: () => true,
  //   },
  // ],

  [
    "frequency-lock",
    {
      config: {
        id: "frequency-lock",
        type: SuiteActivityType.GAME,
        name: "Frequency Lock",
        description:
          "Align all frequency channels to achieve perfect harmonic resonance",
        difficulty: ActivityDifficulty.EASY,
        baseRewardMultiplier: 0.9,
        nodeRarityMultiplier: {
          Common: 1.0,
          Uncommon: 1.15,
          Rare: 1.3,
          Epic: 1.5,
          Legendary: 2.0,
        },
        icon: "🔒",
        color: "green",
      },
      component: FrequencyLockGame,
      selectionWeight: 1.0,
      isAvailable: () => true,
    },
  ],

  [
    "resonance-cascade",
    {
      config: {
        id: "resonance-cascade",
        type: SuiteActivityType.GAME,
        name: "Resonance Cascade",
        description:
          "Trigger chain reactions by strategically activating nodes in the harmonic field",
        difficulty: ActivityDifficulty.HARD,
        baseRewardMultiplier: 1.2,
        nodeRarityMultiplier: {
          Common: 1.0,
          Uncommon: 1.15,
          Rare: 1.3,
          Epic: 1.5,
          Legendary: 2.0,
        },
        icon: "✨",
        color: "pink",
      },
      component: ResonanceCascadeGame,
      selectionWeight: 1.0,
      isAvailable: () => true,
    },
  ],

  [
    "lattice-alignment",
    {
      config: {
        id: "lattice-alignment",
        type: SuiteActivityType.GAME,
        name: "Lattice Alignment",
        description:
          "Rotate the cosmic lattice rings to match the node's harmonic signature",
        difficulty: ActivityDifficulty.MEDIUM,
        baseRewardMultiplier: 1.0,
        nodeRarityMultiplier: {
          Common: 1.0,
          Uncommon: 1.15,
          Rare: 1.3,
          Epic: 1.5,
          Legendary: 2.0,
        },
        icon: "🧭",
        color: "blue",
      },
      component: LatticeAlignmentGame,
      selectionWeight: 1.0,
      isAvailable: () => true,
    },
  ],

  // -------------------------------------------------------------------------
  // VERIFICATION ENGINES (Coming Soon)
  // -------------------------------------------------------------------------

  // Example of how to add a future activity:
  /*
  [
    "poi-verification",
    {
      config: {
        id: "poi-verification",
        type: SuiteActivityType.VERIFICATION,
        name: "POI Validator",
        description: "Verify the existence and details of a point of interest",
        difficulty: ActivityDifficulty.EASY,
        baseRewardMultiplier: 0.8,
        minLevel: 5, // Only available to level 5+ users
        icon: "📍",
        color: "green",
      },
      component: POIVerificationEngine,
      selectionWeight: 0.5, // Less common than games
      
      isAvailable: (context) => {
        // Only show if user is near a POI that needs verification
        return context.userLevel >= 5;
      },
    },
  ],
  */
]);

// ============================================================================
// REGISTRY ACCESS FUNCTIONS
// ============================================================================

/**
 * Get all registered activities
 */
export function getAllActivities(): SuiteActivityRegistration[] {
  return Array.from(ACTIVITY_REGISTRY.values());
}

/**
 * Get a specific activity by ID
 */
export function getActivity(id: string): SuiteActivityRegistration | undefined {
  return ACTIVITY_REGISTRY.get(id);
}

/**
 * Get all activities of a specific type
 */
export function getActivitiesByType(
  type: SuiteActivityType,
): SuiteActivityRegistration[] {
  return getAllActivities().filter((activity) => activity.config.type === type);
}

/**
 * Get all available activities based on context
 * Filters out activities that don't meet eligibility requirements
 */
export function getAvailableActivities(
  context: ActivityContext,
): SuiteActivityRegistration[] {
  return getAllActivities().filter((activity) => {
    // Check if activity has availability function
    if (activity.isAvailable) {
      return activity.isAvailable(context);
    }

    // Default: Check level requirement
    if (
      activity.config.minLevel &&
      context.userLevel < activity.config.minLevel
    ) {
      return false;
    }

    return true;
  });
}

/**
 * Select a random activity using weighted selection
 * Activities with higher selectionWeight are more likely to be chosen
 *
 * @param context - User and node context for filtering
 * @returns Randomly selected activity, or null if none available
 */
export function selectRandomActivity(
  context: ActivityContext,
): SuiteActivityRegistration | null {
  const availableActivities = getAvailableActivities(context);

  if (availableActivities.length === 0) {
    return null;
  }

  // If only one activity, return it
  if (availableActivities.length === 1) {
    return availableActivities[0];
  }

  // Weighted random selection
  const totalWeight = availableActivities.reduce(
    (sum, activity) => sum + activity.selectionWeight,
    0,
  );

  let random = Math.random() * totalWeight;

  for (const activity of availableActivities) {
    random -= activity.selectionWeight;
    if (random <= 0) {
      return activity;
    }
  }

  // Fallback (should never reach here)
  return availableActivities[0];
}

/**
 * Register a new activity dynamically
 * Useful for plugins or dynamic feature loading
 */
export function registerActivity(
  registration: SuiteActivityRegistration,
): void {
  if (ACTIVITY_REGISTRY.has(registration.config.id)) {
    console.warn(
      `Activity ${registration.config.id} already registered. Overwriting.`,
    );
  }

  ACTIVITY_REGISTRY.set(registration.config.id, registration);
}

/**
 * Unregister an activity
 */
export function unregisterActivity(id: string): boolean {
  return ACTIVITY_REGISTRY.delete(id);
}
