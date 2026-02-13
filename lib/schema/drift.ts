import { z } from "zod";

import type { DensityTier } from "@/config/drift";
import { NodeTypeRarity } from "../generated/prisma/enums";

export const LocationSchema = z.object({
  latitude: z.coerce
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  longitude: z.coerce
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
});

export const EligibleDriftSchema = z
  .object({
    id: z.string().min(1, "Node Id is required"),
    maxMiners: z.int(),
    rarity: z.enum(NodeTypeRarity),
  })
  .extend(LocationSchema.shape);

export const ExecuteDriftSchema = z
  .object({
    nodeId: z.string().min(1, "Node Id is required"),
    accessToken: z.string().min(1, "Access token is required"),
  })
  .extend(LocationSchema.shape);

export type DriftQueryResponse = z.infer<typeof EligibleDriftSchema>;

export type ExecuteDriftParams = z.infer<typeof ExecuteDriftSchema>;

export enum DriftStatus {
  READY = "READY",
  NO_LOCATION = "NO_LOCATION",
  ON_COOLDOWN = "ON_COOLDOWN",
  NO_ELIGIBLE_NODES = "NO_ELIGIBLE_NODES",
  INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
  CONTENT_ABUNDANT = "CONTENT_ABUNDANT",
}

export interface DriftNodeWithCost extends DriftQueryResponse {
  distance: number;
  cost: number;
  canDrift: boolean;
}

export interface StatusInfo {
  status: DriftStatus;
  title: string;
  description: string;
  canDrift: boolean;
  cooldownEnd?: Date;
  densityTier?: string;
  nodeCount?: number;
  cheapestCost?: number;
  affordableCount?: number;
  remainingDiscounts?: number;
}

export interface UseDriftResult {
  driftStatus: DriftStatus;
  statusInfo: StatusInfo;
  nodesToRender: DriftNodeWithCost[];
  nodeCountWithin10km: number;
  densityTier: DensityTier;
}

export interface UserLocation {
  lat: number;
  lng: number;
}
