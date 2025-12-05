import { z } from "zod";

import { SessionStatus } from "../generated/prisma/enums";
import { MasteryInfoSchema } from "./mastery";
import { EchoTransmissionSchema } from "./echo";
import { TuningSessionSchema } from "./tuning-session";

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
});

export const MiningSessionAssetsSchema = z.object({
  session: MiningSessionSchema,
  masteryInfo: MasteryInfoSchema,
  echoInfo: EchoTransmissionSchema,
  tuningSession: TuningSessionSchema,
});

export type MiningSession = z.infer<typeof MiningSessionSchema>;
export type StartMiningRequest = z.infer<typeof StartMiningSchema>;
export type MiningSessionAssets = z.infer<typeof MiningSessionAssetsSchema>;
export type CompleteMiningRequest = z.infer<typeof CompleteMiningSchema>;
export type CompleteMiningResponse = z.infer<
  typeof CompleteMiningResponseSchema
>;

// Define the enum for mining states
export enum MiningState {
  Loading = "loading",
  Error = "error",
  Pending = "pending",
  Completed = "completed",
  Cancelled = "cancelled",
  NodeClosed = "nodeClosed",
  NodeFull = "nodeFull",
  NoLocation = "noLocation",
  TooFar = "tooFar",
  Eligible = "eligible",
}

// Interfaces for type safety
export interface Location {
  latitude: number;
  longitude: number;
}

export interface UseMiningLogicProps {
  nodeId: string;
  nodeLocation: Location;
  maxSessions: number;
  completedSessions: number;
  isOpenForMining: boolean;
  allowedDistanceMeters?: number; // default 100
  allowRestartAfterCancelled?: boolean; // default true
}

export interface UseMiningLogicResult {
  miningState: MiningState;
  distance: number | null;
  showStartModal: boolean;
  showMiningModal: boolean;
  showCompletedModal: boolean;
  showTuningModal: boolean;
}
