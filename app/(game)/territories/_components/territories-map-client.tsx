"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { Source, Layer } from "react-map-gl/maplibre";
import type { MapRef, MapLayerMouseEvent } from "react-map-gl/maplibre";
import { useTheme } from "next-themes";
import { latLngToCell } from "h3-js";
import { h3SetToFeature } from "geojson2h3";
import bbox from "@turf/bbox";

import { useProfile } from "@/hooks/queries/use-profile";
import { useTerritorySearchParams } from "@/hooks/use-territory-search-params";
import type { TerritoryForMap } from "@/lib/api-helpers/server/guilds/territories-map";
import { MAP_STYLES } from "@/app/(game)/map/utils";
import { TERRITORY_H3_RES } from "@/config/guilds/constants";
import InfoModal from "./info-modal";
import { CoordinateControls } from "./coordinate-controls";
import ResetButton from "./reset-button";
import TerritoryModal from "./territory-modal";
import TerritoryMarker from "./territory-marker";

interface Props {
  initialTerritories: TerritoryForMap[];
}

export default function TerritoriesMapClient({ initialTerritories }: Props) {
  const mapRef = useRef<MapRef | null>(null);
  const { resolvedTheme } = useTheme();
  const { data: profile } = useProfile();

  // URL State Management
  const { searchParams, updateSearchParams } = useTerritorySearchParams();
  const currentHex = searchParams.hex;

  const [showModal, setShowModal] = useState(false);
  const userGuildId = profile?.guildMembership?.guildId;

  // ----------------------------------------------------------------------
  // 1. Data Processing
  // ----------------------------------------------------------------------

  const selectedTerritoryData = useMemo(() => {
    if (!currentHex) return null;
    return initialTerritories.find((t) => t.hexId === currentHex) || null;
  }, [currentHex, initialTerritories]);

  const mapGeoJSON = useMemo(() => {
    // Convert all known territories to features
    const features = initialTerritories.map((t) => {
      return h3SetToFeature([t.hexId], {
        hexId: t.hexId,
        guildId: t.guild?.id || null,
        nodeCount: t.nodeCount,
        status:
          (t.guild?.id || null) === userGuildId
            ? "own"
            : t.guild
            ? "enemy"
            : "empty",
        isSelected: t.hexId === currentHex,
      });
    });

    // If selected hex is new/empty (not in initial list), generate it specifically
    if (currentHex && !selectedTerritoryData) {
      try {
        const tempFeature = h3SetToFeature([currentHex], {
          hexId: currentHex,
          guildId: null,
          nodeCount: 0,
          status: "empty",
          isSelected: true,
        });
        features.push(tempFeature);
      } catch (e) {
        console.log(e);
        console.warn("Invalid Hex selected", currentHex);
      }
    }

    return {
      type: "FeatureCollection",
      features: features,
    } as GeoJSON.FeatureCollection;
  }, [initialTerritories, currentHex, selectedTerritoryData, userGuildId]);

  // ----------------------------------------------------------------------
  // 2. Dynamic Bounds Logic
  // ----------------------------------------------------------------------

  useEffect(() => {
    if (!mapRef.current) return;

    try {
      let bounds: [number, number, number, number] | null = null;
      let padding = 80;

      if (currentHex) {
        // CASE A: Single Hex Selected -> Zoom tightly to that hex
        // We generate a temp feature just to get its bounds easily
        const singleHexFeature = h3SetToFeature([currentHex], {});
        bounds = bbox(singleHexFeature) as [number, number, number, number];
        padding = 150; // More padding when zoomed in so modal doesn't cover it
      } else if (initialTerritories.length > 0) {
        // CASE B: No Hex Selected -> Fit all territories
        // We calculate bounds of the entire FeatureCollection
        bounds = bbox(mapGeoJSON) as [number, number, number, number];
        padding = 80;
      }

      // Apply the fitBounds if we found valid bounds
      if (
        bounds &&
        bounds.length === 4 &&
        bounds[0] !== Infinity &&
        bounds[0] !== -Infinity
      ) {
        mapRef.current.fitBounds(
          [
            [bounds[0], bounds[1]], // minLng, minLat
            [bounds[2], bounds[3]], // maxLng, maxLat
          ],
          {
            padding,
            duration: 1200, // Smooth fly animation
            essential: true,
          }
        );
      }
    } catch (e) {
      console.error("Error calculating map bounds:", e);
    }
  }, [currentHex, initialTerritories, mapGeoJSON]);

  // ----------------------------------------------------------------------
  // 3. Handlers
  // ----------------------------------------------------------------------

  const handleLocationSelect = useCallback(
    (lat: number, lng: number) => {
      const hex = latLngToCell(lat, lng, TERRITORY_H3_RES);
      updateSearchParams({ hex });
      setShowModal(true);
      // Note: We don't need manual flyTo here anymore, the useEffect above handles it
    },
    [updateSearchParams]
  );

  const handleClearSelection = useCallback(() => {
    // Setting hex to null/undefined removes it from URL
    // The useEffect will detect !currentHex and zoom out to all territories
    updateSearchParams({ hex: null });
    setShowModal(false);
  }, [updateSearchParams]);

  const handleMapClick = useCallback(
    (e: MapLayerMouseEvent) => {
      // If clicking on empty space (not a marker), select that location
      handleLocationSelect(e.lngLat.lat, e.lngLat.lng);
    },
    [handleLocationSelect]
  );

  // ----------------------------------------------------------------------
  // 4. Render
  // ----------------------------------------------------------------------

  return (
    <div className="w-full h-full relative group">
      <Map
        ref={mapRef}
        initialViewState={{ latitude: 0, longitude: 0, zoom: 1 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={
          resolvedTheme === "light"
            ? MAP_STYLES.outdoor
            : MAP_STYLES.outdoorDark
        }
        attributionControl={false}
        onClick={handleMapClick}
      >
        <Source id="territories" type="geojson" data={mapGeoJSON}>
          {/* Fill Layer */}
          <Layer
            id="territory-fill"
            type="fill"
            paint={{
              "fill-opacity": [
                "case",
                ["boolean", ["get", "isSelected"], false],
                0.6,
                0.3,
              ],
              "fill-color": [
                "match",
                ["get", "status"],
                "own",
                "rgba(16, 185, 129, 1)",
                "enemy",
                "rgba(239, 68, 68, 1)",
                "empty",
                "rgba(100, 116, 139, 1)",
                "rgba(100, 116, 139, 1)",
              ],
            }}
          />
          {/* Outline Layer */}
          <Layer
            id="territory-outline"
            type="line"
            paint={{
              "line-color": [
                "case",
                ["boolean", ["get", "isSelected"], false],
                "#ffffff",
                [
                  "match",
                  ["get", "status"],
                  "own",
                  "rgba(6, 95, 70, 0.5)",
                  "enemy",
                  "rgba(153, 27, 27, 0.5)",
                  "rgba(255,255,255,0.2)",
                ],
              ],
              "line-width": [
                "case",
                ["boolean", ["get", "isSelected"], false],
                3,
                1,
              ],
            }}
          />
        </Source>

        {/* Markers */}
        {initialTerritories.map((t) => (
          <TerritoryMarker
            t={{
              centerLat: t.centerLat,
              centerLon: t.centerLon,
              hexId: t.hexId,
              isSelected: t.hexId === currentHex,
              nodeCount: t.nodeCount,
              trafficScore: t.trafficScore,
              status:
                (t.guild?.id || null) === userGuildId
                  ? "own"
                  : t.guild
                  ? "enemy"
                  : "empty",
            }}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              updateSearchParams({ hex: t.hexId });
              setShowModal(true);
            }}
            key={`marker-${t.hexId}`}
          />
        ))}
      </Map>

      {/* --- UI OVERLAYS --- */}

      {/* Top Left: Coordinate Controls */}
      <div className="absolute top-4 left-4 z-40 bg-background/90 p-3 rounded-md shadow-md backdrop-blur-sm border border-border">
        <CoordinateControls onFlyTo={handleLocationSelect} />
      </div>

      {/* Top Right: Reset/Clear Button */}
      {currentHex && (
        <ResetButton handleClearSelection={handleClearSelection} />
      )}

      {/* Bottom Left: Info Modal & View Details */}
      <div className="absolute flex gap-2 bottom-6 left-6 z-40">
        <InfoModal
          territories={initialTerritories.slice(0, 12)}
          handleLocationSelect={handleLocationSelect}
        />
        <TerritoryModal
          currentHex={currentHex}
          handleClearSelection={handleClearSelection}
          selectedTerritoryData={selectedTerritoryData}
          setShowModal={setShowModal}
          showModal={showModal}
        />
      </div>
    </div>
  );
}
