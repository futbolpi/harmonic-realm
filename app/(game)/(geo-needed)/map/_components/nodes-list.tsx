"use client";

import { useMemo } from "react";

import { useMapSearchParams } from "@/hooks/use-map-search-params";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Node } from "@/lib/schema/node";
import { ScrollArea } from "@/components/ui/scroll-area";
import { calculateDistance, getRarityInfo } from "../utils";

type NodesListProps = {
  filteredAndSortedNodes: Node[];
  selectedNode: Node | null;
  handleNodeClick: (node: Node) => void;
};

const NodesList = ({
  filteredAndSortedNodes,
  selectedNode,
  handleNodeClick,
}: NodesListProps) => {
  const {
    searchParams: { latitude, longitude },
  } = useMapSearchParams();

  const userLocation = useMemo(() => {
    return latitude !== null && longitude !== null
      ? { latitude, longitude }
      : null;
  }, [latitude, longitude]);

  return (
    <Card className="game-card">
      <CardHeader>
        <CardTitle className="text-lg">
          Filtered Nodes ({filteredAndSortedNodes.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="space-y-3 max-h-60 overflow-y-auto">
          {filteredAndSortedNodes.slice(0, 10).map((node) => (
            <div
              key={node.id}
              onClick={() => handleNodeClick(node)}
              className={cn(
                "p-3 rounded-lg border cursor-pointer transition-colors",
                "hover:bg-muted/20 hover:border-primary/50",
                selectedNode?.id === node.id && "bg-primary/10 border-primary"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{node.type.name}</span>
                <Badge
                  className={cn(
                    "text-white text-xs",
                    getRarityInfo(node.type.rarity).color
                  )}
                >
                  {node.type.rarity}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{node.type.baseYieldPerMinute}π/min</span>
                <span>{node.type.lockInMinutes}m lock-in</span>
                {userLocation && (
                  <span>
                    {calculateDistance(
                      userLocation.latitude,
                      userLocation.longitude,
                      node.latitude,
                      node.longitude
                    ).toFixed(1)}
                    km
                  </span>
                )}
              </div>
            </div>
          ))}
          {filteredAndSortedNodes.length > 10 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              And {filteredAndSortedNodes.length - 10} more nodes...
            </p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default NodesList;
