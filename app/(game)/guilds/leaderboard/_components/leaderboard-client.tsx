"use client";

import { useState, useMemo } from "react";

import { useProfile } from "@/hooks/queries/use-profile";
import { LeaderboardFilters } from "./leaderboard-filters";
import { TopThreePods } from "./top-three-pods";
import { LeaderboardTable } from "./leaderboard-table";
import { UserGuildProgress } from "./user-guild-progress";
import { EmptyLeaderboard } from "./empty-leaderboard";
import {
  getProcessedGuilds,
  calculateUserGuildRank,
  getMetricValue,
} from "../utils";
import type { LeaderboardGuild, LeaderboardType, TimeRange } from "../services";

interface LeaderboardClientProps {
  allGuilds: LeaderboardGuild[];
}

export function LeaderboardClient({ allGuilds }: LeaderboardClientProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardType>("prestige");
  const [timeRange, setTimeRange] = useState<TimeRange>("week");

  // Get user profile to determine their guild
  const { data: profile } = useProfile();
  const userGuildId = profile?.guildMembership?.guildId;

  // Process guilds based on active filters (client-side)
  const processedGuilds = useMemo(() => {
    return getProcessedGuilds(allGuilds, activeTab, timeRange);
  }, [allGuilds, activeTab, timeRange]);

  // Calculate user's guild rank (client-side)
  const userGuildRank = useMemo(() => {
    return calculateUserGuildRank(processedGuilds, userGuildId);
  }, [processedGuilds, userGuildId]);

  // Empty state
  if (allGuilds.length === 0) {
    return <EmptyLeaderboard />;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <LeaderboardFilters
        activeTab={activeTab}
        timeRange={timeRange}
        onTabChange={setActiveTab}
        onTimeRangeChange={setTimeRange}
      />

      {/* Top 3 Pods */}
      <TopThreePods guilds={processedGuilds} type={activeTab} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Full Rankings Table - Column visibility controlled by activeTab */}
        <div className="lg:col-span-2">
          <LeaderboardTable
            guilds={processedGuilds}
            type={activeTab}
            userGuildId={userGuildId}
          />
        </div>

        {/* User Guild Progress Sidebar */}
        {userGuildRank && userGuildRank.guild && (
          <div>
            <UserGuildProgress
              guildId={userGuildRank.guild.id}
              guildName={userGuildRank.guild.name}
              rank={userGuildRank.rank}
              totalGuilds={userGuildRank.totalGuilds}
              metricValue={getMetricValue(userGuildRank.guild, activeTab)}
              type={activeTab}
              rankChange={0} // TODO: Implement rank change tracking
            />
          </div>
        )}
      </div>
    </div>
  );
}
