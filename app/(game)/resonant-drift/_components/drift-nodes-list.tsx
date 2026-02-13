"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, Filter, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DriftNodeWithCost } from "@/lib/schema/drift";
import { getRarityInfo } from "@/app/(game)/map/utils";
import type { NodeTypeRarity } from "@/lib/generated/prisma/enums";

interface DriftNodesListProps {
  nodes: DriftNodeWithCost[];
  onNodeClick: (node: DriftNodeWithCost) => void;
}

type SortField = "distance" | "cost" | "rarity";
type SortOrder = "asc" | "desc";

export function DriftNodesList({ nodes, onNodeClick }: DriftNodesListProps) {
  const [sortField, setSortField] = useState<SortField>("cost");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [rarityFilter, setRarityFilter] = useState<NodeTypeRarity | "all">(
    "all",
  );

  // Rarity order for sorting
  const rarityOrder = useMemo<Record<NodeTypeRarity, number>>(() => {
    return {
      Common: 1,
      Uncommon: 2,
      Rare: 3,
      Epic: 4,
      Legendary: 5,
    };
  }, []);

  // Filter and sort nodes
  const processedNodes = useMemo(() => {
    let filtered = nodes;

    // Apply rarity filter
    if (rarityFilter !== "all") {
      filtered = filtered.filter((node) => node.rarity === rarityFilter);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "distance":
          comparison = a.distance - b.distance;
          break;
        case "cost":
          comparison = a.cost - b.cost;
          break;
        case "rarity":
          comparison = rarityOrder[a.rarity] - rarityOrder[b.rarity];
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [nodes, sortField, sortOrder, rarityFilter, rarityOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const affordableCount = processedNodes.filter((n) => n.canDrift).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header with filters */}
      <div className="p-3 border-b space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Eligible Nodes</h3>
            <p className="text-xs text-muted-foreground">
              {processedNodes.length} nodes • {affordableCount} affordable
            </p>
          </div>

          {/* Rarity filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={rarityFilter}
              onValueChange={(value) =>
                setRarityFilter(value as NodeTypeRarity | "all")
              }
            >
              <SelectTrigger className="w-30 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rarities</SelectItem>
                <SelectItem value="Common">Common</SelectItem>
                <SelectItem value="Uncommon">Uncommon</SelectItem>
                <SelectItem value="Rare">Rare</SelectItem>
                <SelectItem value="Epic">Epic</SelectItem>
                <SelectItem value="Legendary">Legendary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-25">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => toggleSort("rarity")}
                >
                  Rarity
                  {sortField === "rarity" && (
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => toggleSort("distance")}
                >
                  Distance
                  {sortField === "distance" && (
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  )}
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => toggleSort("cost")}
                >
                  Cost
                  {sortField === "cost" && (
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  )}
                </Button>
              </TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedNodes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  No nodes match your filters
                </TableCell>
              </TableRow>
            ) : (
              processedNodes.map((node) => {
                const rarityInfo = getRarityInfo(node.rarity);
                const canAfford = node.canDrift;

                return (
                  <TableRow
                    key={node.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onNodeClick(node)}
                  >
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: `${rarityInfo.color}20`,
                          color: rarityInfo.color,
                          borderColor: rarityInfo.color,
                        }}
                        variant="outline"
                      >
                        {node.rarity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {node.distance.toFixed(1)} km
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          canAfford ? "font-semibold" : "text-muted-foreground"
                        }
                      >
                        {node.cost.toLocaleString()} SP
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={canAfford ? "default" : "ghost"}
                        disabled={!canAfford}
                        onClick={(e) => {
                          e.stopPropagation();
                          onNodeClick(node);
                        }}
                      >
                        <Zap className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
