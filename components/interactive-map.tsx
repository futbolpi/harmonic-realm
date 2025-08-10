"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import mapboxgl from "mapbox-gl";
import {
  MapPin,
  Navigation,
  Zap,
  Clock,
  Users,
  Star,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  initializeMapbox,
  MAP_STYLES,
  getUserLocation,
  createNodeMarker,
  calculateDistance,
} from "@/lib/mapbox";

import { cn } from "@/lib/utils";
import { useAuth } from "./shared/auth/auth-context";
import { fetchNearbyNodes } from "@/lib/api-helpers/client/nodes";
import { Node } from "@/lib/schema/node";

// CSS for map animations
const mapStyles = `
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.6); }
    50% { box-shadow: 0 0 30px rgba(59, 130, 246, 1), 0 0 40px rgba(59, 130, 246, 0.8); }
  }
`;

export function InteractiveMap() {
  const { user } = useAuth();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [locationError, setLocationError] = useState<string>("");
  const [isLocating, setIsLocating] = useState(false);

  // Initialize Mapbox
  useEffect(() => {
    initializeMapbox();

    // Add CSS for animations
    const style = document.createElement("style");
    style.textContent = mapStyles;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Get user location
  const handleGetLocation = useCallback(async () => {
    setIsLocating(true);
    setLocationError("");

    try {
      const position = await getUserLocation();
      const coords: [number, number] = [
        position.coords.longitude,
        position.coords.latitude,
      ];
      setUserLocation([position.coords.longitude, position.coords.latitude]);

      if (map.current) {
        map.current.flyTo({
          center: coords,
          zoom: 14,
          duration: 1500,
        });
      }
    } catch (error) {
      setLocationError(
        error instanceof Error ? error.message : "Failed to get location"
      );
    } finally {
      setIsLocating(false);
    }
  }, []);

  // Fetch nearby nodes
  const { data: nodesData, isLoading: isLoadingNodes } = useQuery({
    queryKey: ["nearby-nodes", userLocation],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");
      const accessToken = `Bearer mock-token-${user.piId}`;
      return fetchNearbyNodes(
        accessToken,
        userLocation?.[1], // latitude
        userLocation?.[0] // longitude
      );
    },
    enabled: !!user && !!userLocation,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Create map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLES.dark,
      center: [-74.006, 40.7128], // Default to NYC
      zoom: 12,
      pitch: 45,
      bearing: 0,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add geolocate control
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    });
    map.current.addControl(geolocateControl, "top-right");

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Add nodes to map
  useEffect(() => {
    if (!map.current || !nodesData?.nodes) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll(".node-marker");
    existingMarkers.forEach((marker) => marker.remove());

    // Add node markers
    nodesData.nodes.forEach((node) => {
      const markerElement = createNodeMarker(node);

      markerElement.addEventListener("click", () => {
        setSelectedNode(node);
        map.current?.flyTo({
          center: [node.longitude, node.latitude],
          zoom: 16,
          duration: 1000,
        });
      });

      new mapboxgl.Marker(markerElement)
        .setLngLat([node.longitude, node.latitude])
        .addTo(map.current!);
    });
  }, [nodesData]);

  // Get rarity color and label
  const getRarityInfo = (rarity: number) => {
    const rarityMap = {
      1: {
        label: "Common",
        color: "bg-green-500",
        textColor: "text-green-400",
      },
      2: {
        label: "Uncommon",
        color: "bg-blue-500",
        textColor: "text-blue-400",
      },
      3: {
        label: "Rare",
        color: "bg-purple-500",
        textColor: "text-purple-400",
      },
      4: {
        label: "Epic",
        color: "bg-orange-500",
        textColor: "text-orange-400",
      },
      5: { label: "Legendary", color: "bg-red-500", textColor: "text-red-400" },
    };
    return rarityMap[rarity as keyof typeof rarityMap] || rarityMap[1];
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Map Controls */}
      <Card className="game-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="font-medium">Mining Map</span>
              {nodesData?.nodes && (
                <Badge
                  variant="outline"
                  className="text-primary border-primary/50"
                >
                  {nodesData.nodes.length} Nodes Nearby
                </Badge>
              )}
            </div>
            <Button
              onClick={handleGetLocation}
              disabled={isLocating}
              size="sm"
              className="game-button"
            >
              {isLocating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Navigation className="h-4 w-4 mr-2" />
              )}
              {isLocating ? "Locating..." : "My Location"}
            </Button>
          </div>

          {locationError && (
            <div className="mt-3 flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              {locationError}
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
                ref={mapContainer}
                className="w-full h-full rounded-lg overflow-hidden"
                style={{ minHeight: "500px" }}
              />

              {/* Loading overlay */}
              {isLoadingNodes && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
                  <div className="text-center space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Loading nodes...
                    </p>
                  </div>
                </div>
              )}
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
                    {getRarityInfo(selectedNode.type.rarity).label}
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
                      {selectedNode.type.rarity}
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
                          userLocation[1],
                          userLocation[0],
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
          {nodesData?.nodes && (
            <Card className="game-card">
              <CardHeader>
                <CardTitle className="text-lg">Nearby Nodes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {nodesData.nodes.map((node) => (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
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
                          size="sm"
                          className={cn(
                            "text-white",
                            getRarityInfo(node.type.rarity).color
                          )}
                        >
                          {getRarityInfo(node.type.rarity).label}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{node.type.baseYieldPerMinute}π/min</span>
                        <span>{node.type.lockInMinutes}m lock-in</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
