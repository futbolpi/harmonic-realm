"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type SortingState,
  type ColumnDef,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type Member = {
  username: string;
  vaultContribution: number;
  weeklySharePoints: number;
  totalSharePoints: number;
  challengeCompletions: number;
};

type MetricType = "weekly" | "vault" | "total" | "challenges";

type LeaderboardCardProps = {
  members: Member[];
};

const getMetricLabel = (metric: MetricType): string => {
  switch (metric) {
    case "weekly":
      return "This Week SP";
    case "vault":
      return "Vault Contribution";
    case "total":
      return "Lifetime SP";
    case "challenges":
      return "Challenges";
  }
};

const getMetricValue = (member: Member, metric: MetricType): number => {
  switch (metric) {
    case "weekly":
      return member.weeklySharePoints;
    case "vault":
      return member.vaultContribution;
    case "total":
      return member.totalSharePoints;
    case "challenges":
      return member.challengeCompletions;
  }
};

const LeaderboardCard = ({ members }: LeaderboardCardProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("weekly");

  const columns: ColumnDef<Member>[] = useMemo(
    () => [
      {
        accessorKey: "username",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 hover:text-foreground transition-colors"
          >
            Member
            <ArrowUpDown className="w-4 h-4" />
          </button>
        ),
        cell: ({ row }) => (
          <div className="font-medium text-foreground truncate">
            {row.getValue("username")}
          </div>
        ),
      },
      {
        id: "metric",
        accessorFn: (row) => getMetricValue(row, selectedMetric),
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 hover:text-foreground transition-colors ml-auto"
          >
            <ArrowUpDown className="w-4 h-4" />
            {getMetricLabel(selectedMetric)}
          </button>
        ),
        cell: ({ row }) => {
          const value = row.getValue("metric") as number;
          return (
            <div className="font-semibold text-right">
              {value.toLocaleString()}
            </div>
          );
        },
      },
    ],
    [selectedMetric],
  );

  const table = useReactTable({
    data: members,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const rows = table.getRowModel().rows;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2 sm:flex-row flex-col">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <CardTitle className="text-lg">Leaderboard</CardTitle>
          </div>

          <Select onValueChange={(v) => setSelectedMetric(v as MetricType)}>
            <SelectTrigger className="w-28 sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">This Week</SelectItem>
              <SelectItem value="vault">Vault</SelectItem>
              <SelectItem value="total">Lifetime</SelectItem>
              <SelectItem value="challenges">Challenges</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mobile-First Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-border/50 bg-muted/30"
                >
                  {headerGroup.headers.map((header, idx) => (
                    <th
                      key={header.id}
                      className={`px-2 sm:px-4 py-3 text-left font-semibold text-xs sm:text-sm text-muted-foreground ${
                        idx === headerGroup.headers.length - 1
                          ? "text-right"
                          : ""
                      }`}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border/30">
              {rows.map((row, idx) => (
                <tr
                  key={row.id}
                  className="hover:bg-muted/40 transition-colors"
                >
                  <td className="px-2 sm:px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="w-6 h-6 flex items-center justify-center rounded-full p-0 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                      >
                        {pageIndex * 10 + idx + 1}
                      </Badge>
                      {flexRender(
                        row.getVisibleCells()[0].column.columnDef.cell,
                        row.getVisibleCells()[0].getContext(),
                      )}
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-3">
                    {flexRender(
                      row.getVisibleCells()[1].column.columnDef.cell,
                      row.getVisibleCells()[1].getContext(),
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {rows.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No members on the leaderboard yet
          </div>
        )}

        {/* Pagination - Mobile First */}
        <div className="flex items-center justify-between flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-border/30">
          <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
            Page {pageIndex + 1} of {pageCount || 1}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="w-9 h-9 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="w-9 h-9 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
            {table.getFilteredRowModel().rows.length} total members
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaderboardCard;
