"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Map, { Source, Layer, Marker } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import { Navigation } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { UserMarker } from "@/app/(game)/_components/user-markers";
import { NodeMarker } from "@/app/(game)/_components/node-markers";
import type {
  DriftNodeWithCost,
  DriftQueryResponse,
  UserLocation,
} from "@/lib/schema/drift";
import { calculateDistance } from "@/lib/utils";
import { getRarityInfo, MAP_STYLES } from "@/app/(game)/map/utils";
import { useDrift } from "@/hooks/use-drift";
import { VOID_ZONE_RADIUS_KM } from "@/config/drift";
import InfoModal from "./info-modal";
import NodeDetailModal from "./node-detail-modal";
import CostCalculatorModal from "./cost-calculator-modal";
import EligibleNodesModal from "./eligible-nodes-modal";
import EmptyState from "./empty-state";
import BottomPanel from "./bottom-panel";
import Header from "./header";

const INITIAL_ZOOM = 9.5;

interface ResonantDriftClientProps {
  initialNodes: DriftQueryResponse[];
}

export function ResonantDriftClient({
  initialNodes,
}: ResonantDriftClientProps) {
  const mapRef = useRef<MapRef>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [viewport, setViewport] = useState({
    latitude: 20,
    longitude: 0,
    zoom: 2,
  });
  const { resolvedTheme } = useTheme();

  // Integrate drift state management
  const { statusInfo, nodesToRender } = useDrift(initialNodes, userLocation);

  // Modal and UI state
  const [showNodesModal, setShowNodesModal] = useState(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [showNodeDetailModal, setShowNodeDetailModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState<DriftNodeWithCost | null>(
    null
  );

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        // Center map on user with 110km radius visibility
        setViewport({
          latitude,
          longitude,
          zoom: INITIAL_ZOOM,
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
        // Keep default viewport if geolocation fails
      }
    );
  }, []);

  // Generate 1km grid lines within 10km radius for binned drift zones
  const generateGridLines = useCallback(
    (center: UserLocation): GeoJSON.FeatureCollection => {
      const features: GeoJSON.Feature[] = [];
      const gridSpacingKm = 1;

      if (!center) return { type: "FeatureCollection", features: [] };

      // Create a rough grid within the void zone
      const latPerKm = 1 / 111; // Approximate degrees per km
      const lngPerKm = 1 / (111 * Math.cos((center.lat * Math.PI) / 180));

      for (
        let lat = center.lat - VOID_ZONE_RADIUS_KM * latPerKm;
        lat <= center.lat + VOID_ZONE_RADIUS_KM * latPerKm;
        lat += gridSpacingKm * latPerKm
      ) {
        features.push({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [
              [center.lng - VOID_ZONE_RADIUS_KM * lngPerKm, lat],
              [center.lng + VOID_ZONE_RADIUS_KM * lngPerKm, lat],
            ],
          },
          properties: {},
        });
      }

      for (
        let lng = center.lng - VOID_ZONE_RADIUS_KM * lngPerKm;
        lng <= center.lng + VOID_ZONE_RADIUS_KM * lngPerKm;
        lng += gridSpacingKm * lngPerKm
      ) {
        features.push({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [
              [lng, center.lat - VOID_ZONE_RADIUS_KM * latPerKm],
              [lng, center.lat + VOID_ZONE_RADIUS_KM * latPerKm],
            ],
          },
          properties: {},
        });
      }

      return { type: "FeatureCollection", features };
    },
    []
  );

  // Generate void zone circle GeoJSON
  const generateVoidZoneCircle = useCallback(
    (center: UserLocation): GeoJSON.FeatureCollection => {
      const radiusKm = VOID_ZONE_RADIUS_KM;
      const latPerKm = 1 / 111;
      const lngPerKm = 1 / (111 * Math.cos((center.lat * Math.PI) / 180));

      const points: [number, number][] = [];
      const steps = 64;

      for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * Math.PI * 2;
        const lat = center.lat + radiusKm * latPerKm * Math.sin(angle);
        const lng = center.lng + radiusKm * lngPerKm * Math.cos(angle);
        points.push([lng, lat]);
      }

      return {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [points],
            },
            properties: {},
          },
        ],
      };
    },
    []
  );

  // Handle "Find Me" button click
  const handleFindMe = useCallback(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        // Update viewport to center on user
        if (mapRef.current) {
          const mapElement = mapRef.current as {
            getMap: () => { flyTo: (options: object) => void };
          };
          if (mapElement?.getMap) {
            mapElement.getMap().flyTo({
              center: [longitude, latitude],
              zoom: INITIAL_ZOOM,
              duration: 1000,
            });
          }
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
      }
    );
  }, []);

  const ineligibleNodes = initialNodes
    .filter(
      (node) =>
        userLocation &&
        calculateDistance(
          userLocation.lat,
          userLocation.lng,
          node.latitude,
          node.longitude
        ) <= VOID_ZONE_RADIUS_KM
    )
    .slice(10);

  const onRowClick = (node: DriftNodeWithCost) => {
    setSelectedNode(node);
    setShowNodesModal(false);
    setShowNodeDetailModal(true);
    mapRef.current?.flyTo({
      center: [node.longitude, node.latitude],
      zoom: 14,
      duration: 1000,
    });
  };

  return (
    <div className="w-full h-full relative">
      <Map
        ref={mapRef}
        attributionControl={false}
        initialViewState={{
          latitude: viewport.latitude,
          longitude: viewport.longitude,
          zoom: viewport.zoom,
          bearing: 0,
          pitch: 0,
        }}
        onMove={(evt) => setViewport(evt.viewState)}
        style={{ width: "100%", height: "100%" }}
        mapStyle={
          resolvedTheme === "light"
            ? MAP_STYLES.outdoor
            : MAP_STYLES.outdoorDark
        }
      >
        {/* Void Zone Circle */}
        {userLocation && (
          <Source
            id="void-zone"
            type="geojson"
            data={generateVoidZoneCircle(userLocation)}
          >
            <Layer
              id="void-zone-fill"
              type="fill"
              paint={{
                "fill-color": "rgba(239, 68, 68, 0.16)",
                "fill-opacity": 0.16,
              }}
            />
            <Layer
              id="void-zone-border"
              type="line"
              paint={{
                "line-color": "rgb(239, 68, 68)",
                "line-width": 2,
                "line-dasharray": [5, 5],
              }}
            />
          </Source>
        )}

        {/* Binned Drift Zones (Grid Lines) */}
        {userLocation && (
          <Source
            id="drift-grid"
            type="geojson"
            data={generateGridLines(userLocation)}
          >
            <Layer
              id="drift-grid-lines"
              type="line"
              paint={{
                "line-color": "#8B5CF6",
                "line-width": 1.25,
                "line-opacity": 0.5,
              }}
              layout={{ "line-join": "round", "line-cap": "round" }}
            />
          </Source>
        )}

        {/* Eligible Nodes */}
        {nodesToRender.map((node) => {
          const rarityInfo = getRarityInfo(node.rarity);
          return (
            <Marker
              key={node.id}
              longitude={node.longitude}
              latitude={node.latitude}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                onRowClick(node);
              }}
            >
              <NodeMarker nodeColor={rarityInfo} />
            </Marker>
          );
        })}

        {/* Ineligible Nodes (Dimmed) */}
        {ineligibleNodes.map((node) => {
          const rarityInfo = getRarityInfo(node.rarity);
          return (
            <Marker
              key={`ineligible-${node.id}`}
              longitude={node.longitude}
              latitude={node.latitude}
            >
              <div style={{ opacity: 0.3, filter: "grayscale(1)" }}>
                <NodeMarker nodeColor={rarityInfo} />
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

      {/* Header */}
      <Header setShowInfoModal={setShowInfoModal} statusInfo={statusInfo} />

      {/* Find Me Button */}
      <Button
        onClick={handleFindMe}
        size="icon"
        className="absolute top-20 right-4 z-30 rounded-full shadow-lg"
        aria-label="Find My Location"
      >
        <Navigation className="h-4 w-4" />
      </Button>

      {/* Bottom Panels - Nodes and Calculator */}
      <BottomPanel
        noOfEligibleNodes={nodesToRender.length}
        setShowCalculatorModal={setShowCalculatorModal}
        setShowNodesModal={setShowNodesModal}
      />

      {/* Empty State */}
      {nodesToRender.length === 0 && userLocation && (
        <EmptyState setShowInfoModal={setShowInfoModal} />
      )}

      {/* Eligible Nodes Modal */}
      <EligibleNodesModal
        nodesToRender={nodesToRender}
        onRowClick={onRowClick}
        setShowNodesModal={setShowNodesModal}
        showNodesModal={showNodesModal}
      />

      {/* Cost Calculator Modal */}
      <CostCalculatorModal
        noOfNodesToRender={nodesToRender.length}
        setShowCalculatorModal={setShowCalculatorModal}
        showCalculatorModal={showCalculatorModal}
        userLocation={userLocation}
      />

      {/* Node Detail Modal */}
      <NodeDetailModal
        selectedNode={selectedNode}
        setShowNodeDetailModal={setShowNodeDetailModal}
        showNodeDetailModal={showNodeDetailModal}
        userLocation={userLocation}
      />

      {/* Info Modal */}
      <InfoModal
        setShowInfoModal={setShowInfoModal}
        showInfoModal={showInfoModal}
      />
    </div>
  );
}
