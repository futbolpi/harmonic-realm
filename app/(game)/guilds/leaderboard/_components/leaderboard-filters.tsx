"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { LeaderboardType, TimeRange } from "../services";

interface LeaderboardFiltersProps {
  activeTab: LeaderboardType;
  timeRange: TimeRange;
  onTabChange: (tab: LeaderboardType) => void;
  onTimeRangeChange: (range: TimeRange) => void;
}

const METRIC_BUTTONS: { value: LeaderboardType; label: string }[] = [
  { value: "prestige", label: "⭐ Prestige" },
  { value: "activity", label: "⚡ Activity" },
  { value: "vault", label: "💎 Vault" },
  { value: "territories", label: "🗺️ Territories" },
];

export function LeaderboardFilters({
  activeTab,
  timeRange,
  onTabChange,
  onTimeRangeChange,
}: LeaderboardFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      {/* Metric Selection Buttons */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg overflow-x-auto w-full sm:w-auto">
        {METRIC_BUTTONS.map((btn) => (
          <Button
            key={btn.value}
            variant="ghost"
            onClick={() => onTabChange(btn.value)}
            className={cn(
              "whitespace-nowrap transition-colors",
              activeTab === btn.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {btn.label}
          </Button>
        ))}
      </div>

      {/* Time Range Selection */}
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
