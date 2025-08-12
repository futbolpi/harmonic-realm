"use client";

import { Dispatch, RefObject, SetStateAction, useEffect, useMemo } from "react";
import Map, { MapRef, Marker, Popup } from "react-map-gl/maplibre";
import { useTheme } from "next-themes";

import { useMapSearchParams } from "@/hooks/use-map-search-params";
import { Node } from "@/lib/schema/node";
import { cn } from "@/lib/utils";
import { getNodeIcon, MAP_STYLES, NODE_COLORS } from "../utils";
import { NodePopup } from "./node-popup";

type NodesMapProps = {
  filteredAndSortedNodes: Node[];
  selectedNode: Node | null;
  mapRef: RefObject<MapRef | null>;
  handleNodeClick: (node: Node) => void;
  setShowPopup: Dispatch<SetStateAction<boolean>>;
  showPopup: boolean;
  handleNodeDetails: (nodeId: string) => void;
};

const NodesMap = ({
  filteredAndSortedNodes,
  handleNodeClick,
  mapRef,
  selectedNode,
  setShowPopup,
  showPopup,
  handleNodeDetails,
}: NodesMapProps) => {
  const {
    searchParams: { latitude, longitude },
  } = useMapSearchParams();
  const { resolvedTheme } = useTheme();

  const userLocation = useMemo(() => {
    return latitude !== null && longitude !== null
      ? { latitude, longitude }
      : null;
  }, [latitude, longitude]);

  const hasNodes = filteredAndSortedNodes.length > 0;

  // Set initial viewport
  const initialViewState = useMemo(() => {
    return {
      latitude: hasNodes
        ? filteredAndSortedNodes[0].latitude
        : latitude ?? 40.7128,
      longitude: hasNodes
        ? filteredAndSortedNodes[0].longitude
        : longitude ?? -74.006,
      zoom: hasNodes ? 16 : 12,
    };
  }, [hasNodes, latitude, longitude, filteredAndSortedNodes]);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [initialViewState.longitude, initialViewState.latitude],
        zoom: 16,
        duration: 1000,
      });
    }
  }, [initialViewState.latitude, initialViewState.longitude, mapRef]);

  return (
    <div className="absolute inset-0">
      <Map
        initialViewState={initialViewState}
        style={{ width: "100%", height: "100%" }}
        mapStyle={
          resolvedTheme === "light"
            ? MAP_STYLES.outdoor
            : MAP_STYLES.outdoorDark
        }
        attributionControl={false}
        ref={mapRef}
        onClick={() => setShowPopup(false)}
      >
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
                "w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white/80 cursor-pointer flex items-center justify-center text-sm md:text-lg transition-all duration-300 hover:scale-110",
                node.openForMining ? "animate-pulse" : "opacity-75",
                selectedNode?.id === node.id &&
                  "ring-4 ring-primary/50 scale-110"
              )}
              style={{
                backgroundColor:
                  NODE_COLORS[node.type.rarity] || NODE_COLORS["Common"],
                boxShadow: `0 0 20px ${
                  NODE_COLORS[node.type.rarity] || NODE_COLORS["Common"]
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

        {/* Node Popup */}
        {selectedNode && showPopup && (
          <Popup
            longitude={selectedNode.longitude}
            latitude={selectedNode.latitude}
            onClose={() => setShowPopup(false)}
            closeButton={false}
          >
            <NodePopup
              node={selectedNode}
              userLocation={userLocation}
              onViewDetails={() => handleNodeDetails(selectedNode.id)}
              onClose={() => setShowPopup(false)}
            />
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default NodesMap;
