import { z } from "zod";
import { Decimal } from "@prisma/client/runtime/library";

import {
  ContributionTier,
  NodeTypeRarity,
  PaymentStatus,
} from "../generated/prisma/enums";
import { LoreLevel } from "../node-lore/location-lore";

// API Response wrapper
export const InitiateLoreStakingSchema = z.object({
  nodeId: z.string(),
  targetLevel: z.number().int().min(1).max(5).positive(),
  piAmount: z.number(),
  accessToken: z.string(),
});

export type InitiateLoreStakingParams = z.infer<
  typeof InitiateLoreStakingSchema
>;

export type InitiateLoreStakingResponse = {
  stakeId: string;
  nodeId: string;
  targetLevel: number;
  piAmount: number;
  contributionTier: ContributionTier | null;
  memo: string;
};

export type StakingOpportunity = {
  nodeId: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  nodeType: string;
  rarity: NodeTypeRarity;
  currentLevel: number;
  nextLevel: {
    level: LoreLevel;
    piRequired: number;
    description: string;
    name: string;
  };
  totalStaked: number;
  estimatedCompletionTime: string;
  distance: number | null;
};

export interface LoreStakeDetails {
  id: string;
  nodeId: string;
  piAmount: Decimal;
  targetLevel: number;
  paymentStatus: PaymentStatus;
  contributionTier: ContributionTier | null;
  createdAt: Date;
  updatedAt: Date;
  paymentId: string | null;
  piTransactionId: string | null;
  locationLore: {
    node: {
      id: string;
      name: string;
    };
  };
}
