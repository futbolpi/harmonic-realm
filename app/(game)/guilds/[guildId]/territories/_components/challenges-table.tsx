"use client";

import { useMemo, useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";

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
import { Progress } from "@/components/ui/progress";
import type { InitialChallenges } from "../services";

interface ChallengesTableProps {
  challenges: InitialChallenges;
}

export default function ChallengesTable({ challenges }: ChallengesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<InitialChallenges[number]>[] = useMemo(
    () => [
      {
        accessorKey: "territory.hexId",
        header: "Territory",
        cell: ({ row }) => (
          <code className="text-xs font-mono">
            {row.original.territory.hexId}
          </code>
        ),
      },
      {
        accessorKey: "defender.name",
        header: "Defender",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.defender.name}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.defender.tag}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "attacker.name",
        header: "Attacker",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.attacker.name}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.attacker.tag}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "defenderScore",
        header: "Score",
        cell: ({ row }) => {
          const defenderScore = row.original.defenderScore;
          const attackerScore = row.original.attackerScore;
          const total = defenderScore + attackerScore;
          const defenderPercent = total > 0 ? (defenderScore / total) * 100 : 0;

          return (
            <div className="space-y-1">
              <Progress value={defenderPercent} className="h-1.5" />
              <div className="text-xs text-muted-foreground">
                {defenderScore.toLocaleString()} -{" "}
                {attackerScore.toLocaleString()}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "endsAt",
        header: "Ends",
        cell: ({ row }) => (
          <div>
            <div className="text-sm">
              {format(new Date(row.original.endsAt), "MMM d, HH:mm")}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(row.original.endsAt), {
                addSuffix: true,
              })}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "resolved",
        header: "Status",
        cell: ({ row }) => {
          const resolved = row.getValue("resolved") as boolean;
          return resolved ? (
            <Badge variant="outline">Resolved</Badge>
          ) : (
            <Badge variant="default" className="bg-red-600">
              Active
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => (
          <Button asChild size="sm" variant="ghost">
            <Link href={`/territories/${row.original.territory.hexId}`}>
              View
            </Link>
          </Button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: challenges,
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
                No active challenges
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
