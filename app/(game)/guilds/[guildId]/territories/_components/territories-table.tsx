"use client";

import { useMemo } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { InitialTerritories } from "../services";

interface TerritoriesTableProps {
  territories: InitialTerritories;
}

export default function TerritoriesTable({
  territories,
}: TerritoriesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<InitialTerritories[number]>[] = useMemo(
    () => [
      {
        accessorKey: "hexId",
        header: "Territory ID",
        cell: ({ row }) => (
          <code className="text-xs font-mono">{row.getValue("hexId")}</code>
        ),
      },
      {
        accessorKey: "nodeCount",
        header: "Nodes",
        cell: ({ row }) => <span>{row.getValue("nodeCount")}</span>,
      },
      {
        accessorKey: "trafficScore",
        header: "Traffic",
        cell: ({ row }) => {
          const score = row.original.trafficScore;
          const level = score > 200 ? "High" : score > 100 ? "Medium" : "Low";
          return <Badge variant="outline">{level}</Badge>;
        },
      },
      {
        accessorKey: "currentStake",
        header: "Stake (RES)",
        cell: ({ row }) => row.original.currentStake.toLocaleString(),
      },
      {
        accessorKey: "controlEndsAt",
        header: "Expires",
        cell: ({ row }) => {
          const date = row.original.controlEndsAt;
          return date
            ? formatDistanceToNow(new Date(date), { addSuffix: true })
            : "—";
        },
      },
      {
        accessorKey: "activeChallenge",
        header: "Status",
        cell: ({ row }) => {
          const challenge = row.original.activeChallengeId;
          return challenge ? (
            <Badge variant="destructive">Under Challenge</Badge>
          ) : (
            <Badge variant="secondary">Secured</Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => (
          <Button asChild size="sm" variant="ghost">
            <Link href={`/territories/${row.getValue("hexId")}`}>Details</Link>
          </Button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: territories,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
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
              <TableRow key={row.id} className="hover:bg-muted/50">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
                No territories claimed yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
