"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { MapRef } from "react-map-gl/maplibre";

import { cn } from "@/lib/utils";
import { type Node } from "@/lib/schema/node";
import { useMapSearchParams } from "@/hooks/use-map-search-params";
import { filterNodes, sortNodes } from "../utils";
import MapControls from "./map-controls";
import NodesMap from "./nodes-map";
import SelectedNode from "./selected-node";
import NodesList from "./nodes-list";

interface InteractiveMapProps {
  nodes: Node[];
  className?: string;
}

export function InteractiveMapGL({ nodes, className }: InteractiveMapProps) {
  const mapRef = useRef<MapRef>(null);

  // URL state management with nuqs
  const { searchParams } = useMapSearchParams();
  const {
    latitude,
    longitude,
    nodeTypeFilter,
    openOnlyFilter,
    rarityFilter,
    sortBy,
    sponsoredFilter,
  } = searchParams;

  // Selection and location state
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

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
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [node.longitude, node.latitude],
        zoom: 16,
        duration: 1000,
      });
    }
  }, []);

  return (
    <div className={cn("h-full flex flex-col space-y-4", className)}>
      {/* Map Controls */}
      <MapControls
        noOfFilteredNodes={filteredAndSortedNodes.length}
        nodes={nodes}
      />

      <div className="flex-1 grid lg:grid-cols-3 gap-4 h-full min-h-[600px]">
        {/* Map Container */}
        <NodesMap
          filteredAndSortedNodes={filteredAndSortedNodes}
          handleNodeClick={handleNodeClick}
          mapRef={mapRef}
          selectedNode={selectedNode}
        />

        {/* Node Details Sidebar */}
        <div className="space-y-4">
          <SelectedNode selectedNode={selectedNode} />

          {/* Nodes List */}
          <NodesList
            filteredAndSortedNodes={filteredAndSortedNodes}
            handleNodeClick={handleNodeClick}
            selectedNode={selectedNode}
          />
        </div>
      </div>
    </div>
  );
}
