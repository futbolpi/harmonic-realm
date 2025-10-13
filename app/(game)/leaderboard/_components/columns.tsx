import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Coins, Crown, Trophy, Zap } from "lucide-react";
import Link from "next/link";

import UserAvatar from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";

export interface Pioneer {
  id: string;
  username: string;
  level: number;
  sharePoints: number;
  xp: number;
  rank: number;
}

export const columns: ColumnDef<Pioneer>[] = [
  {
    accessorKey: "rank",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2 lg:px-3"
      >
        <Trophy className="h-4 w-4" />
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const rank = row.getValue("rank") as number;
      return (
        <div className="flex items-center justify-center">
          {rank === 1 && <Crown className="h-5 w-5 text-neon-orange mr-1" />}
          {rank === 2 && <Trophy className="h-5 w-5 text-gray-400 mr-1" />}
          {rank === 3 && <Trophy className="h-5 w-5 text-amber-600 mr-1" />}
          <span className={`font-bold ${rank <= 3 ? "text-primary" : ""}`}>
            #{rank}
          </span>
        </div>
      );
    },
    size: 80,
  },
  {
    accessorKey: "username",
    header: "Pioneer",
    cell: ({ row }) => {
      const pioneer = row.original;
      return (
        <Link
          href={`/${pioneer.id}/echo-journal`}
          className="flex items-center justify-center space-x-3 hover:text-primary transition-colors group"
          prefetch={false}
        >
          <UserAvatar size={32} userId={pioneer.username} />
          <div className="min-w-0">
            <div className="font-medium truncate group-hover:text-primary">
              @
              {pioneer.username.length < 10
                ? pioneer.username
                : `${pioneer.username.slice(0, 10)}..`}
            </div>
          </div>
        </Link>
      );
    },
    size: 200,
  },
  {
    accessorKey: "level",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2 lg:px-3"
      >
        <Zap className="h-4 w-4" />
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-1">
        <Badge
          variant="outline"
          className="text-neon-green border-neon-green/50 bg-neon-green/10"
        >
          Lv {row.getValue("level")}
        </Badge>
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "sharePoints",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2 lg:px-3"
      >
        <Coins className="h-4 w-4" />
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center font-medium text-neon-orange">
        {formatNumber(row.getValue("sharePoints"))}
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: "xp",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2 lg:px-3 hidden md:flex"
      >
        XP
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="items-center justify-center font-medium text-primary hidden md:block">
        {formatNumber(row.getValue("xp"))}
      </div>
    ),
    size: 100,
  },
];
