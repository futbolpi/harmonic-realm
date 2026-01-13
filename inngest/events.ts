import { PaymentType } from "@/lib/generated/prisma/enums";
import {
  CosmeticTheme,
  LocationContext,
  LoreGenerationResult,
  LoreLevel,
} from "@/lib/node-lore/location-lore";
import { PiMetadata } from "@/types/pi";

export type AchievementsCheckTriggers =
  | "miningCompleted"
  | "upgradePurchased"
  | "boostUsed"
  | "guildJoined";

interface UserCreated {
  name: "users/user.created";
  data: {
    userId: string;
  };
}

export interface InitialPhaseStartEvent {
  name: "phase/generate.initial";
  id?: string;
}

export interface NextPhaseStartEvent {
  name: "phase/generate.next";
  id?: string;
}

export interface PhaseCompletedEvent {
  name: "game.phase.completed";
  data: {
    phase: number;
    nodesSpawned: number;
    triggeringUserId?: string;
  };
  id?: string;
}

export interface CosmicHeraldEvent {
  name: "cosmic-herald-announcement";
  data: {
    messageType: "bug" | "announcement";
    content: string;
  };
  id?: string;
}

export interface AchievementsCheckEvent {
  name: "game.achievement.check";
  data: {
    eventType: AchievementsCheckTriggers;
    userId: string;
  };
  id?: string;
}

export interface LoreGenerationStartedEvent {
  name: "lore/generation.started";
  data: {
    nodeId: string;
    targetLevel: LoreLevel;
    jobId: string;
  };
}

export interface ReverseGeocodingStartedEvent {
  name: "lore/reverse-geocoding.started";
  data: {
    nodeId: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    jobId: string;
  };
}

export interface AIGenerationStartedEvent {
  name: "lore/ai-generation.started";
  data: {
    nodeId: string;
    targetLevel: LoreLevel;
    locationContext: LocationContext;
    jobId: string;
  };
}

export interface AIGenerationCompletedEvent {
  name: "lore/ai-generation.completed";
  data: {
    nodeId: string;
    targetLevel: LoreLevel;
    jobId: string;
    content: string;
    metadata: LoreGenerationResult;
    success: boolean;
  };
}

export interface LoreGenerationCompletedEvent {
  name: "lore/generation.completed";
  data: {
    nodeId: string;
    targetLevel: LoreLevel;
    userId: string;
    jobId: string;
    success: boolean;
    loreContent: string;
    cosmeticThemes?: CosmeticTheme;
  };
}

export interface LoreGenerationFailedEvent {
  name: "lore/generation.failed";
  data: {
    nodeId: string;
    targetLevel: LoreLevel;
    userId: string;
    jobId: string;
    error: {
      message: string;
      code?: string;
    };
    retryCount?: number;
  };
}

export interface LoreGenerationPermFailedEvent {
  name: "lore/generation.permanently-failed";
  data: {
    nodeId: string;
    targetLevel: LoreLevel;
    userId: string;
    jobId: string;
    error: string;
    retryCount: number;
  };
}

export interface LoreGeocodingCompletedEvent {
  name: "lore/reverse-geocoding.completed";
  data: {
    nodeId: string;
    jobId: string;
    locationContext: LocationContext;
    success: boolean;
  };
}

export interface PiPaymentProcessedEvent {
  name: "payment/pi-payment.processed";
  data: {
    paymentId: string;
    userId: string;
    amount: number;
    metadata: PiMetadata;
  };
}

export interface PiPaymentApprovedEvent {
  name: "payment/pi-payment.approved";
  data: {
    paymentId: string;
    userId: string;
    amount: number;
    metadata: PiMetadata;
  };
}

export interface PiPaymentCompletedEvent {
  name: "payment/pi-payment.completed";
  data: {
    paymentId: string;
    userId: string;
    txid: string;
    amount: number;
    metadata: PiMetadata;
  };
}

export interface PiPaymentFailedEvent {
  name: "payment/pi-payment.failed";
  data: {
    paymentId: string;
    userId: string;
    error: string;
    metadata: PiMetadata;
  };
}

export interface AppToUserPaymentEvent {
  name: "payments/app-to-user";
  data: {
    amount: number;
    memo: string;
    modelId: string;
    type: PaymentType;
    uid: string;
  };
}

export interface CalibrationTriggeredEvent {
  name: "calibration/triggered";
  data: {
    gamePhaseId: number;
  };
}

export interface TerritoryChallengeStartedEvent {
  name: "territory/challenge.started";
  data: {
    challengeId: string;
    endsAt?: string; // ISO date optional convenience
  };
}

export interface TerritoryClaimedEvent {
  name: "territory/claimed";
  data: {
    territoryId: string;
    controlEndsAt: string;
  };
}

export type Events =
  | UserCreated
  | PhaseCompletedEvent
  | CosmicHeraldEvent
  | InitialPhaseStartEvent
  | NextPhaseStartEvent
  | AchievementsCheckEvent
  | LoreGenerationStartedEvent
  | ReverseGeocodingStartedEvent
  | AIGenerationStartedEvent
  | AIGenerationCompletedEvent
  | LoreGenerationCompletedEvent
  | LoreGenerationFailedEvent
  | LoreGenerationPermFailedEvent
  | LoreGeocodingCompletedEvent
  | PiPaymentApprovedEvent
  | PiPaymentCompletedEvent
  | PiPaymentFailedEvent
  | PiPaymentProcessedEvent
  | AppToUserPaymentEvent
  | CalibrationTriggeredEvent
  | TerritoryChallengeStartedEvent
  | TerritoryClaimedEvent;
