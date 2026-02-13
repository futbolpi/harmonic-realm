"use client";

import { useRef } from "react";
import Map, { Source, Layer, Marker } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import { useTheme } from "next-themes";

import { UserMarker } from "@/app/(game)/_components/user-markers";
import { NodeMarker } from "@/app/(game)/_components/node-markers";
import { getRarityInfo, MAP_STYLES } from "@/app/(game)/map/utils";
import type { DriftNodeWithCost, UserLocation } from "@/lib/schema/drift";
import {
  generateVoidZoneCircle,
  generateDensityZones,
  generateDistanceRings,
} from "@/lib/drift/map-utils";

interface DriftMapViewProps {
  userLocation: UserLocation | null;
  nodesToRender: DriftNodeWithCost[];
  nodeCountWithin10km: number;
  onNodeClick: (node: DriftNodeWithCost) => void;
  onMoveEnd?: (viewport: {
    latitude: number;
    longitude: number;
    zoom: number;
  }) => void;
  initialViewport?: { latitude: number; longitude: number; zoom: number };
  showDistanceRings?: boolean;
}

export function DriftMapView({
  userLocation,
  nodesToRender,
  nodeCountWithin10km,
  onNodeClick,
  onMoveEnd,
  initialViewport = { latitude: 20, longitude: 0, zoom: 2 },
  showDistanceRings = true,
}: DriftMapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const { resolvedTheme } = useTheme();

  return (
    <Map
      ref={mapRef}
      attributionControl={false}
      initialViewState={initialViewport}
      onMoveEnd={(evt) => onMoveEnd?.(evt.viewState)}
      style={{ width: "100%", height: "100%" }}
      mapStyle={
        resolvedTheme === "light" ? MAP_STYLES.outdoor : MAP_STYLES.outdoorDark
      }
    >
      {/* Distance Rings (25km, 50km, 75km, 100km) */}
      {userLocation && showDistanceRings && (
        <Source
          id="distance-rings"
          type="geojson"
          data={generateDistanceRings(userLocation)}
        >
          <Layer
            id="distance-rings-layer"
            type="line"
            paint={{
              "line-color": "#8B5CF6",
              "line-width": 1,
              "line-opacity": ["get", "opacity"],
              "line-dasharray": [2, 2],
            }}
          />
        </Source>
      )}

      {/* Void Zone Circle (10km) */}
      {userLocation && (
        <Source
          id="void-zone"
          type="geojson"
          data={generateVoidZoneCircle(userLocation)}
        >
          {/* Fill */}
          <Layer
            id="void-zone-fill"
            type="fill"
            paint={{
              "fill-color": "#ef4444",
              "fill-opacity": 0.08,
            }}
          />
          {/* Border */}
          <Layer
            id="void-zone-border"
            type="line"
            paint={{
              "line-color": "#ef4444",
              "line-width": 2,
              "line-dasharray": [4, 4],
            }}
          />
        </Source>
      )}

      {/* Density Zone Indicators (v2.0) */}
      {userLocation && (
        <Source
          id="density-zones"
          type="geojson"
          data={generateDensityZones(userLocation, nodeCountWithin10km)}
        >
          <Layer
            id="density-zone-rings"
            type="line"
            paint={{
              "line-color": ["get", "color"],
              "line-width": 1.5,
              "line-opacity": 0.6,
            }}
          />
        </Source>
      )}

      {/* Eligible Nodes */}
      {nodesToRender.map((node) => {
        const rarityInfo = getRarityInfo(node.rarity);
        const isAffordable = node.canDrift;

        return (
          <Marker
            key={node.id}
            longitude={node.longitude}
            latitude={node.latitude}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onNodeClick(node);
            }}
          >
            <div
              className={`transition-all duration-200 ${
                isAffordable
                  ? "hover:scale-110 cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              <NodeMarker nodeColor={rarityInfo} />
              {isAffordable && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <div className="bg-background/90 backdrop-blur-sm border rounded-full px-2 py-0.5 text-[10px] font-medium shadow-lg">
                    {node.cost} SP
                  </div>
                </div>
              )}
            </div>
          </Marker>
        );
      })}

      {/* User Marker */}
      {userLocation && (
        <Marker longitude={userLocation.lng} latitude={userLocation.lat}>
          <UserMarker isCurrentUser={true} />
        </Marker>
      )}
    </Map>
  );
}

// Export the map ref type for external control
export type { MapRef };
