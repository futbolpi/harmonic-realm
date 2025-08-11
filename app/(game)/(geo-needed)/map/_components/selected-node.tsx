"use client";

import { Clock, MapPin, Star, Users, Zap } from "lucide-react";
import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Node } from "@/lib/schema/node";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMapSearchParams } from "@/hooks/use-map-search-params";
import { calculateDistance, getRarityInfo } from "../utils";

type SelectedNodeProps = { selectedNode: Node | null };

const SelectedNode = ({ selectedNode }: SelectedNodeProps) => {
  const {
    searchParams: { latitude, longitude },
  } = useMapSearchParams();

  const userLocation = useMemo(() => {
    return latitude !== null && longitude !== null
      ? { latitude, longitude }
      : null;
  }, [latitude, longitude]);

  if (!selectedNode) {
    return (
      <Card className="game-card">
        <CardContent className="p-8 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">Select a Node</h3>
          <p className="text-sm text-muted-foreground">
            Click on any node on the map to view details and start mining.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="game-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            {selectedNode.type.name}
          </CardTitle>
          <Badge
            className={cn(
              "text-white",
              getRarityInfo(selectedNode.type.rarity).color
            )}
          >
            {selectedNode.type.rarity}
          </Badge>
        </div>
        {selectedNode.sponsor && (
          <Badge
            variant="outline"
            className="w-fit text-neon-green border-neon-green/50"
          >
            Sponsored by {selectedNode.sponsor}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Node Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/20">
            <Zap className="h-5 w-5 text-neon-green mx-auto mb-1" />
            <div className="text-lg font-bold text-neon-green">
              {selectedNode.type.baseYieldPerMinute}π/min
            </div>
            <div className="text-xs text-muted-foreground">Base Yield</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/20">
            <Users className="h-5 w-5 text-neon-purple mx-auto mb-1" />
            <div className="text-lg font-bold text-neon-purple">
              {selectedNode.type.maxMiners}
            </div>
            <div className="text-xs text-muted-foreground">Max Miners</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/20">
            <Clock className="h-5 w-5 text-neon-orange mx-auto mb-1" />
            <div className="text-lg font-bold text-neon-orange">
              {selectedNode.type.lockInMinutes}m
            </div>
            <div className="text-xs text-muted-foreground">Lock-in Time</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/20">
            <Star className="h-5 w-5 text-primary mx-auto mb-1" />
            <div className="text-lg font-bold text-primary">
              {getRarityInfo(selectedNode.type.rarity).rating}
            </div>
            <div className="text-xs text-muted-foreground">Rarity</div>
          </div>
        </div>

        {/* Distance */}
        {userLocation && (
          <div className="p-3 rounded-lg bg-muted/20">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Distance</span>
              <span className="font-medium">
                {calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  selectedNode.latitude,
                  selectedNode.longitude
                ).toFixed(2)}{" "}
                km
              </span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          className={cn(
            "w-full game-button",
            !selectedNode.openForMining && "opacity-50"
          )}
          disabled={!selectedNode.openForMining}
        >
          {selectedNode.openForMining ? (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Start Mining
            </>
          ) : (
            <>
              <Clock className="mr-2 h-4 w-4" />
              Node Inactive
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SelectedNode;
