"use client";

import React, { RefObject, useEffect, useMemo } from "react";
import Map, { MapRef, Marker } from "react-map-gl/maplibre";

import { Card, CardContent } from "@/components/ui/card";
import { Node } from "@/lib/schema/node";
import { useMapSearchParams } from "@/hooks/use-map-search-params";
import { cn } from "@/lib/utils";
import { getNodeIcon, MAPLIBRE_STYLE, NODE_COLORS } from "../utils";

type NodesMapProps = {
  filteredAndSortedNodes: Node[];
  selectedNode: Node | null;
  mapRef: RefObject<MapRef | null>;
  handleNodeClick: (node: Node) => void;
};

const NodesMap = ({
  filteredAndSortedNodes,
  selectedNode,
  mapRef,
  handleNodeClick,
}: NodesMapProps) => {
  const {
    searchParams: { latitude, longitude },
  } = useMapSearchParams();

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
    <div className="lg:col-span-2 relative">
      <Card className="game-card h-full">
        <CardContent className="p-0 h-full">
          <div
            className="w-full h-full rounded-lg overflow-hidden"
            style={{ minHeight: "500px" }}
          >
            <Map
              initialViewState={initialViewState}
              style={{ width: "100%", height: "100%" }}
              mapStyle={MAPLIBRE_STYLE}
              attributionControl={false}
              ref={mapRef}
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
                      "w-10 h-10 rounded-full border-2 border-white/80 cursor-pointer flex items-center justify-center text-lg transition-all duration-300 hover:scale-110",
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
            </Map>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NodesMap;
