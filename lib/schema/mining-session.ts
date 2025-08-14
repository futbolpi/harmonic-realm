import { z } from "zod";

import { SessionStatus } from "../generated/prisma/enums";

// Mining session schemas
export const MiningSessionSchema = z
  .object({
    id: z.string(),
    status: z.enum(SessionStatus),
    createdAt: z.string().transform((val) => new Date(val)),
    updatedAt: z.string().transform((val) => new Date(val)),
    minerSharesEarned: z.number(),
    startTime: z.string().transform((val) => new Date(val)),
    endTime: z
      .string()
      .transform((val) => new Date(val))
      .nullable(),
  })
  .nullable();

export const StartMiningSchema = z.object({
  nodeId: z.string(),
  accessToken: z.string(),
  userLatitude: z.number(),
  userLongitude: z.number(),
});

export const CompleteMiningResponseSchema = z.object({
  sharesEarned: z.number(),
  xpGained: z.number(),
});

export const CompleteMiningSchema = z.object({
  sessionId: z.string(),
  accessToken: z.string(),
});

export const MiningSessionResponseSchema = z.object({
  session: MiningSessionSchema,
  canMine: z.boolean(),
  reason: z.string().optional(),
  userDistance: z.number().optional(), // renamed from distanceToNode for clarity
  isWithinRange: z.boolean().optional(), // added boolean for range check
  requiredDistance: z.number().default(100), // meters
});

export type MiningSession = z.infer<typeof MiningSessionSchema>;
export type StartMiningRequest = z.infer<typeof StartMiningSchema>;
export type MiningSessionResponse = z.infer<typeof MiningSessionResponseSchema>;
export type CompleteMiningRequest = z.infer<typeof CompleteMiningSchema>;
export type CompleteMiningResponse = z.infer<
  typeof CompleteMiningResponseSchema
>;
