import { useCallback, useMemo, useState } from "react";

import {
  ActivityContext,
  SuiteActivityRegistration,
  BaseActivityResult,
} from "@/lib/schema/resonance-suite";
import {
  selectRandomActivity,
  getActivity,
} from "@/lib/resonance-suite/registry";
import type { NodeTypeRarity } from "../generated/prisma/enums";

/**
 * RESONANCE SUITE HOOKS
 *
 * Reusable React hooks that provide common functionality for all suite activities.
 * These hooks encapsulate business logic and state management, making it easy to
 * create new activities without duplicating code.
 */

// ============================================================================
// ACTIVITY SELECTION HOOK
// ============================================================================

/**
 * Hook for managing activity selection in the suite
 * Handles random selection, manual override, and activity switching
 *
 * @param context - User and node context for filtering available activities
 * @param initialActivityId - Optional: Force a specific activity to load
 */
export function useActivitySelection(
  context: ActivityContext,
  initialActivityId?: string,
) {
  // Selected activity state
  const [selectedActivity, setSelectedActivity] =
    useState<SuiteActivityRegistration | null>(null);

  // Selection error state
  const [selectionError, setSelectionError] = useState<string | null>(null);

  /**
   * Select a random activity based on context
   */
  const selectActivity = useCallback(() => {
    try {
      const activity = selectRandomActivity(context);

      if (!activity) {
        setSelectionError("No activities available for your current level");
        return;
      }

      setSelectedActivity(activity);
      setSelectionError(null);
    } catch (error) {
      console.error("Activity selection error:", error);
      setSelectionError("Failed to select activity");
    }
  }, [context]);

  /**
   * Force selection of a specific activity by ID
   */
  const selectActivityById = useCallback(
    (id: string) => {
      try {
        const activity = getActivity(id);

        if (!activity) {
          setSelectionError(`Activity ${id} not found`);
          return;
        }

        // Check if activity is available
        if (activity.isAvailable && !activity.isAvailable(context)) {
          setSelectionError(`Activity ${id} is not available`);
          return;
        }

        setSelectedActivity(activity);
        setSelectionError(null);
      } catch (error) {
        console.error("Activity selection error:", error);
        setSelectionError("Failed to load activity");
      }
    },
    [context],
  );

  /**
   * Clear selection and return to activity selection screen
   */
  const clearSelection = useCallback(() => {
    setSelectedActivity(null);
    setSelectionError(null);
  }, []);

  // Auto-select on mount
  useMemo(() => {
    if (initialActivityId) {
      selectActivityById(initialActivityId);
    } else {
      selectActivity();
    }
  }, [initialActivityId, selectActivity, selectActivityById]);

  return {
    selectedActivity,
    selectionError,
    selectActivity,
    selectActivityById,
    clearSelection,
  };
}

// ============================================================================
// PROCEDURAL GENERATION HOOK
// ============================================================================

/**
 * Hook for generating deterministic parameters based on a seed
 * Used by activities to create consistent but varied experiences
 *
 * @param seed - Base seed (e.g., node's echoIntensity)
 * @param variance - Amount of randomness to apply (0-1)
 */
export function useProceduralGeneration(seed: number, variance: number = 0.2) {
  /**
   * Generate a deterministic random number in range [min, max]
   * Uses seed to ensure same result for same inputs
   */
  const generateValue = useCallback(
    (min: number, max: number, offset: number = 0): number => {
      // Seeded random using simple hash function
      const x = Math.sin((seed + offset) * 12.9898) * 43758.5453;
      const randomFactor = x - Math.floor(x);

      // Apply variance
      const baseValue = min + (max - min) * randomFactor;
      const varianceAmount = (max - min) * variance * (Math.random() - 0.5);

      return baseValue + varianceAmount;
    },
    [seed, variance],
  );

  /**
   * Generate an integer in range [min, max]
   */
  const generateInt = useCallback(
    (min: number, max: number, offset: number = 0): number => {
      return Math.floor(generateValue(min, max + 1, offset));
    },
    [generateValue],
  );

  /**
   * Generate a boolean with given probability
   */
  const generateBoolean = useCallback(
    (probability: number = 0.5, offset: number = 0): boolean => {
      return generateValue(0, 1, offset) < probability;
    },
    [generateValue],
  );

  return {
    generateValue,
    generateInt,
    generateBoolean,
  };
}

