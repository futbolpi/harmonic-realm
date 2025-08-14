"use client";

import { Filter, SortAsc } from "lucide-react";
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
import { getRarityInfo } from "../utils";
import { SortBy, sortBy as sortByValues } from "../search-params";
import LocationError from "./location-error";

interface MapControlsProps {
  nodes: Node[];
}

export function MapControls({ nodes }: MapControlsProps) {
  const { searchParams, updateSearchParams, isLoading } = useMapSearchParams();
  const { sortBy, rarityFilter, nodeTypeFilter } = searchParams;

  // Get unique node types and rarities for filters
  const nodeTypes = useMemo(
    () => [...new Set(nodes.map((node) => node.type.name))],
    [nodes]
  );
  const rarities = useMemo(
    () =>
      [...new Set(nodes.map((node) => node.type.rarity))].sort(
        (a, b) => getRarityInfo(a).rating - getRarityInfo(b).rating
      ),
    [nodes]
  );

  return (
    <div className="space-y-6">
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

      <LocationError />
    </div>
  );
}
