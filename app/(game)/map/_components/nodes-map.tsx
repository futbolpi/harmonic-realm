"use client";

import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
  memo,
  useCallback,
} from "react";
import Map, { MapRef, Marker, Popup, ViewStateChangeEvent } from "react-map-gl/maplibre";
import { useTheme } from "next-themes";
import useSupercluster from "use-supercluster";
import { BBox, GeoJsonProperties } from "geojson";
import type Supercluster from "supercluster";

import { useMapSearchParams } from "@/hooks/use-map-search-params";
import type { Node } from "@/lib/schema/node";
import { NodeMarker } from "@/app/(game)/_components/node-markers";
import { UserMarker } from "@/app/(game)/_components/user-markers";
import { useProfile } from "@/hooks/queries/use-profile";
import { cn } from "@/lib/utils";
import { getRarityInfo, MAP_STYLES } from "../utils";
import { NodePopup } from "./node-popup";

// ============================================================================
// Types
// ============================================================================

/**
 * Properties of a cluster feature, provided by supercluster.
 */
type ClusterProperties = GeoJsonProperties & {
  cluster: true;
  cluster_id: number;
  point_count: number;
};

type PointProperties = {
  node: Node;
  nodeColor: ReturnType<typeof getRarityInfo>;
};

// ============================================================================
// Props
// ============================================================================

type NodesMapProps = {
  filteredAndSortedNodes: Node[];
  selectedNode: Node | null;
  mapRef: RefObject<MapRef | null>;
  handleNodeClick: (node: Node) => void;
  setShowPopup: Dispatch<SetStateAction<boolean>>;
  showPopup: boolean;
  handleNodeDetails: (nodeId: string) => void;
};

// ============================================================================
// Memoized Marker Components
// ============================================================================

/**
 * A memoized component for rendering a single node marker.
 * Prevents re-renders unless its specific props change.
 */
const MemoizedNodeMarker = memo(
  ({
    node,
    handleNodeClick,
    isSelected,
    nodeColor
  }: {
    node: Node;
    handleNodeClick: (node: Node) => void;
    nodeColor: ReturnType<typeof getRarityInfo>
    isSelected: boolean;
  }) => (
    <Marker
      longitude={node.longitude}
      latitude={node.latitude}
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        handleNodeClick(node);
      }}
    >
      <NodeMarker
        nodeColor={nodeColor}
        className={cn(isSelected && "ring-4 ring-primary/50 scale-110")}
      />
    </Marker>
  )
);
MemoizedNodeMarker.displayName = "MemoizedNodeMarker";

/**
 * A memoized component for rendering a cluster of nodes.
 * Displays the number of points within the cluster.
 */
const MemoizedClusterMarker = memo(
  ({
    pointCount,
    longitude,
    latitude,
    onClusterClick,
  }: {
    pointCount: number;
    longitude: number;
    latitude: number;
    onClusterClick: () => void;
  }) => {
    // Dynamically size the cluster based on point count for visual distinction
    const size = 30 + Math.min(pointCount / 10, 30);

    return(
    <Marker longitude={longitude} latitude={latitude} onClick={onClusterClick}>
      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm cursor-pointer border-2 border-primary-foreground shadow-lg transition-transform hover:scale-110" style={{ width: `${size}px`, height: `${size}px` }}>
        {pointCount}
      </div>
    </Marker>
  )}
);
MemoizedClusterMarker.displayName = "MemoizedClusterMarker";


