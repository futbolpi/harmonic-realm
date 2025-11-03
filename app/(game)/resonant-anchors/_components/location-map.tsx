"use client";

import { type RefObject, useState } from "react";
import Map, {
  NavigationControl,
  Marker,
  type MapRef,
  type MapLayerMouseEvent,
} from "react-map-gl/maplibre";
import { Crosshair } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { MAP_STYLES } from "../../map/utils";
import { UserMarker } from "../../_components/user-markers";

interface LocationMapProps {
  onLocationSelect: (lat: number, lon: number) => void;
  onGeolocationClick: () => void;
  selectedLocation: {
    lat: number;
    lon: number;
  } | null;
  mapRef: RefObject<MapRef | null>;
}

/**
 * Interactive map for selecting anchor location
 * Optimized for mobile with overlay geolocation button
 */
export default function LocationMap({
  onLocationSelect,
  onGeolocationClick,
  selectedLocation,
  mapRef,
}: LocationMapProps) {
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 20,
    zoom: 3,
  });

  const { resolvedTheme } = useTheme();

  // Handle map clicks
  const handleMapClick = (event: MapLayerMouseEvent) => {
    const { lngLat } = event;
    if (lngLat) {
      onLocationSelect(lngLat.lat, lngLat.lng);
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-t-lg md:rounded-lg">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onClick={handleMapClick}
        style={{ width: "100%", height: "100%" }}
        mapStyle={
          resolvedTheme === "light"
            ? MAP_STYLES.outdoor
            : MAP_STYLES.outdoorDark
        }
        attributionControl={false}
      >
        <NavigationControl position="top-right" />

        <div className="absolute bottom-4 left-4 z-10 md:bottom-6 md:left-6">
          <Button
            type="button"
            onClick={onGeolocationClick}
            size="icon"
            className="h-10 w-10 rounded-full bg-primary shadow-lg hover:bg-primary/90 md:h-11 md:w-11"
            title="Use current location"
          >
            <Crosshair className="h-5 w-5" />
          </Button>
        </div>

        {/* Selected Location Marker */}
        {selectedLocation && (
          <Marker
            longitude={selectedLocation.lon}
            latitude={selectedLocation.lat}
          >
            <UserMarker />
          </Marker>
        )}
      </Map>

      {!selectedLocation && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm font-medium text-foreground/60 backdrop-blur-sm rounded-lg px-3 py-2 bg-background/50">
              Click on map / crosshair to anchor
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
