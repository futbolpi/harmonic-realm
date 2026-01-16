import { ChallengeGoalType } from "../generated/prisma/enums";

export type UserContribution = {
  username: string;
  contribution: number;
};

/**
 * Converts a record of contributions to an array of user contribution objects.
 * @param record The input record (which can be null).
 * @returns An array of UserContribution objects sorted by contribution descending.
 */
export function convertRecordToArray(
  record: Record<string, number> | null
): UserContribution[] {
  // Check if the input is null. If so, return an empty array.
  if (record === null) {
    return [];
  }

  // Use Object.entries() to get an array of [key, value] pairs
  // and map over them to transform into the desired object structure.
  // Sort by contribution in descending order for leaderboard display.
  return Object.entries(record)
    .map(([username, contribution]) => ({
      username,
      contribution,
    }))
    .sort((a, b) => b.contribution - a.contribution);
}

/**
 * Get the appropriate action link for a challenge goal type
 * Maps challenge types to pages where members can contribute
 */
export function getChallengeActionLink(
  goalType: ChallengeGoalType,
  guildId: string
): string {
  switch (goalType) {
    // Node-based contributions: go to map
    case ChallengeGoalType.UNIQUE_NODES_MINED:
    case ChallengeGoalType.TOTAL_SHAREPOINTS:
    case ChallengeGoalType.PERFECT_TUNES:
    case ChallengeGoalType.MEMBER_STREAKS:
      return "/map";

    // Vault-based contributions: go to guild vault
    case ChallengeGoalType.VAULT_CONTRIBUTIONS:
      return `/guilds/${guildId}/vault`;

    // Territory-based contributions: go to territories
    case ChallengeGoalType.TERRITORY_CAPTURED:
      return `/guilds/${guildId}/territories`;

    // Fallback: stay on challenge page
    default:
      return `/guilds/${guildId}/challenges`;
  }
}

/**
 * Get a friendly description for a challenge goal type
 */
export function getChallengeGoalDescription(
  goalType: ChallengeGoalType
): string {
  switch (goalType) {
    case ChallengeGoalType.UNIQUE_NODES_MINED:
      return "Mine unique nodes across the map";
    case ChallengeGoalType.TOTAL_SHAREPOINTS:
      return "Earn resonance through mining and tuning";
    case ChallengeGoalType.PERFECT_TUNES:
      return "Tune nodes daily for frequency bonuses";
    case ChallengeGoalType.VAULT_CONTRIBUTIONS:
      return "Contribute RESONANCE to the guild vault";
    case ChallengeGoalType.TERRITORY_CAPTURED:
      return "Capture new territories for the guild";
    case ChallengeGoalType.MEMBER_STREAKS:
      return "Tune for 5 days straight";
    default:
      return "Complete guild objectives";
  }
}
