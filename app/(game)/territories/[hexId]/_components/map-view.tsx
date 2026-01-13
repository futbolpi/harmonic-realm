"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import Map, { Source, Layer, Marker, type MapRef } from "react-map-gl/maplibre";
import useSupercluster from "use-supercluster";
import { useTheme } from "next-themes";
import { Zap } from "lucide-react";
import { h3ToFeature } from "geojson2h3";
import type { BBox, GeoJsonProperties } from "geojson";
import type Supercluster from "supercluster";

import { Badge } from "@/components/ui/badge";
import { getRarityInfo, MAP_STYLES } from "@/app/(game)/map/utils";
import { getHexBoundingBox } from "@/lib/guild/territories";
import type { NodeTypeRarity } from "@/lib/generated/prisma/enums";
import { NodeMarker } from "@/app/(game)/_components/node-markers";

interface Props {
  territory: {
    centerLat: number;
    centerLon: number;
    hexId: string;
    nodes: {
      longitude: number;
      latitude: number;
      id: string;
      name: string;
      type: {
        name: string;
        rarity: NodeTypeRarity;
      };
    }[];
  };
}

/**
 * Properties of a cluster feature, provided by supercluster.
 */
type ClusterProperties = GeoJsonProperties & {
  cluster: true;
  cluster_id: number;
  point_count: number;
};

type PointProperties = {
  node: {
    id: string;
    longitude: number;
    latitude: number;
    rarity: NodeTypeRarity;
  };
};

export default function TerritoryMapView({ territory }: Props) {
  const mapRef = useRef<MapRef | null>(null);
  const { resolvedTheme } = useTheme();

  const hexBounds = useMemo(
    () => h3ToFeature(territory.hexId),
    [territory.hexId]
  );

  // --- Clustering setup (useSupercluster) ---
  // Start with undefined, but we will force an update on Load
  const [bounds, setBounds] = useState<BBox | undefined>(undefined);
  const [zoom, setZoom] = useState<number>(11);

  const points = useMemo<Supercluster.PointFeature<PointProperties>[]>(() => {
    return territory.nodes.map((node) => ({
      type: "Feature",
      properties: {
        cluster: false, // Explicitly false for type safety
        nodeColor: getRarityInfo(node.type.rarity),
        node: {
          id: node.id,
          latitude: node.latitude,
          longitude: node.longitude,
          rarity: node.type.rarity,
        },
      },
      geometry: { type: "Point", coordinates: [node.longitude, node.latitude] },
    }));
  }, [territory.nodes]);

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom: Math.floor(zoom),
    options: { radius: 60, maxZoom: 20 },
  });

  // --- Map State Handlers ---

  // Helper: Reads current map state and updates React state
  const updateMapState = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map) {
      const b = map.getBounds();
      setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
      setZoom(map.getZoom());
    }
  }, []);

  // 1. Initial FlyTo & Bounds Setup
  useEffect(() => {
    if (mapRef.current) {
      const boundsArr = getHexBoundingBox(territory.hexId);
      const [minLon, minLat, maxLon, maxLat] = boundsArr;

      mapRef.current.fitBounds(
        [
          [minLon, minLat],
          [maxLon, maxLat],
        ],
        {
          padding: 20, // Reduced from 50 to zoom closer
          duration: 1000,
          maxZoom: 16, // Prevent zooming too close if hex is tiny
        }
      );

      // Manually set bounds here for the immediate render cycle
      setBounds([minLon, minLat, maxLon, maxLat]);
    }
  }, [territory.hexId]);

  // 2. On Load: Triggers markers to appear if they haven't already
  const handleMapLoad = useCallback(() => {
    updateMapState();
  }, [updateMapState]);

  // 3. Debounced Move Handler
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleMapMove = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      updateMapState();
    }, 100); // Reduced debounce for snappier feeling
  }, [updateMapState]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="relative w-full h-96 bg-muted/50">
      <Map
        ref={mapRef}
        initialViewState={{
          latitude: territory.centerLat,
          longitude: territory.centerLon,
          zoom: 11,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={
          resolvedTheme === "light"
            ? MAP_STYLES.outdoor
            : MAP_STYLES.outdoorDark
        }
        attributionControl={false}
        onMove={handleMapMove}
        onLoad={handleMapLoad} // FIX: Ensures markers mount on initial load
      >
        {/* Hex Boundary Layer */}
        {hexBounds && (
          <Source id="hex-boundary" type="geojson" data={hexBounds}>
            <Layer
              id="hex-fill"
              type="fill"
              paint={{
                "fill-color": "#10b981",
                "fill-opacity": 0.1,
              }}
            />
            <Layer
              id="hex-stroke"
              type="line"
              paint={{
                "line-color": "#059669",
                "line-width": 3,
                "line-opacity": 0.8,
              }}
            />
          </Source>
        )}

        {/* Clusters / Node markers */}
        {clusters.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count: pointCount } =
            cluster.properties as ClusterProperties;

          if (isCluster) {
            const size = Math.max(28, Math.min(60, 20 + pointCount));
            return (
              <Marker
                key={`cluster-${cluster.id}`}
                longitude={longitude}
                latitude={latitude}
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation(); // Stop click from hitting map background
                    const expansionZoom = Math.min(
                      supercluster?.getClusterExpansionZoom(
                        cluster.id as number
                      ) ?? 18,
                      18
                    );
                    if (mapRef.current) {
                      mapRef.current.flyTo({
                        center: [longitude, latitude],
                        zoom: expansionZoom,
                        duration: 400,
                      });
                    }
                  }}
                  className="flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg cursor-pointer border-2 border-primary-foreground transition-transform hover:scale-110"
                  style={{ width: size, height: size }}
                >
                  <span className="font-bold text-xs">{pointCount}</span>
                </div>
              </Marker>
            );
          }

          // Single node
          const { node } =
            cluster.properties as Supercluster.PointFeature<PointProperties>["properties"];
          return (
            <Marker
              key={`node-${node.id}`}
              longitude={node.longitude}
              latitude={node.latitude}
            >
              <NodeMarker nodeColor={getRarityInfo(node.rarity)} />
            </Marker>
          );
        })}
      </Map>

      {/* Map Info Overlay */}
      <div className="absolute bottom-4 left-4 z-10 max-w-xs">
        <Badge
          variant="outline"
          className="bg-background/95 backdrop-blur-sm border-border/50 gap-2"
        >
          <Zap className="w-3 h-3" />
          {territory.nodes.length} nodes
        </Badge>
      </div>
    </div>
  );
}
