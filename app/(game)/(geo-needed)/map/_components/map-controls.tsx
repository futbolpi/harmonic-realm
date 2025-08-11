"use client";

import { Filter, MapPin, SortAsc } from "lucide-react";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { $Enums } from "@/lib/generated/prisma";
import { useMapSearchParams } from "@/hooks/use-map-search-params";
import { Node } from "@/lib/schema/node";
import LocationButton from "./location-button";
import { SortBy, sortBy as sortByValues } from "../search-params";
import { getRarityInfo } from "../utils";
import LocationError from "./location-error";

type MapControlsProps = {
  nodes: Node[];
  noOfFilteredNodes: number;
};

const MapControls = ({ noOfFilteredNodes, nodes }: MapControlsProps) => {
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
    <Card className="game-card">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="font-medium">Mining Map</span>
            <Badge variant="outline" className="text-primary border-primary/50">
              {noOfFilteredNodes} of {nodes.length} Nodes
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Sort */}
            <Select
              value={sortBy}
              onValueChange={(value: SortBy) =>
                updateSearchParams({ sortBy: value })
              }
              disabled={isLoading}
            >
              <SelectTrigger className="w-32">
                <SortAsc className="h-4 w-4 mr-2" />
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

            {/* Location Button */}
            <LocationButton />
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          {/* Rarity Filter */}
          <Select
            value={rarityFilter ?? undefined}
            onValueChange={(value: $Enums.NodeTypeRarity | "all") =>
              updateSearchParams({
                rarityFilter: value === "all" ? null : value,
              })
            }
            disabled={isLoading}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Rarity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rarities</SelectItem>{" "}
              {/* Updated value prop */}
              {rarities.map((rarity) => (
                <SelectItem key={rarity} value={rarity}>
                  {rarity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Node Type Filter */}
          <Select
            value={nodeTypeFilter ?? undefined}
            onValueChange={(value: string) =>
              updateSearchParams({
                nodeTypeFilter: value === "all" ? null : value,
              })
            }
            disabled={isLoading}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Node Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>{" "}
              {/* Updated value prop */}
              {nodeTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Open Only Filter */}
        </div>

        <LocationError />
      </CardContent>
    </Card>
  );
};

export default MapControls;