// ============================================================================
// Main Map Component
// ============================================================================

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
    searchParams: { latitude: urlLat, longitude: urlLng },
  } = useMapSearchParams();
  const { resolvedTheme } = useTheme();
  const { data: userProfile } = useProfile();

  /**
   * Pre-processes the nodes into a format required by `useSupercluster`.
   * This is memoized to avoid re-computation on every render.
   */
  const points= useMemo<Supercluster.PointFeature<PointProperties>[]>(
    () =>
      filteredAndSortedNodes.map((node) => ({
        type: "Feature",
        properties: {
          node, nodeColor: getRarityInfo(node.type.rarity),
          cluster: false,
        },
        geometry: {
          type: "Point",
          coordinates: [node.longitude, node.latitude],
        },
      })),
    [filteredAndSortedNodes]
  );

  /**
   * Memoized user location from URL search parameters.
   */
  const userLocation = useMemo(() => {
    return urlLat !== null && urlLng !== null
      ? { latitude: urlLat, longitude: urlLng }
      : null;
  }, [urlLat, urlLng]);

  const hasNodes = filteredAndSortedNodes.length > 0;

  /**
   * Sets the initial viewport of the map.
   */
  const initialViewState = useMemo(() => {
    return {
      latitude: hasNodes ? filteredAndSortedNodes[0].latitude : urlLat ?? 40.7128,
      longitude: hasNodes ? filteredAndSortedNodes[0].longitude : urlLng ?? -74.006,
      zoom: hasNodes ? 16 : 12,
    };
  }, [hasNodes, urlLat, urlLng, filteredAndSortedNodes]);


   /**
   * The current zoom level of the map.
   * @state
   */
  const [zoom, setZoom] = useState(initialViewState.zoom);
  
  /**
   * The current geographical bounds of the map's viewport.
   * Format: [west, south, east, north]
   * @state
   */
  const [bounds, setBounds] = useState<BBox | undefined>(undefined);

  /**
   * The core clustering hook.
   * It takes the points, zoom, and bounds and returns clusters.
   * This handles all the heavy lifting of clustering and culling.
   */
  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom: Math.floor(zoom),
    options: { radius: 75, maxZoom: 20 },
  });

  /**
   * Effect to fly to the initial location when the map is ready.
   */
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [initialViewState.longitude, initialViewState.latitude],
        zoom: initialViewState.zoom,
        duration: 1000,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialViewState.latitude, initialViewState.longitude, mapRef]);


  /**
   * A callback to update map bounds and zoom state when the map moves.
   * This is crucial for `useSupercluster` to recalculate clusters.
   */
  const handleMapMove = useCallback((e: ViewStateChangeEvent) => {
    setZoom(e.viewState.zoom);
    if (mapRef.current) {
      setBounds(mapRef.current.getMap().getBounds().toArray().flat() as BBox);
    }
  }, [mapRef]);
  
  /**
   * Zooms into a cluster when it's clicked.
   */
  const handleClusterClick = useCallback((id: number, longitude: number, latitude: number) => {
      const expansionZoom = Math.min(
          supercluster?.getClusterExpansionZoom(id) ?? 20,
          20
      );
      if (mapRef.current) {
          mapRef.current.flyTo({
              center: [longitude, latitude],
              zoom: expansionZoom,
              duration: 500,
          });
      } 
  }, [mapRef, supercluster]);


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
        onLoad={() => {
          // Ensure initial bounds are set on load
          const map = mapRef.current?.getMap();
          if (map) {
            const newBounds = map.getBounds();
            if (newBounds) {
              setBounds([
                newBounds.getWest(),
                newBounds.getSouth(),
                newBounds.getEast(),
                newBounds.getNorth(),
              ]);
              setZoom(map.getZoom());
            }
          }
        }}
        onMove={handleMapMove}
      >
        {/* Render Clusters and Markers */}
        {clusters.map((cluster) => {
          
          const [longitude, latitude] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count:pointCount } =
            cluster.properties as ClusterProperties;

          if (isCluster) {
            return (
              <MemoizedClusterMarker
                key={`cluster-${cluster.id}`}
                pointCount={pointCount}
                longitude={longitude}
                latitude={latitude}
                onClusterClick={() => handleClusterClick(cluster.id as number, longitude, latitude)}
              />
            );
          }
          
          const { node, nodeColor } = cluster.properties;
          return (
            <MemoizedNodeMarker
              key={`node-${node.id}`}
              node={node}
              nodeColor={nodeColor}
              handleNodeClick={handleNodeClick}
              isSelected={selectedNode?.id === node.id}
            />
          );
        })}

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
            anchor="bottom"
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
