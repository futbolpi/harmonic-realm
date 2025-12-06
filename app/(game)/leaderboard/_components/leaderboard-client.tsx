"use client";

import { useState } from "react";
import {
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Trophy, Coins, Search, Users, Globe } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/utils";
import { columns, Pioneer } from "./columns";

interface LeaderboardData {
  pioneers: Pioneer[];
  totalPioneers: number;
  globalStats: {
    totalSessions: number;
    totalSharePoints: number;
    averageLevel: number;
  };
}

interface LeaderboardClientProps {
  data: LeaderboardData;
}

export function LeaderboardClient({ data }: LeaderboardClientProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "rank", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    completedSessions: false, // Hide on mobile by default
    achievements: false, // Hide on mobile by default
  });

  const table = useReactTable({
    data: data.pioneers,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-6">
      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="game-card">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary">
              {formatNumber(data.totalPioneers)}
            </div>
            <p className="text-xs text-muted-foreground">Total Pioneers</p>
          </CardContent>
        </Card>

        <Card className="game-card">
          <CardContent className="p-4 text-center">
            <Globe className="h-8 w-8 text-neon-green mx-auto mb-2" />
            <div className="text-2xl font-bold text-neon-green">
              {formatNumber(data.globalStats.totalSessions)}
            </div>
            <p className="text-xs text-muted-foreground">Global Sessions</p>
          </CardContent>
        </Card>

        <Card className="game-card">
          <CardContent className="p-4 text-center">
            <Coins className="h-8 w-8 text-neon-orange mx-auto mb-2" />
            <div className="text-2xl font-bold text-neon-orange">
              {formatNumber(
                parseFloat(data.globalStats.totalSharePoints.toFixed(2))
              )}
            </div>
            <p className="text-xs text-muted-foreground">Total Shares</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="game-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Pioneer Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search by Pioneer username..."
              value={
                (table.getColumn("username")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("username")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Table */}
      <Card className="game-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-neon-orange" />
            Pioneer Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-border/50">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="text-center">
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
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="border-border/50 hover:bg-muted/20"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No Pioneers found in the Lattice.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-end md:justify-between space-x-2 py-4">
            <div className="text-sm hidden md:flex text-muted-foreground">
              Showing{" "}
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}{" "}
              to{" "}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{" "}
              of {table.getFilteredRowModel().rows.length} Pioneers
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
