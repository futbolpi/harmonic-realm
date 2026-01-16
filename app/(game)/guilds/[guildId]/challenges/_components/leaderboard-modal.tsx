"use client";

import { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Award } from "lucide-react";

import {
  Credenza,
  CredenzaBody,
  CredenzaClose,
  CredenzaContent,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "@/components/credenza";
import { Button } from "@/components/ui/button";
import { UserContribution } from "@/lib/guild/challenges";

interface LeaderboardModalProps {
  contributions: UserContribution[] | null;
  onClose: () => void;
  onContributeClick?: () => void;
}

const columnHelper = createColumnHelper<UserContribution>();

const medalEmojis = ["🥇", "🥈", "🥉"];

export default function LeaderboardModal({
  contributions,
  onClose,
  onContributeClick,
}: LeaderboardModalProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "contribution", desc: true },
  ]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "rank",
        header: "Rank",
        cell: (info) => {
          const rank = info.row.index + 1;
          const medal = medalEmojis[rank - 1] || `#${rank}`;
          return <span className="font-semibold">{medal}</span>;
        },
        size: 60,
      }),
      columnHelper.accessor("username", {
        header: "Pioneer",
        cell: (info) => (
          <span className="font-medium text-foreground">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("contribution", {
        header: "Contribution",
        cell: (info) => (
          <span className="text-right font-semibold">
            {info.getValue().toLocaleString()}
          </span>
        ),
        sortingFn: "alphanumeric",
      }),
    ],
    []
  );

  const table = useReactTable({
    data: contributions || [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  });

  const isEmpty = !contributions || contributions.length === 0;

  return (
    <Credenza open={!!contributions} onOpenChange={onClose}>
      <CredenzaContent className="max-w-2xl">
        <CredenzaHeader>
          <CredenzaTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Challenge Leaderboard
          </CredenzaTitle>
        </CredenzaHeader>

        <CredenzaBody className="overflow-y-auto max-h-96">
          {isEmpty ? (
            // Empty State
            <div className="py-12 text-center">
              <div className="mb-4 text-4xl opacity-50">🌌</div>
              <h3 className="text-lg font-semibold mb-2">
                No Contributions Yet
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                No guild members have contributed to this challenge yet. Be the
                first to help your guild!
              </p>
              {onContributeClick && (
                <Button onClick={onContributeClick} size="sm">
                  Start Contributing →
                </Button>
              )}
            </div>
          ) : (
            // Table
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-4 py-3 text-left font-semibold text-foreground"
                            style={{ width: header.getSize() }}
                          >
                            {header.isPlaceholder ? null : (
                              <div
                                className="flex items-center gap-2 cursor-pointer select-none"
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                                {header.column.getIsSorted() && (
                                  <span className="text-xs">
                                    {header.column.getIsSorted() === "desc"
                                      ? "↓"
                                      : "↑"}
                                  </span>
                                )}
                              </div>
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
                        className="border-b hover:bg-muted/30 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-4 py-3"
                            style={{ width: cell.column.getSize() }}
                          >
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

              {/* Pagination */}
              {table.getPageCount() > 1 && (
                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">
                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()} • {contributions.length} total
                    contributors
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CredenzaBody>

        <CredenzaFooter>
          {!isEmpty && onContributeClick && (
            <Button onClick={onContributeClick} className="flex-1">
              Contribute Now →
            </Button>
          )}
          <CredenzaClose asChild>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </CredenzaClose>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
