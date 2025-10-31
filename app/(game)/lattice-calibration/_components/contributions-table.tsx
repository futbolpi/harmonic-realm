"use client";

import { useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  ContributionTier,
  PaymentStatus,
} from "@/lib/generated/prisma/browser";

type Contribution = {
  paymentStatus: PaymentStatus;
  contributionTier: ContributionTier;
  piContributed: number;
  createdAt: Date;
};

interface ContributionsTableProps {
  contributions: Contribution[];
}

const columnHelper = createColumnHelper<Contribution>();

const getStatusColor = (status: PaymentStatus) => {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "FAILED":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

const getTierColor = (tier: ContributionTier) => {
  switch (tier) {
    case "ECHO_SUPPORTER":
      return "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950";
    case "RESONANCE_PATRON":
      return "border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950";
    case "LATTICE_ARCHITECT":
      return "border-pink-200 bg-pink-50 dark:border-pink-900 dark:bg-pink-950";
    case "COSMIC_FOUNDER":
      return "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950";
    default:
      return "border-gray-200 bg-gray-50 dark:border-gray-900 dark:bg-gray-950";
  }
};

export function ContributionsTable({ contributions }: ContributionsTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = [
    columnHelper.accessor("piContributed", {
      header: "Amount",
      cell: (info) => `${info.getValue()} Pi`,
      size: 80,
    }),
    columnHelper.accessor("contributionTier", {
      header: "Tier",
      cell: (info) => (
        <Badge
          variant="outline"
          className={`${getTierColor(info.getValue())} border text-xs`}
        >
          {info.getValue().replace(/_/g, " ")}
        </Badge>
      ),
      size: 120,
    }),
    columnHelper.accessor("paymentStatus", {
      header: "Status",
      cell: (info) => (
        <Badge
          variant="secondary"
          className={`${getStatusColor(info.getValue())} text-xs`}
        >
          {info.getValue()}
        </Badge>
      ),
      size: 90,
    }),
    columnHelper.accessor("createdAt", {
      header: "Date",
      cell: (info) => info.getValue().toLocaleDateString(),
      size: 100,
    }),
  ];

  const table = useReactTable({
    data: contributions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      columnFilters,
      globalFilter,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 5,
      },
      sorting: [
        {
          id: "createdAt",
          desc: true,
        },
      ],
    },
  });

  if (contributions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Community Contributions</CardTitle>
          <CardDescription>0 contributions this phase</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No contributions yet. Be the first to stake!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Contributions</CardTitle>
        <CardDescription>
          {contributions.length}{" "}
          {contributions.length === 1 ? "contribution" : "contributions"} this
          phase
        </CardDescription>
        <div className="mt-4">
          <Input
            placeholder="Filter by amount, tier or status..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="border-b border-border">
                  {table.getHeaderGroups()[0].headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-2 md:px-4 py-2 text-left font-semibold text-muted-foreground"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-2 md:px-4 py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between pt-2">
          <div className="text-xs text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
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
