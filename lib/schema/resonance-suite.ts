import { z } from "zod";
import { NodeTypeRarity } from "../generated/prisma/enums";

/**
 * Core types for the Resonance Suite system
 *
 * The Resonance Suite is a modular system that supports:
 * - Interactive minigames (e.g., Wave Sculptor)
 * - Real-world utility engines (POI verification, AR commerce, etc.)
 *
 * This file defines the contract that all suite activities must follow.
 */

// ============================================================================
// SUITE ACTIVITY TYPES
// ============================================================================

/**
 * Categories of activities available in the suite
 */
export enum SuiteActivityType {
  GAME = "GAME", // Interactive minigames
  VERIFICATION = "VERIFICATION", // POI/business verification
  ENRICHMENT = "ENRICHMENT", // Data enrichment tasks
  AR_COMMERCE = "AR_COMMERCE", // Augmented reality commerce
}

/**
 * Difficulty levels for activities (affects rewards)
 */
export enum ActivityDifficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
  EXTREME = "EXTREME",
}

// ============================================================================
// ACTIVITY RESULT SCHEMAS
// ============================================================================

/**
 * Base result that all activities must return
 */
export const BaseActivityResultSchema = z.object({
  score: z.number().min(0).max(100), // 0-100 score
  completed: z.boolean(),
  timestamp: z.date().optional(),
});

export type BaseActivityResult = z.infer<typeof BaseActivityResultSchema>;

/**
 * Extended result for games (includes game-specific metrics)
 */
export const GameResultSchema = BaseActivityResultSchema.extend({
  accuracy: z.number().min(0).max(100).optional(), // Accuracy percentage
  timeSpent: z.number().optional(), // Milliseconds
  perfectScore: z.boolean().optional(), // Perfect 100%
  metadata: z.record(z.string(), z.number()).optional(), // Game-specific data
});

export type GameResult = z.infer<typeof GameResultSchema>;

/**
 * Extended result for verification tasks
 */
export const VerificationResultSchema = BaseActivityResultSchema.extend({
  verified: z.boolean(),
  confidence: z.number().min(0).max(100),
  evidenceCount: z.number().optional(),
  metadata: z.record(z.string(), z.number()).optional(),
});

export type VerificationResult = z.infer<typeof VerificationResultSchema>;

// ============================================================================
// ACTIVITY CONFIGURATION
// ============================================================================

/**
 * Configuration for a suite activity
 */
export interface SuiteActivityConfig {
  id: string;
  type: SuiteActivityType;
  name: string;
  description: string;
  difficulty: ActivityDifficulty;

  // Reward multipliers based on difficulty
  baseRewardMultiplier: number;

  // Eligibility criteria
  minLevel?: number;
  requiredItems?: string[];

  // Node-specific configuration
  nodeRarityMultiplier?: Record<NodeTypeRarity, number>; // Extra rewards for rare nodes

  // Metadata for rendering
  icon?: string;
  color?: string;
}

/**
 * Props that every activity component must accept
 */
export interface SuiteActivityProps<TResult = BaseActivityResult> {
  nodeId: string;
  nodeRarity: NodeTypeRarity;
  nodeFrequencySeed: number; // Seed for procedural generation
  isSponsored: boolean;

  // Loading state (from parent's useTransition)
  isPending: boolean;

  // Callbacks
  onComplete: (result: TResult) => void;
  onCancel?: () => void;

  // Optional configuration override
  config?: Partial<SuiteActivityConfig>;
}

// ============================================================================
// ACTIVITY REGISTRY
// ============================================================================

/**
 * Registry entry for a suite activity
 */
export interface SuiteActivityRegistration {
  config: SuiteActivityConfig;
  component: React.ComponentType<SuiteActivityProps>;

  // Selection weight (higher = more likely to be selected)
  selectionWeight: number;

  // Validation function (returns true if activity can be shown)
  isAvailable?: (context: ActivityContext) => boolean;
}

/**
 * Context provided to activities for validation
 */
export interface ActivityContext {
  userId: string;
  userLevel: number;
  nodeId: string;
  nodeRarity: NodeTypeRarity;
  isSponsored: boolean;
  currentStreak: number;
  hasCompletedToday: boolean;
}

// ============================================================================
// SUITE STATE
// ============================================================================

/**
 * State of the Resonance Suite modal
 */
export interface ResonanceSuiteState {
  isOpen: boolean;
  selectedActivity: string | null;
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// SUBMISSION PAYLOAD
// ============================================================================

/**
 * Payload sent to server when completing a suite activity
 */
export const SuiteSubmissionSchema = z.object({
  activityId: z.string(),
  activityType: z.enum(SuiteActivityType),
  nodeId: z.string(),
  userLat: z.number(),
  userLng: z.number(),

  // Result data (validated based on activity type)
  result: z.union([
    GameResultSchema,
    VerificationResultSchema,
    BaseActivityResultSchema,
  ]),

  // Session context
  accessToken: z.string(),
});

export type SuiteSubmission = z.infer<typeof SuiteSubmissionSchema>;

export type ScoreTier = "S" | "A" | "B" | "C" | "D" | "F";
