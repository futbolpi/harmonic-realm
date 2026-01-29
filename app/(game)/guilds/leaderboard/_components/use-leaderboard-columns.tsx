"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Users, MapPin } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LeaderboardGuild } from "../services";

interface UseLeaderboardColumnsProps {
  userGuildId?: string | null;
}

/**
 * Helper function to create a metric column with consistent styling
 */
function createMetricColumn(
  id: string,
  label: string,
  accessor: (guild: LeaderboardGuild) => number,
  userGuildId?: string | null,
): ColumnDef<LeaderboardGuild & { rank: number }> {
  return {
    id,
    accessorFn: (row) => accessor(row),
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 hover:bg-transparent whitespace-nowrap text-xs font-semibold"
      >
        {label}
        <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = accessor(row.original);
      const isUserGuild = row.original.id === userGuildId;

      return (
        <div className={cn("text-sm font-semibold text-right", isUserGuild && "text-primary")}>
          {value.toLocaleString()}
        </div>
      );
    },
  };
}

export function useLeaderboardColumns({
  userGuildId,
}: UseLeaderboardColumnsProps) {
  return useMemo<ColumnDef<LeaderboardGuild & { rank: number }>[]>(() => {
    return [
      {
        accessorKey: "rank",
        header: "Rank",
        size: 60,
        cell: ({ row }) => {
          const rank = row.getValue("rank") as number;
          const isUserGuild = row.original.id === userGuildId;

          return (
            <div
              className={cn(
                "font-bold text-sm",
                rank === 1 && "text-yellow-500",
                rank === 2 && "text-gray-500",
                rank === 3 && "text-amber-600",
                isUserGuild && "text-primary",
              )}
            >
              #{rank}
            </div>
          );
        },
      },
      {
        accessorKey: "name",
        header: "Guild",
        cell: ({ row }) => {
          const isUserGuild = row.original.id === userGuildId;

          return (
            <Link
              href={`/guilds/${row.original.id}`}
              className="flex items-center gap-2 hover:underline min-w-fit"
            >
              <div className="text-xl flex-shrink-0">{row.original.emblem}</div>
              <div className="min-w-0">
                <div
                  className={cn(
                    "text-sm font-semibold flex items-center gap-2 truncate",
                    isUserGuild && "text-primary",
                  )}
                >
                  {row.original.name}
                  {isUserGuild && (
                    <Badge variant="default" className="text-xs flex-shrink-0">
                      You
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {row.original.tag}
                </div>
              </div>
            </Link>
          );
        },
      },
      // Individual metric columns for each leaderboard type
      createMetricColumn(
        "prestige-metric",
        "Prestige Points",
        (guild) => guild.prestigePoints,
        userGuildId,
      ),
      createMetricColumn(
        "activity-metric",
        "Weekly Activity",
        (guild) => guild.weeklyActivity,
        userGuildId,
      ),
      createMetricColumn(
        "vault-metric",
        "Total RESONANCE",
        (guild) => guild.totalContributed,
        userGuildId,
      ),
      createMetricColumn(
        "territories-metric",
        "Territories",
        (guild) => guild._count.territories,
        userGuildId,
      ),
      {
        id: "members",
        accessorFn: (row) => row._count.members,
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 hover:bg-transparent whitespace-nowrap text-xs font-semibold hidden sm:flex"
          >
            <Users className="h-3 w-3 mr-1 opacity-50" />
            Members
            <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground hidden sm:block text-right">
            {row.original._count.members}
          </div>
        ),
      },
      {
        id: "zones",
        accessorFn: (row) => row._count.territories,
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 hover:bg-transparent whitespace-nowrap text-xs font-semibold hidden sm:flex"
          >
            <MapPin className="h-3 w-3 mr-1 opacity-50" />
            Zones
            <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground hidden sm:block text-right">
            {row.original._count.territories}
          </div>
        ),
      },
    ];
  }, [userGuildId]);
}
