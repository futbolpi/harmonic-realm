"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LeaderboardType, TimeRange } from "../services";

interface LeaderboardFiltersProps {
  activeTab: LeaderboardType;
  timeRange: TimeRange;
  onTabChange: (tab: LeaderboardType) => void;
  onTimeRangeChange: (range: TimeRange) => void;
}

export function LeaderboardFilters({
  activeTab,
  timeRange,
  onTabChange,
  onTimeRangeChange,
}: LeaderboardFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <Tabs
        value={activeTab}
        onValueChange={(v) => onTabChange(v as LeaderboardType)}
      >
        <TabsList>
          <TabsTrigger value="prestige">⭐ Prestige</TabsTrigger>
          <TabsTrigger value="activity">⚡ Activity</TabsTrigger>
          <TabsTrigger value="vault">💎 Vault</TabsTrigger>
          <TabsTrigger value="territories">🗺️ Territories</TabsTrigger>
        </TabsList>
      </Tabs>

      <Select
        value={timeRange}
        onValueChange={(v) => onTimeRangeChange(v as TimeRange)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Time Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="all_time">All Time</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
