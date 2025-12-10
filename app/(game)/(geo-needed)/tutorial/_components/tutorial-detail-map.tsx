"use client";

import { useEffect, useRef, useState } from "react";
import Map, { Marker, Source, Layer, type MapRef } from "react-map-gl/maplibre";
import circle from "@turf/circle";
import { useTheme } from "next-themes";

import { Badge } from "@/components/ui/badge";
import { UserMarker } from "@/app/(game)/_components/user-markers";
import { useProfile } from "@/hooks/queries/use-profile";
import { NodeMarker } from "@/app/(game)/_components/node-markers";
import { MINING_RANGE_METERS } from "@/config/site";
import { useTutorial } from "@/hooks/use-tutorial";
import { getRarityInfo, MAP_STYLES } from "@/app/(game)/map/utils";

interface TutorialDetailMapProps {
  node: { name: string };
  userLocation: { latitude: number; longitude: number };
}

export function TutorialDetailMap({
  userLocation,
  node,
}: TutorialDetailMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { resolvedTheme } = useTheme();

  const { distance } = useTutorial();

  const isInRange = distance !== null && distance <= MINING_RANGE_METERS;

  const { data: userProfile } = useProfile();

  // Create circle for mining radius
  const miningRadius = MINING_RANGE_METERS;
  const radiusCircle = circle(
    [userLocation.longitude, userLocation.latitude],
    miningRadius / 1000,
    {
      units: "kilometers",
      steps: 64,
    }
  );

  useEffect(() => {
    if (mapLoaded) {
      // Fit map to show both user and node
      const bounds = [
        [
          Math.min(userLocation.longitude, userLocation.longitude),
          Math.min(userLocation.latitude, userLocation.latitude),
        ],
        [
          Math.max(userLocation.longitude, userLocation.longitude),
          Math.max(userLocation.latitude, userLocation.latitude),
        ],
      ] as [[number, number], [number, number]];

      mapRef.current?.fitBounds(bounds, {
        padding: 100,
        maxZoom: 16,
        duration: 1000,
      });
    }
  }, [mapLoaded, userLocation]);

  return (
    <div className="relative h-[calc(100vh-8rem)] md:h-screen w-full">
      <Map
        ref={mapRef}
        attributionControl={false}
        mapStyle={
          resolvedTheme === "light"
            ? MAP_STYLES.outdoor
            : MAP_STYLES.outdoorDark
        }
        initialViewState={{
          longitude: userLocation.longitude,
          latitude: userLocation.latitude,
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
        <Marker
          longitude={userLocation.longitude}
          latitude={userLocation.latitude}
        >
          <div className="relative">
            <NodeMarker nodeColor={getRarityInfo("Common")} isActive={true} />
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <Badge variant="secondary" className="text-xs">
                {node.name}
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
            <UserMarker isCurrentUser level={userProfile?.level} />
          </Marker>
        )}
      </Map>

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
