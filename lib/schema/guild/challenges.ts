import { z } from "zod";

/**
 * Schema for accepting a guild challenge
 */
export const AcceptChallengeSchema = z.object({
  accessToken: z.string().min(1, "Access token is required"),
  guildId: z.string().min(1, "Guild ID is required"),
  challengeId: z.string().min(1, "Challenge ID is required"),
});

export type AcceptChallengeParams = z.infer<typeof AcceptChallengeSchema>;

/**
 * Schema for updating challenge progress (internal server use)
 * Expanded to support all ChallengeGoalType variants
 */
export const UpdateChallengeProgressSchema = z.object({
  guildId: z.string().min(1),
  username: z.string().min(1),
  updates: z.object({
    sharePoints: z.number().min(0).optional().default(0),
    nodesMined: z.number().min(0).optional().default(0),
    perfectTunes: z.number().min(0).optional().default(0),
    territoriesCaptured: z.number().min(0).optional().default(0),
    vaultContribution: z.number().min(0).optional().default(0),
    memberStreaksAdded: z.number().min(0).optional().default(0),
  }),
});

export type UpdateChallengeProgressParams = z.input<
  typeof UpdateChallengeProgressSchema
>;
