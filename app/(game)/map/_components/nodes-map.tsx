"use client";

import { Dispatch, RefObject, SetStateAction, useEffect, useMemo } from "react";
import Map, { MapRef, Marker, Popup } from "react-map-gl/maplibre";
import { useTheme } from "next-themes";

import { useMapSearchParams } from "@/hooks/use-map-search-params";
import { Node } from "@/lib/schema/node";
import { NodeMarker } from "@/app/(game)/_components/node-markers";
import { UserMarker } from "@/app/(game)/_components/user-markers";
import { useProfile } from "@/hooks/queries/use-profile";
import { cn } from "@/lib/utils";
import { getRarityInfo, MAP_STYLES } from "../utils";
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

  const { data: userProfile } = useProfile();

  const renderedNodes = useMemo(() => {
    return filteredAndSortedNodes.map((node) => ({
      ...node,
      nodeColor: getRarityInfo(node.type.rarity),
    }));
  }, [filteredAndSortedNodes]);

  const userLocation = useMemo(() => {
    return latitude !== null && longitude !== null
      ? { latitude, longitude }
      : null;
  }, [latitude, longitude]);

  const hasNodes = renderedNodes.length > 0;

  // Set initial viewport
  const initialViewState = useMemo(() => {
    return {
      latitude: hasNodes ? renderedNodes[0].latitude : latitude ?? 40.7128,
      longitude: hasNodes ? renderedNodes[0].longitude : longitude ?? -74.006,
      zoom: hasNodes ? 16 : 12,
    };
  }, [hasNodes, latitude, longitude, renderedNodes]);

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
        {renderedNodes.map((node) => (
          <Marker
            key={node.id}
            longitude={node.longitude}
            latitude={node.latitude}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleNodeClick(node);
            }}
          >
            <NodeMarker
              nodeColor={node.nodeColor}
              // isActive={
              //   node.openForMining && node.sessions.length < node.type.maxMiners
              // }
              // isDiscovered={true}
              className={cn(
                selectedNode?.id === node.id &&
                  "ring-4 ring-primary/50 scale-110"
              )}
            />
          </Marker>
        ))}

        {/* User Location Marker */}
        {userLocation && (
          <Marker
            longitude={userLocation.longitude}
            latitude={userLocation.latitude}
          >
            <UserMarker isCurrentUser level={userProfile?.level} />
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
