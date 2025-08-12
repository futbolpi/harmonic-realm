import { z } from "zod";

// Mining session schemas
export const MiningSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  nodeId: z.string(),
  startTime: z.string().transform((val) => new Date(val)),
  endTime: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
  lockInMinutes: z.number(), // renamed from duration for consistency
  baseYieldPerMinute: z.number(), // renamed from baseYield for clarity
  bonusMultiplier: z.number().default(1),
  sharesEarned: z.number(), // renamed from totalEarned for clarity
  estimatedYield: z.number(), // added for total estimated yield
  status: z.enum(["ACTIVE", "COMPLETED", "ABANDONED"]),
  userLatitude: z.number(),
  userLongitude: z.number(),
  createdAt: z.string().transform((val) => new Date(val)),
  updatedAt: z.string().transform((val) => new Date(val)),
});

export const StartMiningSchema = z.object({
  nodeId: z.string(),
  accessToken: z.string(),
  userLatitude: z.number(),
  userLongitude: z.number(),
});

export const CompleteMiningSchema = z.object({
  sessionId: z.string(),
  accessToken: z.string(),
});

export const MiningSessionResponseSchema = z.object({
  session: MiningSessionSchema.nullable(),
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
