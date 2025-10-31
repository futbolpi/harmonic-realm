"use client";

import { useState } from "react";
import Map, { Marker, Source, Layer } from "react-map-gl/maplibre";
import { useTheme } from "next-themes";

import { binLatLon, getBinBounds } from "@/lib/node-spawn/region-metrics";
import { MAP_STYLES } from "../../map/utils";
import { UserMarker } from "../../_components/user-markers";

interface LocationMapProps {
  location: { lat: number; lon: number };
}

export function LocationMap({ location }: LocationMapProps) {
  const [viewState, setViewState] = useState({
    longitude: location.lon,
    latitude: location.lat,
    zoom: 12,
  });
  const { resolvedTheme } = useTheme();

  const { latitudeBin, longitudeBin } = binLatLon(location.lat, location.lon);
  const bounds = getBinBounds(latitudeBin, longitudeBin);

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
    <div className="w-full h-96 rounded-lg border border-border overflow-hidden">
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ width: "100%", height: "100%" }}
        mapStyle={
          resolvedTheme === "light"
            ? MAP_STYLES.outdoor
            : MAP_STYLES.outdoorDark
        }
        attributionControl={false}
      >
        {/* Binned area layer */}
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

        {/* Current location marker */}
        <Marker longitude={location.lon} latitude={location.lat}>
          <UserMarker />
        </Marker>
      </Map>
    </div>
  );
}
