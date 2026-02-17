// app/(game)/resonance-surge/_components/top-hexes-table.tsx
"use client";

import { useState, useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { NodeTypeRarity } from "@/lib/generated/prisma/enums";
import type { SurgeNode } from "../services";

interface TopHexesTableProps {
  surges: SurgeNode[];
}

type TableRow = {
  rank: number;
  h3Index: string;
  activityScore: number;
  nodesActive: number;
  nodesStabilized: number;
  topRarity: NodeTypeRarity;
};

type Status = "all" | "active" | "stabilized";

const columnHelper = createColumnHelper<TableRow>();

export function TopHexesTable({ surges }: TopHexesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "rank", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [statusFilter, setStatusFilter] = useState<Status>("all");

  // Aggregate data by hex
  const hexData = useMemo(() => {
    const hexMap = new Map<string, TableRow>();
    // Define an ordering of rarities from common -> rarest.
    const rarityOrder: NodeTypeRarity[] = [
      "Common",
      "Uncommon",
      "Rare",
      "Epic",
      "Legendary",
    ];

    const getRank = (r?: NodeTypeRarity) => {
      if (!r) return -1;
      return rarityOrder.indexOf(r);
    };

    surges.forEach((surge) => {
      const existing = hexMap.get(surge.h3Index);
      const incomingRarity = surge.node?.type?.rarity;

      if (existing) {
        existing.nodesActive += !surge.isStabilized ? 1 : 0;
        existing.nodesStabilized += surge.isStabilized ? 1 : 0;
        existing.activityScore =
          (existing.activityScore ?? 0) + (surge.activityScore ?? 0);

        const currentRank = getRank(existing.topRarity);
        const incomingRank = getRank(incomingRarity);

        // pick the rarer (higher index in rarityOrder). If unknown, prefer existing.
        if (incomingRank > currentRank) {
          existing.topRarity = incomingRarity;
        }
      } else {
        hexMap.set(surge.h3Index, {
          rank: surge.hexRank,
          h3Index: surge.h3Index,
          activityScore: surge.activityScore ?? 0,
          nodesActive: !surge.isStabilized ? 1 : 0,
          nodesStabilized: surge.isStabilized ? 1 : 0,
          topRarity: surge.node.type.rarity,
        });
      }
    });

    return Array.from(hexMap.values());
  }, [surges]);

  // Apply status filter
  const filteredData = useMemo(() => {
    if (statusFilter === "all") return hexData;
    if (statusFilter === "active")
      return hexData.filter((h) => h.nodesActive > 0);
    if (statusFilter === "stabilized")
      return hexData.filter((h) => h.nodesStabilized > 0);
    return hexData;
  }, [hexData, statusFilter]);

  const columns = [
    columnHelper.accessor("rank", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Rank
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: (info) => (
        <Badge variant={info.getValue() <= 3 ? "default" : "secondary"}>
          #{info.getValue()}
        </Badge>
      ),
      size: 70,
    }),
    columnHelper.accessor("h3Index", {
      header: "Hex ID",
      cell: (info) => (
        <span className="font-mono text-xs">
          {info.getValue().slice(0, 14)}...
        </span>
      ),
      size: 140,
    }),
    columnHelper.accessor("activityScore", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Activity Score
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: (info) => (
        <span className="font-mono font-semibold">
          {info.getValue().toLocaleString()}
        </span>
      ),
    }),
    columnHelper.accessor("nodesActive", {
      header: "Active",
      cell: (info) => (
        <Badge variant="outline" className="border-amber-500">
          {info.getValue()}
        </Badge>
      ),
      size: 70,
    }),
    columnHelper.accessor("nodesStabilized", {
      header: "Stabilized",
      cell: (info) => (
        <Badge variant="outline" className="border-green-500">
          {info.getValue()}
        </Badge>
      ),
      size: 90,
    }),
    columnHelper.accessor("topRarity", {
      header: "Top Rarity",
      cell: (info) => <Badge variant="secondary">{info.getValue()}</Badge>,
      size: 100,
    }),
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Active Hexes</CardTitle>
        <CardDescription>
          {filteredData.length} hexes with surge activity
        </CardDescription>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by hex ID..."
                value={
                  (table.getColumn("h3Index")?.getFilterValue() as string) ?? ""
                }
                onChange={(e) =>
                  table.getColumn("h3Index")?.setFilterValue(e.target.value)
                }
                className="pl-9"
              />
            </div>
          </div>

          <Select
            value={statusFilter}
            onValueChange={(v: string) => setStatusFilter(v as Status)}
          >
            <SelectTrigger className="w-full sm:w-45">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hexes</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="stabilized">Stabilized Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground"
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
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
