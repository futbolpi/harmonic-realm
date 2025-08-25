import { z } from "zod";

import { SessionStatus } from "../generated/prisma/enums";
import { MasteryInfoSchema } from "./mastery";
import { EchoTransmissionSchema } from "./echo";

// Mining session schemas
export const MiningSessionSchema = z
  .object({
    id: z.string(),
    echoTransmissionApplied: z.boolean(),
    status: z.enum(SessionStatus),
    createdAt: z.string().transform((val) => new Date(val)),
    updatedAt: z.string().transform((val) => new Date(val)),
    minerSharesEarned: z.number(),
    timeReductionPercent: z.number(),
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
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const MiningSessionAssetsSchema = z.object({
  session: MiningSessionSchema,
  masteryInfo: MasteryInfoSchema,
  echoInfo: EchoTransmissionSchema,
});

export type MiningSession = z.infer<typeof MiningSessionSchema>;
export type StartMiningRequest = z.infer<typeof StartMiningSchema>;
export type MiningSessionAssets = z.infer<typeof MiningSessionAssetsSchema>;
export type CompleteMiningRequest = z.infer<typeof CompleteMiningSchema>;
export type CompleteMiningResponse = z.infer<
  typeof CompleteMiningResponseSchema
>;
