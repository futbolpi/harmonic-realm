"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { VaultTransactionType } from "@/lib/generated/prisma/enums";

type VaultTransaction = {
  id: string;
  balanceAfter: number;
  balanceBefore: number;
  createdAt: Date;
  reason: string | null;
  type: VaultTransactionType;
  amount?: number;
};

type VaultTransactionsTableProps = {
  transactions: VaultTransaction[];
};

const getTransactionColor = (type: VaultTransactionType) => {
  switch (type) {
    case "DEPOSIT":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200";
    case "WITHDRAWAL":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200";
    case "REWARD":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200";
    case "UPGRADE":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200";
    case "DISTRIBUTION":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getTimeFilterDate = (filter: string): Date | null => {
  const now = new Date();
  switch (filter) {
    case "today":
      return new Date(now.setHours(0, 0, 0, 0));
    case "week":
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return weekAgo;
    case "month":
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      return monthAgo;
    default:
      return null;
  }
};

export default function VaultTransactionsTable({
  transactions,
}: VaultTransactionsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("all");

  const columns = useMemo<ColumnDef<VaultTransaction>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 -ml-3"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Time
              <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(row.getValue("createdAt"), {
              addSuffix: true,
            })}
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          const type = row.getValue("type") as VaultTransactionType;
          return (
            <Badge
              variant="outline"
              className={`text-xs ${getTransactionColor(type)}`}
            >
              {type.toLowerCase()}
            </Badge>
          );
        },
      },
      {
        accessorKey: "reason",
        header: "Description",
        cell: ({ row }) => (
          <div className="text-sm">
            {row.getValue("reason") || row.getValue("type")}
          </div>
        ),
      },
      {
        accessorKey: "amount",
        header: ({ column }) => {
          return (
            <div className="text-right">
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Change
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </Button>
            </div>
          );
        },
        cell: ({ row }) => {
          const before = row.original.balanceBefore;
          const after = row.original.balanceAfter;
          const change = after - before;
          const isPositive = change > 0;

          return (
            <div className="text-right">
              <span
                className={`text-sm font-medium ${
                  isPositive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {isPositive ? "+" : ""}
                {change.toLocaleString()} SP
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "balanceAfter",
        header: () => <div className="text-right">Balance</div>,
        cell: ({ row }) => (
          <div className="text-right text-sm text-muted-foreground">
            {row.getValue<number>("balanceAfter").toLocaleString()} SP
          </div>
        ),
      },
    ],
    [],
  );

  const filteredData = useMemo(() => {
    let filtered = [...transactions];

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    // Filter by time
    const timeFilterDate = getTimeFilterDate(timeFilter);
    if (timeFilterDate) {
      filtered = filtered.filter((t) => t.createdAt >= timeFilterDate);
    }

    return filtered;
  }, [transactions, typeFilter, timeFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Get unique transaction types
  const transactionTypes = useMemo(() => {
    const types = new Set(transactions.map((t) => t.type));
    return Array.from(types);
  }, [transactions]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {transactionTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Past Week</SelectItem>
              <SelectItem value="month">Past Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="text-sm text-muted-foreground">
                    No transactions found
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {filteredData.length}{" "}
          transaction(s)
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:ml-1">Previous</span>
          </Button>
          <div className="text-xs text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only sm:not-sr-only sm:mr-1">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
