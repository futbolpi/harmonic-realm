import { ColumnDef } from "@tanstack/react-table";

import { DriftNodeWithCost } from "@/lib/schema/drift";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRarityInfo } from "../../map/utils";

interface Props {
  onRowClick: (node: DriftNodeWithCost) => void;
}

export const useColumns = ({
  onRowClick,
}: Props): ColumnDef<DriftNodeWithCost>[] => {
  return [
    {
      accessorKey: "rarity",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting()}
          className="flex items-center gap-1"
        >
          Rarity ↕
        </button>
      ),
      cell: ({ row }) => {
        const rarityInfo = getRarityInfo(row.original.rarity);
        return (
          <Badge className={`${rarityInfo.color}`}>
            ★ {row.original.rarity}
          </Badge>
        );
      },
    },
    {
      accessorKey: "distance",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting()}
          className="flex items-center gap-1"
        >
          Distance ↕
        </button>
      ),
      cell: ({ row }) => `${row.original.distance.toFixed(1)} km`,
    },
    {
      accessorKey: "cost",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting()}
          className="flex items-center gap-1"
        >
          Cost ↕
        </button>
      ),
      cell: ({ row }) => `${row.original.cost.toLocaleString()} SP`,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          size="sm"
          onClick={() => {
            onRowClick(row.original);
          }}
        >
          Select
        </Button>
      ),
    },
  ];
};
