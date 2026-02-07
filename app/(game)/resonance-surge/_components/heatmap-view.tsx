"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import Map, {
  Source,
  Layer,
  Marker,
  NavigationControl,
  type MapRef,
} from "react-map-gl/maplibre";
import { Navigation } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getRarityInfo, MAP_STYLES } from "@/app/(game)/map/utils";
import { getUserLocation } from "@/lib/utils/location";
import { getH3Boundary } from "@/lib/utils/resonance-surge/h3-utils";
import { NodeDetailModal } from "./node-detail-modal";
import type { SurgeNode } from "../services";
import { NodeMarker } from "../../_components/node-markers";

interface HeatmapViewProps {
  surges: SurgeNode[];
}

export function HeatmapView({ surges }: HeatmapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const { resolvedTheme } = useTheme();
  const [selectedSurge, setSelectedSurge] = useState<SurgeNode | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Fly to first surge on mount
  useEffect(() => {
    if (surges.length > 0 && mapRef.current) {
      const firstSurge = surges[0];
      mapRef.current.flyTo({
        center: [firstSurge.node.longitude, firstSurge.node.latitude],
        zoom: 11,
        duration: 2000,
      });
    }
  }, [surges]);

  const maxScore = Math.max(...surges.map((s) => s.activityScore), 1);

  const heatmapColors = useMemo(() => {
    return resolvedTheme === "light"
      ? {
          low: "#FEF3C7",
          mid1: "#FCD34D",
          mid2: "#F59E0B",
          high: "#DC2626",
          border: "#E5E7EB",
        }
      : {
          low: "#422006", // Dark yellow
          mid1: "#854D0E", // Dark orange
          mid2: "#C2410C", // Darker orange
          high: "#DC2626", // Red
          border: "#374151", // Dark gray
        };
  }, [resolvedTheme]);

  // Build hex GeoJSON
  const hexGeoJSON = useMemo(() => {
    return {
      type: "FeatureCollection" as const,
      features: Array.from(new Set(surges.map((s) => s.h3Index))).map(
        (h3Index) => {
          const hexSurges = surges.filter((s) => s.h3Index === h3Index);
          const boundary = getH3Boundary(h3Index);
          const totalScore = hexSurges[0]?.activityScore || 0;

          return {
            type: "Feature" as const,
            geometry: {
              type: "Polygon" as const,
              coordinates: [boundary],
            },
            properties: {
              h3Index,
              activityScore: totalScore,
              nodeCount: hexSurges.length,
            },
          };
        },
      ),
    };
  }, [surges]);

  const handleNodeClick = (surge: SurgeNode) => {
    setSelectedSurge(surge);
    setModalOpen(true);
    mapRef.current?.flyTo({
      center: [surge.node.longitude, surge.node.latitude],
      zoom: 14,
      duration: 1000,
    });
  };

  const handleLocateUser = async () => {
    setIsLocating(true);
    try {
      const position = await getUserLocation();
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setUserLocation(location);

      mapRef.current?.flyTo({
        center: [location.longitude, location.latitude],
        zoom: 12,
        duration: 1500,
      });

      toast.success("Location detected");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to get location",
      );
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-0 h-[600px] relative">
          <Map
            ref={mapRef}
            initialViewState={{
              latitude: 20,
              longitude: 0,
              zoom: 2,
            }}
            mapStyle={
              resolvedTheme === "light"
                ? MAP_STYLES.outdoor
                : MAP_STYLES.outdoorDark
            }
            attributionControl={false}
            interactiveLayerIds={["surge-hex-fill"]}
          >
            <NavigationControl position="top-right" />

            {/* User location button */}
            <div className="absolute top-4 left-4 z-10">
              <Button
                onClick={handleLocateUser}
                disabled={isLocating}
                size="sm"
                variant="secondary"
                className="shadow-lg"
              >
                <Navigation className="h-4 w-4" />
              </Button>
            </div>

            {/* Hex heatmap */}
            <Source id="surge-hexes" type="geojson" data={hexGeoJSON}>
              <Layer
                id="surge-hex-fill"
                type="fill"
                paint={{
                  "fill-color": [
                    "interpolate",
                    ["linear"],
                    ["get", "activityScore"],
                    0,
                    heatmapColors.low,
                    maxScore * 0.3,
                    heatmapColors.mid1,
                    maxScore * 0.6,
                    heatmapColors.mid2,
                    maxScore,
                    heatmapColors.high,
                  ],
                  "fill-opacity": 0.5,
                }}
              />
              <Layer
                id="surge-hex-outline"
                type="line"
                paint={{
                  "line-color": heatmapColors.border,
                  "line-width": 1.5,
                  "line-opacity": 0.6,
                }}
              />
            </Source>

            {/* Node markers */}
            {surges.map((surge) => (
              <Marker
                key={surge.id}
                latitude={surge.node.latitude}
                longitude={surge.node.longitude}
                onClick={() => handleNodeClick(surge)}
              >
                <div className="relative cursor-pointer hover:scale-110 transition-transform">
                  {/* Level indicator */}

                  <div className="absolute -top-1 -right-1 z-16 bg-slate-800 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center border border-white/30">
                    {surge.isStabilized ? "⚖️" : "☢️"}
                  </div>

                  <NodeMarker
                    nodeColor={getRarityInfo(surge.node.type.rarity)}
                  />
                </div>
              </Marker>
            ))}

            {/* User location marker */}
            {userLocation && (
              <Marker
                latitude={userLocation.latitude}
                longitude={userLocation.longitude}
              >
                <div className="h-4 w-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
              </Marker>
            )}
          </Map>
        </CardContent>
      </Card>

      {/* Node detail modal */}
      <NodeDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        surge={selectedSurge}
      />
    </>
  );
}
