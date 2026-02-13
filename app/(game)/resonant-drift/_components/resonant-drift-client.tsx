"use client";

import { useEffect, useState, useCallback } from "react";
import { Navigation, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type {
  DriftNodeWithCost,
  DriftQueryResponse,
  UserLocation,
} from "@/lib/schema/drift";
import { useDrift } from "@/hooks/use-drift";
import { useProfile } from "@/hooks/queries/use-profile";
import { DriftStatus } from "@/lib/schema/drift";
import { getUserLocation } from "@/lib/utils/location";
import { DriftMapView } from "./drift-map-view";
import { DriftStatusBanner } from "./drift-status-banner";
import { DriftNodeDetailModal } from "./drift-node-detail-modal.tsx";
import InfoModal from "./info-modal";
import CostCalculatorModal from "./cost-calculator-modal";
import EmptyState from "./empty-state";
import NodesListModal from "./nodes-list-modal";

// ============================================================================
// RESONANT DRIFT CLIENT V2.0 - MAIN COMPONENT
// ============================================================================

interface ResonantDriftClientProps {
  initialNodes: DriftQueryResponse[];
}

const INITIAL_ZOOM = 9.5;

export function ResonantDriftClient({
  initialNodes,
}: ResonantDriftClientProps) {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================

  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [viewport, setViewport] = useState({
    latitude: 20,
    longitude: 0,
    zoom: 2,
  });
  const [selectedNode, setSelectedNode] = useState<DriftNodeWithCost | null>(
    null,
  );
  const [showNodeDetailModal, setShowNodeDetailModal] = useState(false);
  const [showDistanceRings, setShowDistanceRings] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // ========================================================================
  // HOOKS
  // ========================================================================

  const { data: profile } = useProfile();
  const { statusInfo, nodesToRender, nodeCountWithin10km } = useDrift(
    initialNodes,
    userLocation,
  );

  // ========================================================================
  // GEOLOCATION SETUP
  // ========================================================================

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };

        setUserLocation(newLocation);
        setViewport({
          latitude,
          longitude,
          zoom: INITIAL_ZOOM,
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
        // Keep default viewport if geolocation fails
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    );
  }, []);

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleNodeClick = useCallback((node: DriftNodeWithCost) => {
    setSelectedNode(node);
    setShowNodeDetailModal(true);
  }, []);

  const handleFindMe = useCallback(async () => {
    setLocationLoading(true);
    try {
      const position = await getUserLocation();
      const { latitude, longitude } = position.coords;
      const newLocation = { lat: latitude, lng: longitude };
      setUserLocation(newLocation);
      setViewport({
        latitude,
        longitude,
        zoom: INITIAL_ZOOM,
      });
      toast.success("Location detected", {
        description: "Your harmonic signature resonates here",
      });
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : "Unable to access your location";
      toast.error("Error", { description });
    } finally {
      setLocationLoading(false);
    }
  }, []);

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="w-full h-full relative">
      {/* Map View */}
      <DriftMapView
        userLocation={userLocation}
        nodesToRender={nodesToRender}
        nodeCountWithin10km={nodeCountWithin10km}
        onNodeClick={handleNodeClick}
        onMoveEnd={setViewport}
        initialViewport={viewport}
        showDistanceRings={showDistanceRings}
      />

      {/* Empty States */}
      <EmptyState
        driftStatus={statusInfo.status}
        handleFindMe={handleFindMe}
        locationLoading={locationLoading}
      />

      {/* Top Bar - Status Banner */}
      <div className="absolute top-4 left-4 right-4 z-30 max-w-2xl mx-auto">
        <DriftStatusBanner
          statusInfo={statusInfo}
          driftCount={profile?.driftCount ?? 0}
        />
      </div>

      {/* Top Right - Controls */}
      <div className="absolute top-20 right-4 z-30 flex flex-col gap-2">
        {/* Find Me Button */}
        <Button
          onClick={handleFindMe}
          size="icon"
          disabled={locationLoading}
          variant="secondary"
          className="rounded-full shadow-lg"
        >
          {locationLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
        </Button>

        {/* Info Modal */}
        <InfoModal />

        {/* Cost Calculator */}
        <CostCalculatorModal
          driftCount={profile?.driftCount ?? 0}
          nodeCountWithin10km={nodeCountWithin10km}
        />

        {/* Toggle Distance Rings */}
        <Button
          onClick={() => setShowDistanceRings(!showDistanceRings)}
          size="icon"
          variant={showDistanceRings ? "default" : "secondary"}
          className="rounded-full shadow-lg"
          title="Toggle distance rings"
        >
          <div className="text-xs font-bold">📏</div>
        </Button>
      </div>

      {/* Bottom Sheet - Nodes List */}
      {statusInfo.status === DriftStatus.READY && nodesToRender.length > 0 && (
        <NodesListModal
          handleNodeClick={handleNodeClick}
          nodeCountWithin10km={nodeCountWithin10km}
          nodesToRender={nodesToRender}
          cheapestCost={statusInfo.cheapestCost}
        />
      )}

      {/* Node Detail Modal */}
      <DriftNodeDetailModal
        node={selectedNode}
        userLocation={userLocation}
        nodeCountWithin10km={nodeCountWithin10km}
        open={showNodeDetailModal}
        onOpenChange={setShowNodeDetailModal}
      />
    </div>
  );
}
