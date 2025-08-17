"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { ArrowUpDown, Clock, Trophy, Zap } from "lucide-react";
import { format } from "date-fns";

import { UserProfile } from "@/lib/schema/user";
import { Button } from "@/components/ui/button";
import { SessionStatus } from "@/lib/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";

export type MiningSession = UserProfile["sessions"][number];

const getStatusBadge = (status: SessionStatus) => {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          Active
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          Completed
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export const useColumns = (showUserColumn: boolean) => {
  return useMemo<ColumnDef<MiningSession>[]>(() => {
    const baseColumns: ColumnDef<MiningSession>[] = [
      {
        accessorFn: (row) => `${row.node.name}`,
        id: "nodeId",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 text-game-accent hover:text-game-accent/80"
          >
            Node
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-game-accent/60" />
            <span className="font-medium">{row.original.node.name}</span>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => getStatusBadge(row.getValue("status")),
        filterFn: (row, id, value) => {
          return value === "all" || row.getValue(id) === value;
        },
      },
      {
        accessorFn: (row) => `${row.node.type.lockInMinutes}`,
        id: "lockInMinutes",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 text-game-accent hover:text-game-accent/80"
          >
            <Clock className="h-3 w-3 mr-1" />
            Duration
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm">
            {row.original.node.type.lockInMinutes}m
          </div>
        ),
      },
      {
        accessorKey: "minerSharesEarned",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 text-game-accent hover:text-game-accent/80"
          >
            <Zap className="h-3 w-3 mr-1" />
            Earned
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-1 font-medium text-game-accent">
            <Trophy className="h-3 w-3" />
            {(row.getValue("minerSharesEarned") as number).toFixed(2)}
          </div>
        ),
      },
      {
        accessorKey: "startTime",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 text-game-accent hover:text-game-accent/80 hidden sm:flex"
          >
            Started
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-muted-foreground text-sm hidden sm:block">
            {format(new Date(row.getValue("startTime")), "MMM d, HH:mm")}
          </div>
        ),
      },
    ];

    if (showUserColumn) {
      baseColumns.splice(1, 0, {
        accessorFn: (row) => `${row.user.username}`,
        id: "username",
        header: "Pioneer",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.user.username}
          </span>
        ),
      });
    }

    return baseColumns;
  }, [showUserColumn]);
};