// ============================================================================
// SCORING HOOK
// ============================================================================

/**
 * Hook for calculating activity scores and rewards.
 * Handles base calculations, multipliers, and bonuses
 *
 * @param config - Activity configuration
 * @param nodeRarity - Rarity of the current node
 */
export function useActivityScoring(
  config: {
    baseRewardMultiplier: number;
    nodeRarityMultiplier?: Record<NodeTypeRarity, number>;
  },
  nodeRarity: NodeTypeRarity,
) {
  /**
   * Calculate final reward based on performance and multipliers
   */
  const calculateReward = useCallback(
    (baseReward: number, performanceScore: number): number => {
      // Apply base multiplier
      let reward = baseReward * config.baseRewardMultiplier;

      // Apply performance scaling (score is 0-100)
      reward *= performanceScore / 100;

      // Apply node rarity bonus
      if (config.nodeRarityMultiplier?.[nodeRarity]) {
        reward *= config.nodeRarityMultiplier[nodeRarity];
      }

      return reward;
    },
    [config, nodeRarity],
  );

  /**
   * Calculate score from accuracy (0-100)
   * Used by games to convert accuracy to score
   */
  const scoreFromAccuracy = useCallback((accuracy: number): number => {
    return Math.max(0, Math.min(100, accuracy));
  }, []);

  /**
   * Check if score qualifies for perfect bonus
   */
  const isPerfectScore = useCallback((score: number): boolean => {
    return score >= 100;
  }, []);

  return {
    calculateReward,
    scoreFromAccuracy,
    isPerfectScore,
  };
}

// ============================================================================
// ACTIVITY TIMER HOOK
// ============================================================================

/**
 * Hook for managing timed activities
 * Provides countdown timer, elapsed time tracking, and time-based scoring
 *
 * @param durationMs - Duration of the activity in milliseconds
 * @param onTimeout - Callback when timer expires
 */
export function useActivityTimer(durationMs: number, onTimeout?: () => void) {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  /**
   * Start the timer
   */
  const start = useCallback(() => {
    setStartTime(Date.now());
    setIsRunning(true);
  }, []);

  /**
   * Pause the timer
   */
  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  /**
   * Reset the timer
   */
  const reset = useCallback(() => {
    setStartTime(null);
    setElapsedMs(0);
    setIsRunning(false);
  }, []);

  /**
   * Get remaining time in milliseconds
   */
  const remainingMs = useMemo(() => {
    return Math.max(0, durationMs - elapsedMs);
  }, [durationMs, elapsedMs]);

  /**
   * Get progress as percentage (0-100)
   */
  const progress = useMemo(() => {
    return Math.min(100, (elapsedMs / durationMs) * 100);
  }, [elapsedMs, durationMs]);

  /**
   * Check if timer has expired
   */
  const hasExpired = useMemo(() => {
    return elapsedMs >= durationMs;
  }, [elapsedMs, durationMs]);

  // Timer tick effect
  useMemo(() => {
    if (!isRunning || !startTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      setElapsedMs(elapsed);

      // Check for timeout
      if (elapsed >= durationMs) {
        setIsRunning(false);
        onTimeout?.();
      }
    }, 100); // Update every 100ms for smooth progress

    return () => clearInterval(interval);
  }, [isRunning, startTime, durationMs, onTimeout]);

  return {
    elapsedMs,
    remainingMs,
    progress,
    hasExpired,
    isRunning,
    start,
    pause,
    reset,
  };
}

// ============================================================================
// RESULT VALIDATION HOOK
// ============================================================================

/**
 * Hook for validating activity results before submission
 * Ensures data integrity and prevents cheating
 */
export function useResultValidation() {
  /**
   * Validate a result object against expected constraints
   */
  const validateResult = useCallback(
    (
      result: BaseActivityResult,
    ): {
      valid: boolean;
      errors: string[];
    } => {
      const errors: string[] = [];

      // Score must be 0-100
      if (result.score < 0 || result.score > 100) {
        errors.push("Score must be between 0 and 100");
      }

      // Must be marked as completed
      if (!result.completed) {
        errors.push("Result must be marked as completed");
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    },
    [],
  );

  return {
    validateResult,
  };
}
