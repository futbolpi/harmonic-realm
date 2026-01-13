"use client";

import { useState } from "react";
import { Sword, Users, Zap, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProfile } from "@/hooks/queries/use-profile";

type Challenge = {
  defender: {
    id: string;
    name: string;
    emblem: string;
    tag: string;
  };
  attacker: {
    id: string;
    name: string;
    emblem: string;
    tag: string;
  };
  contributions: {
    username: string;
    sharePoints: number;
    tuneCount: number;
  }[];
} & {
  id: string;
  createdAt: Date;
  territoryId: string;
  defenderId: string;
  defenderStake: number;
  defenderScore: number;
  attackerId: string;
  attackerStake: number;
  attackerScore: number;
  endsAt: Date;
  resolved: boolean;
  winnerId: string | null;
};

interface Props {
  challenge: Challenge;
  territory: { centerLat: number; centerLon: number };
}

const contributionColumnHelper =
  createColumnHelper<Challenge["contributions"][number]>();

const contributionColumns = [
  contributionColumnHelper.accessor("username", {
    header: "Player",
    cell: (info) => (
      <span className="font-medium text-sm">{info.getValue()}</span>
    ),
  }),
  contributionColumnHelper.accessor("sharePoints", {
    header: "Points",
    cell: (info) => (
      <span className="text-sm font-semibold text-emerald-600">
        {Math.round(info.getValue())}
      </span>
    ),
  }),
  contributionColumnHelper.accessor("tuneCount", {
    header: "Tunes",
    cell: (info) => (
      <span className="text-sm text-muted-foreground">{info.getValue()}</span>
    ),
  }),
];

export default function TerritoryChallengeSection({
  challenge,
  territory,
}: Props) {
  const { data: profile } = useProfile();
  const userGuildId = profile?.guildMembership?.guildId;

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const table = useReactTable({
    data: challenge.contributions || [],
    columns: contributionColumns,
    state: { pagination: { pageIndex, pageSize } },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(next.pageIndex ?? 0);
      setPageSize(next.pageSize ?? pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const isDefender = userGuildId === challenge.defenderId;
  const isAttacker = userGuildId === challenge.attackerId;
  const isMember = isDefender || isAttacker;

  return (
    <div className="space-y-4">
      {/* Challenge Header */}
      <Card className="p-6 bg-amber-500/5 border-amber-500/20 space-y-4">
        <div className="flex items-center gap-2">
          <Sword className="w-5 h-5 text-amber-600" />
          <h3 className="font-semibold text-foreground">Active Challenge</h3>
        </div>

        {/* vs Layout */}
        <div className="grid grid-cols-3 gap-3 items-center">
          {/* Defender */}
          <div className="space-y-2 p-3 rounded-lg bg-muted/30 border border-border/30">
            <p className="text-xs text-muted-foreground font-medium">
              Defender
            </p>
            <p className="font-bold text-sm">{challenge.defender.name}</p>
            <Badge variant="outline" className="text-xs">
              {Math.round(challenge.defenderScore)} pts
            </Badge>
          </div>

          {/* VS Divider */}
          <div className="text-center">
            <p className="text-xl font-bold text-amber-600">VS</p>
          </div>

          {/* Attacker */}
          <div className="space-y-2 p-3 rounded-lg bg-muted/30 border border-border/30">
            <p className="text-xs text-muted-foreground font-medium">
              Attacker
            </p>
            <p className="font-bold text-sm">{challenge.attacker.name}</p>
            <Badge variant="outline" className="text-xs">
              {Math.round(challenge.attackerScore)} pts
            </Badge>
          </div>
        </div>

        <Separator className="bg-border/20" />

        {/* Time Remaining */}
        <div className="flex items-center justify-between bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium">
              Ends{" "}
              {formatDistanceToNow(new Date(challenge.endsAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>

        {/* Contribute Button */}
        {isMember && (
          <Link
            href={`/map?lat=${territory.centerLat}&lng=${territory.centerLon}`}
            className="w-full"
          >
            <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Zap className="w-4 h-4" />
              Contribute to Challenge
            </Button>
          </Link>
        )}
      </Card>

      {/* Contributions Table */}
      {challenge.contributions && challenge.contributions.length > 0 && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-border/20 bg-muted/30">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <h4 className="font-semibold text-sm">Top Contributors</h4>
            </div>
          </div>
          <div className="border border-border/30 rounded-b-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      className="border-b border-border/20"
                    >
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className="py-2 px-3 text-xs font-semibold text-muted-foreground"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="border-b border-border/10 hover:bg-muted/30 transition-colors last:border-b-0"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-2 px-3 text-sm">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <button
                  className="px-2 py-1 rounded border"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Prev
                </button>
                <button
                  className="px-2 py-1 rounded border"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </button>
              </div>

              <div className="text-sm text-muted-foreground">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
