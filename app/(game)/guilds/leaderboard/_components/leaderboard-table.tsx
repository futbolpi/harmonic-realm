"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLeaderboardColumns } from "./use-leaderboard-columns";
import type { LeaderboardGuild, LeaderboardType } from "../services";

interface LeaderboardTableProps {
  guilds: LeaderboardGuild[];
  type: LeaderboardType;
  userGuildId?: string | null;
}

// Metric column visibility mapping
const METRIC_COLUMN_MAP: Record<LeaderboardType, string> = {
  prestige: "prestige-metric",
  activity: "activity-metric",
  vault: "vault-metric",
  territories: "territories-metric",
};

export function LeaderboardTable({
  guilds,
  type,
  userGuildId,
}: LeaderboardTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Add rank to each guild
  const rankedGuilds = useMemo(
    () => guilds.map((guild, index) => ({ ...guild, rank: index + 1 })),
    [guilds],
  );

  const columns = useLeaderboardColumns({ userGuildId });

  // Compute visibility state - STABLE and only changes when type changes
  const columnVisibility = useMemo(() => {
    const visibility: Record<string, boolean> = {
      "prestige-metric": false,
      "activity-metric": false,
      "vault-metric": false,
      "territories-metric": false,
    };
    visibility[METRIC_COLUMN_MAP[type]] = true;
    return visibility;
  }, [type]);

  const table = useReactTable({
    data: rankedGuilds,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-lg font-semibold">
            📊 Full Rankings
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search guilds..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-lg border bg-card/50 backdrop-blur-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40 sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-border/40 hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-xs font-semibold text-foreground/70 h-10 px-4 py-2"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => {
                  const isUserGuild = row.original.id === userGuildId;

                  return (
                    <TableRow
                      key={row.id}
                      className={cn(
                        "border-border/20 hover:bg-muted/40 transition-colors h-14",
                        isUserGuild &&
                          "bg-primary/5 hover:bg-primary/10 border-primary/20",
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="px-4 py-3 text-sm align-middle"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center py-12 text-muted-foreground text-sm"
                  >
                    No guilds found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t border-border/20">
          <div className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {table.getFilteredRowModel().rows.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">{guilds.length}</span>{" "}
            guilds
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-xs font-medium min-w-fit">
              Page{" "}
              <span className="text-foreground">
                {table.getState().pagination.pageIndex + 1}
              </span>{" "}
              of{" "}
              <span className="text-foreground">{table.getPageCount()}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
