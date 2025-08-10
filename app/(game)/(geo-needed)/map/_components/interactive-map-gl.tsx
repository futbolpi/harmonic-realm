"use client";

import { useState, useCallback, useMemo } from "react";
import Map, {
  Marker,
  NavigationControl,
  GeolocateControl,
  type ViewState,
} from "react-map-gl/maplibre";
import {
  MapPin,
  Zap,
  Clock,
  Users,
  Star,
  AlertCircle,
  Filter,
  SortAsc,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { type Node } from "@/lib/schema/node";
import { useMapSearchParams } from "@/hooks/use-map-search-params";
import {
  MAPLIBRE_STYLE,
  NODE_COLORS,
  calculateDistance,
  getNodeIcon,
  getRarityInfo,
  filterNodes,
  sortNodes,
} from "../utils";
import useCurrentLocation from "../../_components/location-provider";
import LocationButton from "./location-button";
import { SortBy, sortBy as sortByValues } from "../search-params";
import { $Enums } from "@/lib/generated/prisma";

interface InteractiveMapProps {
  nodes: Node[];
  className?: string;
}

export function InteractiveMapGL({ nodes, className }: InteractiveMapProps) {
  // URL state management with nuqs
  const { searchParams, updateSearchParams } = useMapSearchParams();
  const {
    latitude,
    longitude,
    nodeTypeFilter,
    openOnlyFilter,
    rarityFilter,
    sortBy,
    sponsoredFilter,
  } = searchParams;

  // Map state
  const [viewState, setViewState] = useState<ViewState>({
    longitude: longitude ?? -74.006,
    latitude: latitude ?? 40.7128,
    zoom: 12,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  // Selection and location state
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const {
    state: { error: locationError },
  } = useCurrentLocation();

  const userLocation = useMemo(() => {
    return latitude !== null && longitude !== null
      ? { latitude, longitude }
      : null;
  }, [latitude, longitude]);

  // Filter and sort nodes
  const filteredAndSortedNodes = useMemo(() => {
    const filtered = filterNodes(nodes, {
      rarity: rarityFilter,
      nodeType: nodeTypeFilter,
      openOnly: openOnlyFilter,
      sponsored: sponsoredFilter,
    });

    return sortNodes(filtered, sortBy, userLocation);
  }, [
    nodes,
    rarityFilter,
    nodeTypeFilter,
    openOnlyFilter,
    sponsoredFilter,
    sortBy,
    userLocation,
  ]);

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

  // Handle node selection
  const handleNodeClick = useCallback((node: Node) => {
    setSelectedNode(node);
    setViewState((prev) => ({
      ...prev,
      longitude: node.longitude,
      latitude: node.latitude,
      zoom: Math.max(prev.zoom, 16),
    }));
  }, []);

  return (
    <div className={cn("h-full flex flex-col space-y-4", className)}>
      {/* Map Controls */}
      <Card className="game-card">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="font-medium">Mining Map</span>
              <Badge
                variant="outline"
                className="text-primary border-primary/50"
              >
                {filteredAndSortedNodes.length} of {nodes.length} Nodes
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Sort */}
              <Select
                value={sortBy}
                onValueChange={(value: SortBy) =>
                  updateSearchParams({ sortBy: value })
                }
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
              <LocationButton setViewState={setViewState} />
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

          {locationError && (
            <div className="mt-3 flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              {locationError.message}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex-1 grid lg:grid-cols-3 gap-4 h-full min-h-[600px]">
        {/* Map Container */}
        <div className="lg:col-span-2 relative">
          <Card className="game-card h-full">
            <CardContent className="p-0 h-full">
              <div
                className="w-full h-full rounded-lg overflow-hidden"
                style={{ minHeight: "500px" }}
              >
                <Map
                  {...viewState}
                  onMove={(evt) => setViewState(evt.viewState)}
                  style={{ width: "100%", height: "100%" }}
                  mapStyle={MAPLIBRE_STYLE}
                  attributionControl={false}
                >
                  <NavigationControl position="top-right" />
                  <GeolocateControl
                    position="top-right"
                    trackUserLocation
                    onGeolocate={(e) => {
                      updateSearchParams({
                        latitude: e.coords.latitude,
                        longitude: e.coords.longitude,
                      });
                    }}
                  />

                  {/* Node Markers */}
                  {filteredAndSortedNodes.map((node) => (
                    <Marker
                      key={node.id}
                      longitude={node.longitude}
                      latitude={node.latitude}
                      onClick={(e) => {
                        e.originalEvent.stopPropagation();
                        handleNodeClick(node);
                      }}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full border-2 border-white/80 cursor-pointer flex items-center justify-center text-lg transition-all duration-300 hover:scale-110",
                          node.openForMining ? "animate-pulse" : "opacity-75",
                          selectedNode?.id === node.id &&
                            "ring-4 ring-primary/50 scale-110"
                        )}
                        style={{
                          backgroundColor:
                            NODE_COLORS[node.type.rarity] ||
                            NODE_COLORS["Common"],
                          boxShadow: `0 0 20px ${
                            NODE_COLORS[node.type.rarity] ||
                            NODE_COLORS["Common"]
                          }60`,
                        }}
                      >
                        {getNodeIcon(node)}
                      </div>
                    </Marker>
                  ))}

                  {/* User Location Marker */}
                  {userLocation && (
                    <Marker
                      longitude={userLocation.longitude}
                      latitude={userLocation.latitude}
                    >
                      <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white animate-pulse" />
                    </Marker>
                  )}
                </Map>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Node Details Sidebar */}
        <div className="space-y-4">
          {selectedNode ? (
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
                    <div className="text-xs text-muted-foreground">
                      Base Yield
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/20">
                    <Users className="h-5 w-5 text-neon-purple mx-auto mb-1" />
                    <div className="text-lg font-bold text-neon-purple">
                      {selectedNode.type.maxMiners}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Max Miners
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/20">
                    <Clock className="h-5 w-5 text-neon-orange mx-auto mb-1" />
                    <div className="text-lg font-bold text-neon-orange">
                      {selectedNode.type.lockInMinutes}m
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Lock-in Time
                    </div>
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
                      <span className="text-sm text-muted-foreground">
                        Distance
                      </span>
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
          ) : (
            <Card className="game-card">
              <CardContent className="p-8 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Select a Node</h3>
                <p className="text-sm text-muted-foreground">
                  Click on any node on the map to view details and start mining.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Nodes List */}
          <Card className="game-card">
            <CardHeader>
              <CardTitle className="text-lg">
                Filtered Nodes ({filteredAndSortedNodes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {filteredAndSortedNodes.slice(0, 10).map((node) => (
                  <div
                    key={node.id}
                    onClick={() => handleNodeClick(node)}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-colors",
                      "hover:bg-muted/20 hover:border-primary/50",
                      selectedNode?.id === node.id &&
                        "bg-primary/10 border-primary"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        {node.type.name}
                      </span>
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
