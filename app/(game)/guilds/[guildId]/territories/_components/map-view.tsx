"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { useTheme } from "next-themes";
import { h3ToFeature } from "geojson2h3";

import { MAP_STYLES } from "@/app/(game)/map/utils";

import "maplibre-gl/dist/maplibre-gl.css";
import {
  bboxToMapLibreBounds,
  calculateHexesBounds,
} from "@/lib/guild/territories";

interface TerritoriesMapViewProps {
  territories: { hexId: string; activeChallenge: boolean }[];
}

export default function TerritoriesMapView({
  territories,
}: TerritoriesMapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!mapContainer.current || territories.length === 0) return;

    // Calculate bounds from all territories
    const hexIds = territories.map((t) => t.hexId);
    const bounds = calculateHexesBounds(hexIds);

    // Set default center to first territory or use bounds
    const defaultCenter = bounds
      ? bboxToMapLibreBounds(bounds)[0]
      : ([-74.5, 40] as [number, number]);

    const defaultZoom = territories.length > 0 ? 12 : 9;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style:
        resolvedTheme === "light" ? MAP_STYLES.outdoor : MAP_STYLES.outdoorDark,
      center: defaultCenter,
      zoom: defaultZoom,
      attributionControl: false,
    });

    map.current.on("load", () => {
      if (!map.current) return;

      // Add territory hexes
      territories.forEach((territory) => {
        const geoJson = h3ToFeature(territory.hexId);

        const sourceId = `territory-${territory.hexId}`;
        map.current?.addSource(sourceId, {
          type: "geojson",
          data: geoJson,
        });

        map.current?.addLayer({
          id: `territory-fill-${territory.hexId}`,
          type: "fill",
          source: sourceId,
          paint: {
            "fill-color": territory.activeChallenge ? "#ef4444" : "#22c55e",
            "fill-opacity": 0.3,
          },
        });

        map.current?.addLayer({
          id: `territory-line-${territory.hexId}`,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": territory.activeChallenge ? "#dc2626" : "#16a34a",
            "line-width": 2,
          },
        });
      });

      if (bounds) {
        const mapBounds = bboxToMapLibreBounds(bounds);
        map.current?.fitBounds(mapBounds, {
          padding: 50,
          duration: 1000,
        });
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [territories, resolvedTheme]);

  return (
    <div
      ref={mapContainer}
      className="relative h-96 rounded-lg border border-border overflow-hidden"
    />
  );
}
