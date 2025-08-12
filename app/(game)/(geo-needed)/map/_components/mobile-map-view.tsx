"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { MapRef } from "react-map-gl/maplibre";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Node } from "@/lib/schema/node";
import { useMapSearchParams } from "@/hooks/use-map-search-params";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { filterNodes, sortNodes } from "../utils";
import LocationButton from "./location-button";
import NodesMap from "./nodes-map";
import { MapControlModal } from "./map-control-modal";
import { NodesListModal } from "./nodes-list-modal";
import useCurrentLocation from "../../_components/location-provider";

interface MobileMapViewProps {
  nodes: Node[];
}

export function MobileMapView({ nodes }: MobileMapViewProps) {
  const router = useRouter();
  const mapRef = useRef<MapRef>(null);

  // URL state management with nuqs
  const { searchParams } = useMapSearchParams();
  const {
    nodeTypeFilter,
    openOnlyFilter,
    rarityFilter,
    sortBy,
    sponsoredFilter,
    latitude,
    longitude,
  } = searchParams;

  // Selection and location state
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const {
    state: { error: locationError },
  } = useCurrentLocation();
  const [showPopup, setShowPopup] = useState(false);

  const userLocation = useMemo(() => {
    return latitude !== null && longitude !== null
      ? { latitude, longitude }
      : null;
  }, [latitude, longitude]);

  // Filter and sort nodes
  const filteredAndSortedNodes = useMemo(() => {
    const filtered = filterNodes(nodes, {
      rarity: rarityFilter,
      nodeType: nodeTypeFilter,
      openOnly: openOnlyFilter,
      sponsored: sponsoredFilter,
    });

    return sortNodes(filtered, sortBy, userLocation);
  }, [
    nodes,
    rarityFilter,
    nodeTypeFilter,
    openOnlyFilter,
    sponsoredFilter,
    sortBy,
    userLocation,
  ]);

  // Handle node selection
  const handleNodeClick = useCallback((node: Node) => {
    setSelectedNode(node);
    setShowPopup(true);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [node.longitude, node.latitude],
        zoom: 16,
        duration: 1000,
      });
    }
  }, []);

  const handleNodeDetails = useCallback(
    (nodeId: string) => {
      router.push(`/nodes/${nodeId}`);
    },
    [router]
  );

  return (
    <div className="h-full w-full relative">
      {/* Map - takes 90% of screen */}
      <NodesMap
        filteredAndSortedNodes={filteredAndSortedNodes}
        handleNodeClick={handleNodeClick}
        handleNodeDetails={handleNodeDetails}
        mapRef={mapRef}
        selectedNode={selectedNode}
        setShowPopup={setShowPopup}
        showPopup={showPopup}
      />

      {/* Mobile Controls - Floating Action Buttons */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
        {/* Location Button */}
        <LocationButton />

        {/* Node Count Badge */}
        <Badge
          variant="outline"
          className="bg-background/90 backdrop-blur-sm shadow-lg"
        >
          {filteredAndSortedNodes.length} Nodes
        </Badge>
      </div>

      {/* Bottom Controls - Mobile First */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex gap-2">
        {/* Map Controls Drawer - Mobile */}
        <div className="flex gap-2">
          <MapControlModal nodes={nodes} />
          <NodesListModal
            filteredAndSortedNodes={filteredAndSortedNodes}
            handleNodeClick={handleNodeClick}
            handleNodeDetails={handleNodeDetails}
            selectedNode={selectedNode}
            userLocation={userLocation}
          />
        </div>
      </div>

      {locationError && (
        <div className="absolute top-16 left-4 right-4 z-10">
          <Alert variant={"destructive"}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-sm">{locationError.message}</AlertTitle>
          </Alert>
        </div>
      )}
    </div>
  );
}
