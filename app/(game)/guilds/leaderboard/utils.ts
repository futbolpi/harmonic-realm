import type { LeaderboardGuild, LeaderboardType, TimeRange } from "./services";

/**
 * Get the dynamic field name for a metric based on type and time range
 * Used for activity and vault leaderboards to segment by time period
 * Note: Currently, only weeklyActivity is available for activity metrics
 */
export function getMetricFieldByTimeRange(
  type: LeaderboardType,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  timeRange: TimeRange,
): keyof LeaderboardGuild {
  if (type === "activity") {
    // For activity, we only have weeklyActivity available
    // Time range selection is for future expansion when historical data is available
    return "weeklyActivity";
  }

  if (type === "vault") {
    // For vault, we use totalContributed which represents cumulative contributions
    // Time range could filter the time period in future implementations
    return "totalContributed";
  }

  return "weeklyActivity"; // Fallback
}

/**
 * Get the metric value for a guild based on leaderboard type and time range
 */
export function getMetricValue(
  guild: LeaderboardGuild,
  type: LeaderboardType,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  timeRange?: TimeRange,
): number {
  switch (type) {
    case "prestige":
      return guild.prestigePoints;
    case "activity": {
      // Activity metrics use weeklyActivity regardless of time range
      // Time range filters are for future historical data availability
      return guild.weeklyActivity;
    }
    case "vault": {
      // Vault metrics use totalContributed regardless of time range
      // Time range could filter contributions by date in future
      return guild.totalContributed;
    }
    case "territories":
      return guild._count.territories;
    default:
      return 0;
  }
}

/**
 * Get the display label for a metric
 */
export function getMetricLabel(type: LeaderboardType): string {
  switch (type) {
    case "prestige":
      return "Prestige Points";
    case "activity":
      return "Weekly Activity";
    case "vault":
      return "Total RESONANCE";
    case "territories":
      return "Territories";
  }
}

/**
 * Filter guilds based on time range (for activity leaderboard)
 * Currently a placeholder for future time-range filtering
 * When historical data becomes available, this will filter by time period
 */
export function filterGuildsByTimeRange(
  guilds: LeaderboardGuild[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _timeRange: TimeRange,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _type: LeaderboardType,
): LeaderboardGuild[] {
  // For now, we don't filter by time range as we only have current-week data
  // In a real implementation with historical data, you'd filter based on activity timestamps
  return guilds;
}

/**
 * Sort guilds based on leaderboard type and optionally by time range
 */
export function sortGuildsByType(
  guilds: LeaderboardGuild[],
  type: LeaderboardType,
  timeRange?: TimeRange,
): LeaderboardGuild[] {
  return [...guilds].sort((a, b) => {
    const aValue = getMetricValue(a, type, timeRange);
    const bValue = getMetricValue(b, type, timeRange);
    return bValue - aValue; // Descending order
  });
}

/**
 * Get sorted and filtered guilds
 * For activity and vault types, sorting respects the selected time range
 */
export function getProcessedGuilds(
  guilds: LeaderboardGuild[],
  type: LeaderboardType,
  timeRange: TimeRange,
): LeaderboardGuild[] {
  const filtered = filterGuildsByTimeRange(guilds, timeRange, type);

  // Use dynamic time range sorting for activity and vault types
  const shouldUseTimeRangeSorting = type === "activity" || type === "vault";
  return sortGuildsByType(
    filtered,
    type,
    shouldUseTimeRangeSorting ? timeRange : undefined,
  );
}

/**
 * Calculate user's guild rank
 */
export function calculateUserGuildRank(
  guilds: LeaderboardGuild[],
  userGuildId: string | undefined,
): {
  rank: number;
  guild: LeaderboardGuild | undefined;
  totalGuilds: number;
} | null {
  if (!userGuildId) return null;

  const rank = guilds.findIndex((g) => g.id === userGuildId) + 1;
  if (rank === 0) return null;

  const guild = guilds.find((g) => g.id === userGuildId);

  return {
    rank,
    guild,
    totalGuilds: guilds.length,
  };
}

export function getProgressTips(type: LeaderboardType): string[] {
  switch (type) {
    case "prestige":
      return [
        "Complete guild challenges",
        "Win territory wars",
        "Keep members active",
        "Upgrade guild vault",
      ];
    case "activity":
      return [
        "Encourage daily tuning",
        "Organize group mining sessions",
        "Complete weekly challenges",
        "Stay engaged with territories",
      ];
    case "vault":
      return [
        "Contribute to vault regularly",
        "Complete lucrative challenges",
        "Win territory rewards",
        "Encourage member deposits",
      ];
    case "territories":
      return [
        "Stake new territories",
        "Defend current holdings",
        "Attack strategic zones",
        "Coordinate territory wars",
      ];
  }
}
