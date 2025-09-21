"use client";

import { Filter, Navigation, SortAsc } from "lucide-react";
import { useMemo } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Node } from "@/lib/schema/node";
import { useMapSearchParams } from "@/hooks/use-map-search-params";
import { NodeTypeRarity } from "@/lib/generated/prisma/enums";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { SortBy, sortBy as sortByValues } from "../search-params";

interface MapControlsProps {
  nodes: Node[];
}

export function MapControls({ nodes }: MapControlsProps) {
  const { searchParams, updateSearchParams, isLoading } = useMapSearchParams();
  const { sortBy, rarityFilter, nodeTypeFilter, latitude, longitude } =
    searchParams;

  // no user location no sort by distance
  const noLocation = latitude === null || longitude === null;

  // Get unique node types and rarities for filters
  const nodeTypes = useMemo(
    () => [...new Set(nodes.map((node) => node.type.name))],
    [nodes]
  );

  const rarities: NodeTypeRarity[] = [
    "Common",
    "Uncommon",
    "Rare",
    "Epic",
    "Legendary",
  ];

  return (
    <div className="space-y-6">
      {noLocation && (
        <Alert>
          <Navigation />
          <AlertTitle>
            Use the Navigation Beacon to reveal your current position within the
            Lattice.
          </AlertTitle>
        </Alert>
      )}

      {/* Sort Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <SortAsc className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Sort By</span>
        </div>
        <Select
          value={sortBy}
          onValueChange={(value: SortBy) =>
            updateSearchParams({ sortBy: value })
          }
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortByValues.map((value) => (
              <SelectItem
                key={`sort-by-${value}`}
                value={value}
                className="capitalize"
                disabled={noLocation && value === "distance"}
              >
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Filters Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters</span>
        </div>

        {/* Rarity Filter */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Rarity</Label>
          <Select
            value={rarityFilter ?? undefined}
            onValueChange={(value: NodeTypeRarity | "all") =>
              updateSearchParams({
                rarityFilter: value === "all" ? null : value,
              })
            }
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Rarities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rarities</SelectItem>
              {rarities.map((rarity) => (
                <SelectItem key={rarity} value={rarity}>
                  {rarity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Node Type Filter */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Node Type</Label>
          <Select
            value={nodeTypeFilter ?? undefined}
            onValueChange={(value: string) =>
              updateSearchParams({
                nodeTypeFilter: value === "all" ? null : value,
              })
            }
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {nodeTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
