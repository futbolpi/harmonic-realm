import { GamePhaseTrigger, NodeTypeRarity } from "@/lib/generated/prisma/enums";

export type Layers = "environmental";

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

export interface NodeSpawnRequestEvent {
  name: "node.spawn.request";
  data: {
    totalPioneers: number;
    targetRegion?: string;
    spawnTime?: Date;
    gameEventType?: GamePhaseTrigger;
    loreBoost?: boolean;
    phase?: number;
    layers?: Layers[]; // For lore layers
  };
  id?: string; // For dedup
}

export interface GameGenesisStartEvent {
  name: "game.genesis.start";
  id?: string;
}

export interface LoreBoostEvent {
  name: "lore.boost";
  data: {
    region: string;
    rarity: NodeTypeRarity;
    storyTheme: string;
  };
  id?: string;
}

export interface NextPhaseEvent {
  name: "game.phase.next";
  data: {
    phase: number;
    triggeringUserId: string;
  };
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

export type Events =
  | NodeSpawnRequestEvent
  | LoreBoostEvent
  | GameGenesisStartEvent
  | NextPhaseEvent
  | UserCreated
  | PhaseCompletedEvent
  | CosmicHeraldEvent
  | AchievementsCheckEvent;
