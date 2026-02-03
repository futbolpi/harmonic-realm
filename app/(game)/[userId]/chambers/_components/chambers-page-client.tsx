"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import Map, { Marker, Source, Layer, MapRef } from "react-map-gl/maplibre";
import { useTheme } from "next-themes";
import circle from "@turf/circle";
import { Crosshair, Plus, Zap, MapPin, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProfile } from "@/hooks/queries/use-profile";
import { UserMarker } from "@/app/(game)/_components/user-markers";
import { MAP_STYLES } from "@/app/(game)/map/utils";
import { CHAMBER_CONSTANTS } from "@/lib/utils/chambers";
import { getUserLocation } from "@/lib/utils/location";
import { ChamberMarker } from "./chamber-marker";
import { CreateChamberModal } from "./create-chamber-modal";
import { ChambersListModal } from "./chambers-list-modal";
import { ChamberDetailModal } from "./detail-modal/chamber-detail-modal";

type Location = {
  lat: number;
  lng: number;
} | null;

interface Chamber {
  id: string;
  latitude: number;
  longitude: number;
  level: number;
  totalResonanceInvested: number;
  currentDurability: number;
  lastMaintenanceAt: string;
  maintenanceDueAt: string;
  boost: number;
  cosmeticTheme: string | null;
  isPremium: boolean;
  createdAt: string;
}

interface ChambersPageClientProps {
  userId: string;
  initialChambers: Chamber[];
}

