"use client";

import { Zap, Clock, Users, MapPin, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { calculateDistance, cn } from "@/lib/utils";
import { Node } from "@/lib/schema/node";
import { getRarityInfo } from "../utils";

interface NodesListProps {
  nodes: Node[];
  selectedNode: Node | null;
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
  onNodeClick: (node: Node) => void;
  onNodeDetails: (nodeId: string) => void;
}

export function NodesList({
  nodes,
  selectedNode,
  userLocation,
  onNodeClick,
  onNodeDetails,
}: NodesListProps) {
  if (nodes.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          No nodes found with current filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {nodes.slice(0, 20).map((node) => (
        <Card
          key={node.id}
          className={cn(
            "cursor-pointer transition-all duration-200 hover:shadow-md",
            selectedNode?.id === node.id && "ring-2 ring-primary",
            !node.openForMining && "opacity-75"
          )}
          onClick={() => onNodeClick(node)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-sm">{node.name}</h3>
                  <Badge
                    className={cn(
                      "text-white text-xs",
                      getRarityInfo(node.type.rarity).color
                    )}
                  >
                    {node.type.rarity}
                  </Badge>
                </div>
                {node.sponsor && (
                  <Badge
                    variant="outline"
                    className="text-xs text-neon-green border-neon-green/50 mb-2"
                  >
                    {node.sponsor}
                  </Badge>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onNodeDetails(node.id);
                }}
                className="h-8 w-8 p-0"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-neon-green" />
                <span>{node.type.baseYieldPerMinute.toFixed(1)}π/min</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-neon-orange" />
                <span>{node.type.lockInMinutes}m</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-neon-purple" />
                <span>{node.type.maxMiners}</span>
              </div>
            </div>

            {userLocation && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Distance</span>
                  <span>
                    {calculateDistance(
                      userLocation.latitude,
                      userLocation.longitude,
                      node.latitude,
                      node.longitude
                    ).toFixed(1)}{" "}
                    km
                  </span>
                </div>
              </div>
            )}

            {!node.openForMining && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <Badge variant="secondary" className="text-xs">
                  Currently Inactive
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {nodes.length > 20 && (
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            Showing first 20 of {nodes.length} nodes
          </p>
        </div>
      )}
    </div>
  );
}
