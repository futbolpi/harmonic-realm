"use client";

import React, { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MapPin } from "lucide-react";
import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getRarityInfo } from "@/app/(game)/map/utils";
import type { NodeTypeRarity } from "@/lib/generated/prisma/enums";

interface Node {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: {
    name: string;
    rarity: NodeTypeRarity;
  };
}

interface Props {
  nodes: Node[];
}

export default function TerritoryNodesTable({ nodes }: Props) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(6);
  const [rarityFilter, setRarityFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!rarityFilter) return nodes;
    return nodes.filter((n) => n.type.rarity === rarityFilter);
  }, [nodes, rarityFilter]);

  const columnHelper = createColumnHelper<Node>();

  const columns = [
    columnHelper.accessor("name", {
      header: "Node Name",
      cell: (info) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-3 h-3 text-muted-foreground" />
          <Link
            href={`/nodes/${info.row.original.id}`}
            className="font-medium hover:underline"
            prefetch={false}
          >
            {info.getValue()}
          </Link>
        </div>
      ),
    }),
    columnHelper.accessor("type.name", {
      header: "Type",
      cell: (info) => (
        <span className="text-sm text-muted-foreground">
          {info.getValue() || "Unknown"}
        </span>
      ),
    }),
    columnHelper.accessor("type.rarity", {
      header: "Rarity",
      cell: (info) => {
        const rarity = info.getValue();
        const colors = getRarityInfo(rarity);
        const badgeClass = `${
          colors.fromColor ? colors.fromColor : colors.color
        } ${colors.textColor}`;
        return (
          <Badge
            variant="outline"
            className={`text-xs px-2 py-1 ${badgeClass}`}
          >
            {rarity || "Unknown"}
          </Badge>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: filtered,
    columns,
    state: {
      pagination: { pageIndex, pageSize },
    },
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

  if (nodes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No nodes in this territory yet</p>
      </div>
    );
  }

  return (
    <div className="border border-border/30 rounded-lg overflow-hidden">
      <div className="p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Filter:</label>
          <select
            value={rarityFilter ?? ""}
            onChange={(e) => setRarityFilter(e.target.value || null)}
            className="text-sm p-1 border rounded"
          >
            <option value="">All</option>
            <option value="Common">Common</option>
            <option value="Uncommon">Uncommon</option>
            <option value="Rare">Rare</option>
            <option value="Epic">Epic</option>
            <option value="Legendary">Legendary</option>
          </select>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filtered.length} nodes
        </div>
      </div>

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
                    className="py-3 px-4 text-xs font-semibold text-muted-foreground"
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
                className="border-b border-border/10 hover:bg-muted/30 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-3 px-4 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
  );
}
