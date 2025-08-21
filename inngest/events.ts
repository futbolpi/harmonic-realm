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

export type Events =
  | UserCreated
  | PhaseCompletedEvent
  | CosmicHeraldEvent
  | InitialPhaseStartEvent
  | NextPhaseStartEvent
  | AchievementsCheckEvent;
