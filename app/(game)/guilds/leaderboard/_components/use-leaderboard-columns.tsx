"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Users, MapPin } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getMetricValue, getMetricLabel } from "../utils";
import type { LeaderboardGuild, LeaderboardType } from "../services";

interface UseLeaderboardColumnsProps {
  type: LeaderboardType;
  userGuildId?: string | null;
}

export function useLeaderboardColumns({
  type,
  userGuildId,
}: UseLeaderboardColumnsProps) {
  return useMemo<ColumnDef<LeaderboardGuild & { rank: number }>[]>(() => {
    return [
      {
        accessorKey: "rank",
        header: "Rank",
        cell: ({ row }) => {
          const rank = row.getValue("rank") as number;
          const isUserGuild = row.original.id === userGuildId;

          return (
            <div
              className={cn(
                "font-bold text-lg",
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
              className="flex items-center gap-3 hover:underline"
            >
              <div className="text-2xl">{row.original.emblem}</div>
              <div>
                <div
                  className={cn(
                    "font-semibold flex items-center gap-2",
                    isUserGuild && "text-primary",
                  )}
                >
                  {row.original.name}
                  {isUserGuild && (
                    <Badge variant="default" className="text-xs">
                      Your Guild
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {row.original.tag} • {row.original.leaderUsername}
                </div>
              </div>
            </Link>
          );
        },
      },
      {
        id: "metric",
        accessorFn: (row) => getMetricValue(row, type),
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 hover:bg-transparent"
          >
            {getMetricLabel(type)}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const value = getMetricValue(row.original, type);
          const isUserGuild = row.original.id === userGuildId;

          return (
            <div
              className={cn("font-bold text-lg", isUserGuild && "text-primary")}
            >
              {value.toLocaleString()}
            </div>
          );
        },
      },
      {
        id: "members",
        accessorFn: (row) => row._count.members,
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 hover:bg-transparent hidden sm:flex"
          >
            <Users className="h-4 w-4 mr-1" />
            Members
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground hidden sm:block">
            {row.original._count.members}
          </div>
        ),
      },
      {
        id: "territories",
        accessorFn: (row) => row._count.territories,
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 hover:bg-transparent hidden sm:flex"
          >
            <MapPin className="h-4 w-4 mr-1" />
            Zones
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground hidden sm:block">
            {row.original._count.territories}
          </div>
        ),
      },
    ];
  }, [type, userGuildId]);
}
