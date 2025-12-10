"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { MapRef } from "react-map-gl/maplibre";
import { useRouter } from "next/navigation";
import { Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Node } from "@/lib/schema/node";
import { useMapSearchParams } from "@/hooks/use-map-search-params";
import { AwakeningPathwaysModal } from "@/components/shared/awakening-pathways-modal";
import { EPHEMERAL_SPARK_NODE } from "@/config/tutorial";
import VideoModal from "@/components/shared/video-modal";
import { videoLinks } from "@/config/site";
import { useProfile } from "@/hooks/queries/use-profile";
import { filterNodes, sortNodes } from "../utils";
import LocationButton from "./location-button";
import { MapControlModal } from "./map-control-modal";
import { NodesListModal } from "./nodes-list-modal";
import NodesMap from "./nodes-map";
import { MapHelpModal } from "./map-help-modal";

interface MobileMapViewProps {
  nodes: Node[];
}

export function MobileMapView({ nodes }: MobileMapViewProps) {
  const router = useRouter();
  const mapRef = useRef<MapRef>(null);
  const { data: userProfile } = useProfile();

  // Check if user has completed tutorial
  const hasCompletedTutorial = userProfile?.hasCompletedTutorial ?? false;

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

    return hasCompletedTutorial
      ? sortNodes(filtered, sortBy, userLocation)
      : [EPHEMERAL_SPARK_NODE];
  }, [
    nodes,
    rarityFilter,
    nodeTypeFilter,
    openOnlyFilter,
    sponsoredFilter,
    sortBy,
    userLocation,
    hasCompletedTutorial,
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
      if (nodeId === EPHEMERAL_SPARK_NODE.id) {
        router.push("/tutorial");
      } else {
        router.push(`/nodes/${nodeId}`);
      }
    },
    [router]
  );

  return (
    <div className="h-full w-full relative">
      <div id="map-canvas"></div>
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
        <div className="flex gap-2">
          {/* Location Button */}
          <LocationButton />

          {/* Awakening Modal */}
          <AwakeningPathwaysModal />

          {/* Map Help Button */}
          <MapHelpModal />

          {/* Map Video Button */}
          <VideoModal
            src={videoLinks.mapHelper.url}
            title={videoLinks.mapHelper.title}
            trigger={
              <Button
                size="sm"
                className="game-button cursor-pointer shadow-lg"
              >
                <Video className="h-4 w-4" />
              </Button>
            }
          />
        </div>

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

      {!hasCompletedTutorial && (
        <div className="absolute bottom-20 left-4 right-4 z-10">
          <div className="bg-card text-card-foreground p-3 rounded-lg shadow-lg text-center">
            <p className="text-xs opacity-90">
              The Lattice recognizes you. Tap the Spark to mine.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
