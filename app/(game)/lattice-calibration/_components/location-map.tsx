"use client";

import { type RefObject, useState } from "react";
import Map, {
  Marker,
  Source,
  Layer,
  type MapRef,
  type MapLayerMouseEvent,
  NavigationControl,
} from "react-map-gl/maplibre";
import { useTheme } from "next-themes";
import { Crosshair, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { binLatLon, getBinBounds } from "@/lib/node-spawn/region-metrics";
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
  isLocating: boolean;
}

export function LocationMap({
  mapRef,
  onGeolocationClick,
  onLocationSelect,
  selectedLocation,
  isLocating,
}: LocationMapProps) {
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 20,
    zoom: 3,
  });
  const { resolvedTheme } = useTheme();

  const { latitudeBin, longitudeBin } = binLatLon(
    selectedLocation?.lat || viewState.latitude,
    selectedLocation?.lon || viewState.longitude
  );
  const bounds = getBinBounds(latitudeBin, longitudeBin);

  // Handle map clicks
  const handleMapClick = (event: MapLayerMouseEvent) => {
    const { lngLat } = event;
    if (lngLat) {
      onLocationSelect(lngLat.lat, lngLat.lng);
    }
  };

  // Create GeoJSON polygon for binned area
  const binAreaGeoJSON = {
    type: "Feature" as const,
    geometry: {
      type: "Polygon" as const,
      coordinates: [
        [
          [bounds.west, bounds.south],
          [bounds.east, bounds.south],
          [bounds.east, bounds.north],
          [bounds.west, bounds.north],
          [bounds.west, bounds.south],
        ],
      ],
    },
    properties: {},
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
        {/* Binned area layer */}

        {selectedLocation && (
          <Source id="bin-area" type="geojson" data={binAreaGeoJSON}>
            <Layer
              id="bin-area-fill"
              type="fill"
              paint={{
                "fill-color": "#22c55e",
                "fill-opacity": 0.15,
              }}
            />
            <Layer
              id="bin-area-border"
              type="line"
              paint={{
                "line-color": "#22c55e",
                "line-width": 2,
              }}
            />
          </Source>
        )}

        <div className="absolute bottom-4 left-4 z-10 md:bottom-6 md:left-6">
          <Button
            type="button"
            onClick={onGeolocationClick}
            disabled={isLocating}
            size="icon"
            className="h-10 w-10 rounded-full bg-primary shadow-lg hover:bg-primary/90 md:h-11 md:w-11"
            title="Use current location"
          >
            {isLocating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Crosshair className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Current location marker */}
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
              Click on map / crosshair to contribute
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
