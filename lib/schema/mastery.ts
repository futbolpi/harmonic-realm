import { z } from "zod";

const tierNames = [
  "Initiate",
  "Apprentice",
  "Adept",
  "Master",
  "Unknown",
] as const;

export const MasteryThresholdSchema = z.object({
  level: z.number(),
  sessionsRequired: z.number(),
  totalSessions: z.number(),
  loreNarrative: z.string(),
  tierName: z.enum(tierNames),
});

export const ProgressInfoSchema = z.object({
  currentLevel: z.number(),
  nextLevel: z.number().nullable(),
  sessionsNeeded: z.number().nullable(),
  progressPercent: z.number(),
});

export const UserNodeMasterySchema = z.object({
  id: z.string(),
  level: z.number(),
  userId: z.string(),
  nodeTypeId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  sessionsCompleted: z.number(),
  bonusPercent: z.number(),
});

export const MasteryInfoSchema = z.object({
  mastery: UserNodeMasterySchema.nullable(),
  progressInfo: ProgressInfoSchema,
  availableThresholds: z.array(MasteryThresholdSchema),
});

export const UserMasteryProgressionSchema = z.object({
  mastery: UserNodeMasterySchema,
  leveledUp: z.boolean(),
  previousLevel: z.number(),
  newLoreUnlocked: z.string().nullable(),
});

export type MasteryInfoResponse = z.infer<typeof MasteryInfoSchema>;
export type UserNodeMastery = z.infer<typeof UserNodeMasterySchema>;
export type ProgressInfo = z.infer<typeof ProgressInfoSchema>;

/**
 * Represents a single mastery threshold level in our Fibonacci progression
 * This structure helps us understand what each level requires and provides
 * @property level The mastery level (1-16)
 * @property sessionsRequired Additional sessions needed from previous level
 * @property totalSessions Cumulative sessions needed to reach this level
 * @property loreNarrative: Story element unlocked at this level
 * @property tierName Human-readable tier classification
 */
export type MasteryThreshold = z.infer<typeof MasteryThresholdSchema>;
export type TierName = MasteryThreshold["tierName"];
export type UserMasteryProgression = z.infer<
  typeof UserMasteryProgressionSchema
>;
