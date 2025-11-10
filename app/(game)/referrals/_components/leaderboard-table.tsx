"use client";

import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

type ReferralData = {
  position: number;
  username: string;
  noOfReferrals: number;
};

// 👇 Client component for TanStack Table UI
export function LeaderboardTable({ data }: { data: ReferralData[] }) {
  const columns: ColumnDef<ReferralData>[] = [
    {
      accessorKey: "position",
      header: "Pos",
      cell: ({ getValue }) => (
        <div className="font-medium w-10 text-center">{getValue<number>()}</div>
      ),
    },
    {
      accessorKey: "username",
      header: "Name",
      cell: ({ getValue }) => (
        <div className="max-w-[130px] sm:max-w-[180px] truncate">
          {getValue<string>()}
        </div>
      ),
    },
    {
      accessorKey: "noOfReferrals",
      header: () => <div className="text-right">Referrals</div>,
      cell: ({ getValue }) => (
        <div className="text-right w-[70px] sm:w-[100px]">
          {getValue<number>()}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  });

  return (
    <Card className="mt-8 mb-16 w-full">
      <CardHeader>
        <CardTitle>Referral Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Responsive scroll container */}
        <ScrollArea className="w-full">
          <div className="min-w-[360px] sm:min-w-full overflow-x-auto">
            <Table className="text-sm w-full table-fixed">
              <colgroup>
                <col className="w-[60px]" /> {/* Position */}
                <col className="w-[150px] sm:w-[200px]" /> {/* Username */}
                <col className="w-[90px] sm:w-[120px]" /> {/* Referrals */}
              </colgroup>

              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className={
                          header.column.id === "noOfReferrals"
                            ? "text-right"
                            : "text-left"
                        }
                      >
                        {flexRender(
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
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={
                          cell.column.id === "noOfReferrals"
                            ? "text-right"
                            : "text-left"
                        }
                      >
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
        </ScrollArea>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4 gap-2 flex-wrap">
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
  );
}
