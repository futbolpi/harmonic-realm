"use client";

import { Clock, Star, Users, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Node } from "@/lib/schema/node";
import { cn } from "@/lib/utils";
import { useMiningLogic } from "@/hooks/queries/use-mining-logic";
import { MINING_RANGE_METERS } from "@/config/site";
import { getRarityInfo } from "../../../../map/utils";

type NodeInfoContentProps = { node: Node };

export const NodeInfoContent = ({ node }: NodeInfoContentProps) => {
  const { distance } = useMiningLogic({
    completedSessions: node.sessions.length,
    isOpenForMining: node.openForMining,
    maxSessions: node.type.maxMiners,
    nodeId: node.id,
    nodeLocation: { latitude: node.latitude, longitude: node.longitude },
    allowedDistanceMeters: MINING_RANGE_METERS,
  });

  const isInRange = distance !== null && distance <= MINING_RANGE_METERS;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">{node.name}</h3>
        <Badge
          className={cn("text-white", getRarityInfo(node.type.rarity).color)}
        >
          {node.type.rarity}
        </Badge>
      </div>

      {node.sponsor && (
        <Badge
          variant="outline"
          className="text-neon-green border-neon-green/50"
        >
          Sponsored by {node.sponsor}
        </Badge>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 rounded-lg bg-muted/20">
          <Zap className="h-5 w-5 text-neon-green mx-auto mb-1" />
          <div className="text-lg font-bold text-neon-green">
            {node.type.baseYieldPerMinute.toFixed(1)}π
          </div>
          <div className="text-xs text-muted-foreground">Per Minute</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/20">
          <Clock className="h-5 w-5 text-neon-orange mx-auto mb-1" />
          <div className="text-lg font-bold text-neon-orange">
            {node.type.lockInMinutes}
          </div>
          <div className="text-xs text-muted-foreground">Minutes</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/20">
          <Users className="h-5 w-5 text-neon-purple mx-auto mb-1" />
          <div className="text-lg font-bold text-neon-purple">
            {node.type.maxMiners}
          </div>
          <div className="text-xs text-muted-foreground">Max Miners</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/20">
          <Star className="h-5 w-5 text-primary mx-auto mb-1" />
          <div className="text-lg font-bold text-primary">
            {node.type.rarity}
          </div>
          <div className="text-xs text-muted-foreground">Rarity</div>
        </div>
      </div>

      <div className="space-y-2 p-3 rounded-lg bg-muted/10 border">
        <div className="flex items-center justify-between text-sm">
          <span>Distance:</span>
          <span className="font-medium">
            {distance ? `${Math.round(distance)}m` : "Unknown"}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>Required:</span>
          <span className="font-medium">{MINING_RANGE_METERS}m</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              isInRange ? "bg-green-500" : "bg-red-500"
            )}
          />
          <span
            className={cn(
              "text-xs font-medium",
              isInRange ? "text-green-600" : "text-red-600"
            )}
          >
            {isInRange ? "In Range" : "Too Far"}
          </span>
        </div>
      </div>
    </div>
  );
};