export function ChambersPageClient({
  userId,
  initialChambers,
}: ChambersPageClientProps) {
  const mapRef = useRef<MapRef>(null);
  const { resolvedTheme } = useTheme();
  const { data: userProfile } = useProfile();

  const [selectedChamberId, setSelectedChamberId] = useState<string | null>(
    null,
  );
  const [createMode, setCreateMode] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [createLocation, setCreateLocation] = useState<Location>(null);
  const [userLocation, setUserLocation] = useState<Location>(null);

  const chambers = useMemo(() => initialChambers, [initialChambers]);

  const selectedChamber = useMemo(
    () => chambers.find((c) => c.id === selectedChamberId) || null,
    [chambers, selectedChamberId],
  );

  // Initial viewport centered on user or first chamber
  const initialViewState = useMemo(() => {
    if (userLocation) {
      return {
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        zoom: 12,
      };
    }
    if (chambers.length > 0) {
      return {
        latitude: chambers[0].latitude,
        longitude: chambers[0].longitude,
        zoom: 12,
      };
    }
    return {
      latitude: 40.7128,
      longitude: -74.006,
      zoom: 10,
    };
  }, [userLocation, chambers]);

  const handleMapLocationSelect = useCallback((lat: number, lon: number) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lon, lat],
        zoom: 15.5,
        bearing: 27,
        pitch: 45,
        speed: 0.5,
        duration: 1000,
      });
    }
  }, []);

  // Fly to chamber
  const handleChamberSelect = useCallback(
    (chamberId: string) => {
      const chamber = chambers.find((c) => c.id === chamberId);
      if (chamber) {
        setSelectedChamberId(chamberId);
        handleMapLocationSelect(chamber.latitude, chamber.longitude);
      }
    },
    [chambers, handleMapLocationSelect],
  );

  const handleUseCurrentLocation = useCallback(async () => {
    setIsLocating(true);
    try {
      const position = await getUserLocation();
      const { latitude, longitude } = position.coords;
      setUserLocation({ lat: latitude, lng: longitude });
      handleMapLocationSelect(latitude, longitude);
      if (createMode) {
        setCreateLocation({ lat: latitude, lng: longitude });
      }
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
      setIsLocating(false);
    }
  }, [createMode, handleMapLocationSelect]);

  // Handle map click for chamber creation
  const handleMapClick = useCallback(
    (e: maplibregl.MapLayerMouseEvent) => {
      if (createMode) {
        const { lng, lat } = e.lngLat;
        setCreateLocation({ lat, lng });
      }
    },
    [createMode],
  );

  // Cancel create mode
  const handleCancelCreate = useCallback(() => {
    setCreateMode(false);
    setCreateLocation(null);
  }, []);

  const canCreateMore =
    chambers.length < CHAMBER_CONSTANTS.MAX_CHAMBERS_PER_USER;

  const userIsOwner = userProfile?.id === userId;

  return (
    <div className="relative h-full w-full">
      {/* Map */}
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        style={{ width: "100%", height: "100%" }}
        mapStyle={
          resolvedTheme === "light"
            ? MAP_STYLES.outdoor
            : MAP_STYLES.outdoorDark
        }
        attributionControl={false}
        onClick={(e) => {
          handleMapClick(e);
        }}
        cursor={createMode ? "crosshair" : "grab"}
      >
        {/* Chamber markers and radius circles */}
        {chambers.map((chamber) => {
          const radiusCircle = circle(
            [chamber.longitude, chamber.latitude],
            CHAMBER_CONSTANTS.BOOST_RADIUS_KM,
            { units: "kilometers", steps: 64 },
          );

          const fillColor =
            chamber.currentDurability >= 70
              ? "#3b82f6"
              : chamber.currentDurability >= 40
                ? "#eab308"
                : chamber.currentDurability >= 20
                  ? "#f97316"
                  : "#ef4444";

          return (
            <div key={chamber.id}>
              {/* Radius circle */}
              <Source
                id={`chamber-radius-${chamber.id}`}
                type="geojson"
                data={radiusCircle}
              >
                <Layer
                  id={`chamber-radius-fill-${chamber.id}`}
                  type="fill"
                  paint={{
                    "fill-color": fillColor,
                    "fill-opacity": 0.1,
                  }}
                />
                <Layer
                  id={`chamber-radius-line-${chamber.id}`}
                  type="line"
                  paint={{
                    "line-color": fillColor,
                    "line-width": 2,
                    "line-opacity": 0.6,
                    "line-dasharray": [2, 2],
                  }}
                />
              </Source>

              {/* Chamber marker */}
              <Marker
                longitude={chamber.longitude}
                latitude={chamber.latitude}
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelectedChamberId(chamber.id);
                }}
              >
                <ChamberMarker
                  level={chamber.level}
                  currentDurability={chamber.currentDurability}
                  isSelected={chamber.id === selectedChamberId}
                />
              </Marker>
            </div>
          );
        })}

        {/* User location marker */}
        {userLocation && (
          <Marker longitude={userLocation.lng} latitude={userLocation.lat}>
            <UserMarker isCurrentUser level={userProfile?.level} />
          </Marker>
        )}

        {/* Create location preview */}
        {createMode && createLocation && (
          <>
            {/* Preview radius */}
            <Source
              id="create-preview-radius"
              type="geojson"
              data={circle(
                [createLocation.lng, createLocation.lat],
                CHAMBER_CONSTANTS.BOOST_RADIUS_KM,
                { units: "kilometers", steps: 64 },
              )}
            >
              <Layer
                id="create-preview-fill"
                type="fill"
                paint={{
                  "fill-color": "#8b5cf6",
                  "fill-opacity": 0.15,
                }}
              />
              <Layer
                id="create-preview-line"
                type="line"
                paint={{
                  "line-color": "#8b5cf6",
                  "line-width": 2,
                  "line-opacity": 0.8,
                  "line-dasharray": [4, 2],
                }}
              />
            </Source>

            {/* Preview marker */}
            <Marker
              longitude={createLocation.lng}
              latitude={createLocation.lat}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-purple-500 border-2 border-purple-300 flex items-center justify-center animate-pulse">
                  <Plus className="h-5 w-5 text-white" />
                </div>
              </div>
            </Marker>
          </>
        )}
      </Map>

      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
        <div className="flex gap-2">
          {/* User location button */}
          <Button
            size="sm"
            variant="secondary"
            className="shadow-lg rounded-full h-9 w-9 p-0"
            disabled={isLocating}
            onClick={async () => {
              await handleUseCurrentLocation();
            }}
          >
            {isLocating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Crosshair className="h-4 w-4" />
            )}
          </Button>

          {/* Create chamber button */}
          {canCreateMore && !createMode && userIsOwner && (
            <Button
              size="sm"
              variant="secondary"
              className="shadow-lg rounded-full h-9 w-9 p-0"
              onClick={() => setCreateMode(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}

          {/* Link to main map */}
          <Button
            asChild
            size="sm"
            variant="secondary"
            className="shadow-lg rounded-full h-9 w-9 p-0"
          >
            <Link href="/map">
              <Zap className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Chamber count badge */}
        <Badge
          variant="outline"
          className="bg-background/90 backdrop-blur-sm shadow-lg"
        >
          {chambers.length}/{CHAMBER_CONSTANTS.MAX_CHAMBERS_PER_USER} Chambers
        </Badge>
      </div>

      {/* Create mode alert */}
      {createMode && (
        <div className="absolute top-16 left-4 right-4 z-10">
          <Alert className="bg-background/90 backdrop-blur-sm shadow-lg">
            <MapPin className="h-4 w-4" />
            <AlertDescription>
              {createLocation
                ? "Tap 'Create' to manifest your Echo Chamber at this location"
                : "Tap the map to select a location for your new Echo Chamber"}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex gap-2">
        {createMode ? (
          <>
            {createLocation && userIsOwner && (
              <CreateChamberModal
                latitude={createLocation.lat}
                longitude={createLocation.lng}
                existingChambers={chambers.map((c) => ({
                  latitude: c.latitude,
                  longitude: c.longitude,
                }))}
                trigger={
                  <Button className="flex-1 shadow-lg">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Chamber
                  </Button>
                }
                onClose={() => {
                  handleCancelCreate();
                }}
              />
            )}
            <Button
              variant="destructive"
              className="flex-1 shadow-lg"
              onClick={() => {
                handleCancelCreate();
              }}
            >
              Cancel
            </Button>
          </>
        ) : (
          <ChambersListModal
            chambers={chambers}
            selectedChamberId={selectedChamberId}
            onChamberSelect={(chamberId) => {
              handleChamberSelect(chamberId);
            }}
          />
        )}
      </div>

      {/* Chamber detail modal */}
      {selectedChamber && (
        <ChamberDetailModal
          chamber={selectedChamber}
          onClose={() => setSelectedChamberId(null)}
          userId={userId}
        />
      )}
    </div>
  );
}
