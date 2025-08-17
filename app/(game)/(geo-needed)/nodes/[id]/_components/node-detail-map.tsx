"use client";

import { useEffect, useRef, useState } from "react";
import Map, { Marker, Source, Layer, type MapRef } from "react-map-gl/maplibre";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import circle from "@turf/circle";
import { useTheme } from "next-themes";

import { Badge } from "@/components/ui/badge";
import { Node } from "@/lib/schema/node";
import { useMiningSession } from "@/hooks/queries/use-mining-session";
import { useLocation } from "@/hooks/use-location";
import { getRarityInfo, MAP_STYLES } from "../../../map/utils";
import FloatingControls from "./floating-controls";
import NodeInfoModal from "./node-info-modal";

interface NodeDetailMapProps {
  node: Node;
}

export function NodeDetailMap({ node }: NodeDetailMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { resolvedTheme } = useTheme();

  const { isInRange, rangeMeters } = useMiningSession({
    id: node.id,
    latitude: node.latitude,
    longitude: node.longitude,
    openForMining: node.openForMining,
    maxMiners: node.type.maxMiners,
    completedMiners: node.sessions.length,
  });

  const userLocation = useLocation();

  // Create circle for mining radius
  const miningRadius = rangeMeters;
  const radiusCircle = circle(
    [node.longitude, node.latitude],
    miningRadius / 1000,
    {
      units: "kilometers",
      steps: 64,
    }
  );

  useEffect(() => {
    if (mapLoaded && userLocation) {
      // Fit map to show both user and node
      const bounds = [
        [
          Math.min(userLocation.longitude, node.longitude),
          Math.min(userLocation.latitude, node.latitude),
        ],
        [
          Math.max(userLocation.longitude, node.longitude),
          Math.max(userLocation.latitude, node.latitude),
        ],
      ] as [[number, number], [number, number]];

      mapRef.current?.fitBounds(bounds, {
        padding: 100,
        maxZoom: 16,
        duration: 1000,
      });
    }
  }, [mapLoaded, userLocation, node]);

  return (
    <div className="relative h-screen w-full">
      <Map
        ref={mapRef}
        attributionControl={false}
        mapStyle={
          resolvedTheme === "light"
            ? MAP_STYLES.outdoor
            : MAP_STYLES.outdoorDark
        }
        initialViewState={{
          longitude: node.longitude,
          latitude: node.latitude,
          zoom: 15,
        }}
        style={{ width: "100%", height: "100%" }}
        onLoad={() => setMapLoaded(true)}
      >
        {/* Mining radius circle */}
        <Source id="mining-radius" type="geojson" data={radiusCircle}>
          <Layer
            id="mining-radius-fill"
            type="fill"
            paint={{
              "fill-color": isInRange ? "#22c55e" : "#ef4444",
              "fill-opacity": 0.1,
            }}
          />
          <Layer
            id="mining-radius-line"
            type="line"
            paint={{
              "line-color": isInRange ? "#22c55e" : "#ef4444",
              "line-width": 2,
              "line-opacity": 0.8,
            }}
          />
        </Source>

        {/* Node marker */}
        <Marker longitude={node.longitude} latitude={node.latitude}>
          <div className="relative">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-white text-lg shadow-lg",
                getRarityInfo(node.type.rarity).color
              )}
            >
              <MapPin className="h-5 w-5" />
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <Badge variant="secondary" className="text-xs">
                {node.type.name}
              </Badge>
            </div>
          </div>
        </Marker>

        {/* User location marker */}
        {userLocation && (
          <Marker
            longitude={userLocation.longitude}
            latitude={userLocation.latitude}
          >
            <div className="relative">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                <Badge variant="secondary" className="text-xs">
                  You
                </Badge>
              </div>
            </div>
          </Marker>
        )}
      </Map>

      {/* Floating controls */}
      <FloatingControls mapRef={mapRef} node={node} />

      {/* Floating node info - Mobile: Drawer, Desktop: Sheet */}
      <NodeInfoModal node={node} />

      {/* Status indicator */}
      <div className="absolute top-4 left-28">
        <Badge
          variant={isInRange ? "default" : "destructive"}
          className="shadow-lg"
        >
          {isInRange ? "In Range" : "Out of Range"}
        </Badge>
      </div>
    </div>
  );
}
