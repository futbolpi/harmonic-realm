"use client";

import { Zap, Clock, Users, Star, ExternalLink, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { calculateDistance, cn } from "@/lib/utils";
import { Node } from "@/lib/schema/node";
import { getRarityInfo } from "../utils";

interface NodePopupProps {
  node: Node;
  onViewDetails: () => void;
  onClose: () => void;
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
}

export function NodePopup({
  node,
  onViewDetails,
  onClose,
  userLocation,
}: NodePopupProps) {
  return (
    <div className="bg-background border rounded-lg shadow-lg p-4 min-w-[280px] max-w-[320px]">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm">{node.name}</h3>
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
              className="text-xs text-neon-green border-neon-green/50"
            >
              Sponsored by {node.sponsor}
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-2 rounded bg-muted/20">
          <Zap className="h-4 w-4 text-neon-green mx-auto mb-1" />
          <div className="text-sm font-bold text-neon-green">
            {node.type.baseYieldPerMinute.toFixed(1)}π/min
          </div>
          <div className="text-xs text-muted-foreground">Yield</div>
        </div>
        <div className="text-center p-2 rounded bg-muted/20">
          <Clock className="h-4 w-4 text-neon-orange mx-auto mb-1" />
          <div className="text-sm font-bold text-neon-orange">
            {node.type.lockInMinutes}m
          </div>
          <div className="text-xs text-muted-foreground">Lock-in</div>
        </div>
        <div className="text-center p-2 rounded bg-muted/20">
          <Users className="h-4 w-4 text-neon-purple mx-auto mb-1" />
          <div className="text-sm font-bold text-neon-purple">
            {node.type.maxMiners}
          </div>
          <div className="text-xs text-muted-foreground">Max Miners</div>
        </div>
        <div className="text-center p-2 rounded bg-muted/20">
          <Star className="h-4 w-4 text-primary mx-auto mb-1" />
          <div className="text-sm font-bold text-primary">
            {node.type.rarity}
          </div>
          <div className="text-xs text-muted-foreground">Rarity</div>
        </div>
      </div>

      {userLocation && (
        <div className="mb-4 p-2 rounded bg-muted/20">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Distance</span>
            <span className="font-medium">
              {calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                node.latitude,
                node.longitude
              ).toFixed(2)}{" "}
              km
            </span>
          </div>
        </div>
      )}

      <Button
        onClick={onViewDetails}
        className={cn(
          "w-full game-button",
          !node.openForMining && "opacity-50"
        )}
        disabled={!node.openForMining}
      >
        <ExternalLink className="mr-2 h-4 w-4" />
        {node.openForMining ? "View Details & Mine" : "View Details"}
      </Button>
    </div>
  );
}
