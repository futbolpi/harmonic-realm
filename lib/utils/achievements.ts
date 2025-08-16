import { AchievementsCheckTriggers } from "@/inngest/events";
import { AchievementCategory } from "../generated/prisma/enums";

// Reusable: Map eventType to relevant categories
export function getRelevantCategories(
  eventType: AchievementsCheckTriggers
): AchievementCategory[] {
  switch (eventType) {
    case "miningCompleted":
      return ["MINING", "EXPLORATION", "MASTERY", "SPECIAL"];
    case "upgradePurchased":
      return ["PROGRESSION"];
    case "boostUsed":
      return ["PROGRESSION"];
    case "guildJoined":
      return ["SOCIAL"];
    default:
      return [];
  }
}
