import { VOID_ZONE_RADIUS_KM, getDensityTier } from "@/config/drift";

// ============================================================================
// MAP VISUALIZATION UTILITIES FOR DRIFT V2.0
// ============================================================================

export interface UserLocation {
  lat: number;
  lng: number;
}

/**
 * Generate GeoJSON for void zone circle (10km radius)
 * Used to visualize the no-drift zone around user
 */
export const generateVoidZoneCircle = (
  center: UserLocation,
): GeoJSON.FeatureCollection => {
  const radiusKm = VOID_ZONE_RADIUS_KM;
  const latPerKm = 1 / 111; // Approximate degrees latitude per km
  const lngPerKm = 1 / (111 * Math.cos((center.lat * Math.PI) / 180));

  const points: [number, number][] = [];
  const steps = 64; // Smoother circle

  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const lat = center.lat + radiusKm * latPerKm * Math.sin(angle);
    const lng = center.lng + radiusKm * lngPerKm * Math.cos(angle);
    points.push([lng, lat]);
  }

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [points],
        },
        properties: {
          radiusKm,
          type: "void-zone",
        },
      },
    ],
  };
};

/**
 * Generate GeoJSON for density zone rings (v2.0)
 * Shows graduated eligibility zones: 0-2, 3-5, 6-10, 11+ nodes
 */
export const generateDensityZones = (
  center: UserLocation,
  nodeCount: number,
): GeoJSON.FeatureCollection => {
  const densityTier = getDensityTier(nodeCount);
  const latPerKm = 1 / 111;
  const lngPerKm = 1 / (111 * Math.cos((center.lat * Math.PI) / 180));

  const features: GeoJSON.Feature[] = [];

  // Generate ring for current density tier
  const generateRing = (radiusKm: number, color: string, label: string) => {
    const points: [number, number][] = [];
    const steps = 64;

    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const lat = center.lat + radiusKm * latPerKm * Math.sin(angle);
      const lng = center.lng + radiusKm * lngPerKm * Math.cos(angle);
      points.push([lng, lat]);
    }

    return {
      type: "Feature" as const,
      geometry: {
        type: "LineString" as const,
        coordinates: points,
      },
      properties: {
        radiusKm,
        color,
        label,
        densityTier: densityTier.label,
      },
    };
  };

  // Add void zone boundary (always visible)
  features.push(generateRing(10, "#ef4444", "Void Zone Boundary"));

  // Add density tier indicator ring based on current node count
  if (nodeCount === 0) {
    // Void zone - add inner accent ring
    features.push(generateRing(8, "#f87171", "Void Zone"));
  } else if (nodeCount <= 2) {
    // Sparse zone - add subtle ring
    features.push(generateRing(12, "#fb923c", "Sparse Zone"));
  } else if (nodeCount <= 5) {
    // Low density - add warning ring
    features.push(generateRing(14, "#facc15", "Low Density (1.5× cost)"));
  }

  return {
    type: "FeatureCollection",
    features,
  };
};

/**
 * Generate GeoJSON for potential drift landing zones (2-8km scatter range)
 * Shows where drifted nodes can land
 */
export const generateDriftLandingZone = (
  center: UserLocation,
): GeoJSON.FeatureCollection => {
  const latPerKm = 1 / 111;
  const lngPerKm = 1 / (111 * Math.cos((center.lat * Math.PI) / 180));

  const features: GeoJSON.Feature[] = [];

  // Inner boundary (2km)
  const generateCircle = (radiusKm: number) => {
    const points: [number, number][] = [];
    const steps = 64;

    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const lat = center.lat + radiusKm * latPerKm * Math.sin(angle);
      const lng = center.lng + radiusKm * lngPerKm * Math.cos(angle);
      points.push([lng, lat]);
    }

    return points;
  };

  // Annulus (donut) showing 2-8km scatter range
  const innerCircle = generateCircle(2);
  const outerCircle = generateCircle(8);

  features.push({
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [outerCircle, innerCircle], // Hole in the middle
    },
    properties: {
      type: "landing-zone",
      minRadius: 2,
      maxRadius: 8,
    },
  });

  return {
    type: "FeatureCollection",
    features,
  };
};

/**
 * Generate GeoJSON for distance rings (helpful for distance estimation)
 * Shows 25km, 50km, 75km, 100km rings
 */
export const generateDistanceRings = (
  center: UserLocation,
): GeoJSON.FeatureCollection => {
  const latPerKm = 1 / 111;
  const lngPerKm = 1 / (111 * Math.cos((center.lat * Math.PI) / 180));

  const features: GeoJSON.Feature[] = [];
  const rings = [
    { radius: 25, opacity: 0.4, label: "25km" },
    { radius: 50, opacity: 0.3, label: "50km" },
    { radius: 75, opacity: 0.2, label: "75km" },
    { radius: 100, opacity: 0.1, label: "100km (max drift range)" },
  ];

  rings.forEach(({ radius, opacity, label }) => {
    const points: [number, number][] = [];
    const steps = 64;

    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const lat = center.lat + radius * latPerKm * Math.sin(angle);
      const lng = center.lng + radius * lngPerKm * Math.cos(angle);
      points.push([lng, lat]);
    }

    features.push({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: points,
      },
      properties: {
        radius,
        opacity,
        label,
      },
    });
  });

  return {
    type: "FeatureCollection",
    features,
  };
};

/**
 * Generate GeoJSON for grid lines (for visualizing node spawn zones)
 * Creates 1km grid within specified radius
 */
export const generateGridLines = (
  center: UserLocation,
  radiusKm: number = 10,
): GeoJSON.FeatureCollection => {
  const features: GeoJSON.Feature[] = [];
  const gridSpacingKm = 1;

  const latPerKm = 1 / 111;
  const lngPerKm = 1 / (111 * Math.cos((center.lat * Math.PI) / 180));

  // Horizontal lines
  for (
    let lat = center.lat - radiusKm * latPerKm;
    lat <= center.lat + radiusKm * latPerKm;
    lat += gridSpacingKm * latPerKm
  ) {
    features.push({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [center.lng - radiusKm * lngPerKm, lat],
          [center.lng + radiusKm * lngPerKm, lat],
        ],
      },
      properties: { type: "horizontal" },
    });
  }

  // Vertical lines
  for (
    let lng = center.lng - radiusKm * lngPerKm;
    lng <= center.lng + radiusKm * lngPerKm;
    lng += gridSpacingKm * lngPerKm
  ) {
    features.push({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [lng, center.lat - radiusKm * latPerKm],
          [lng, center.lat + radiusKm * latPerKm],
        ],
      },
      properties: { type: "vertical" },
    });
  }

  return {
    type: "FeatureCollection",
    features,
  };
};

/**
 * Calculate optimal map bounds to show all nodes and user location
 */
export const calculateMapBounds = (
  userLocation: UserLocation | null,
  nodes: Array<{ latitude: number; longitude: number }>,
): [[number, number], [number, number]] | null => {
  if (!userLocation && nodes.length === 0) return null;

  const allPoints = [
    ...(userLocation
      ? [{ latitude: userLocation.lat, longitude: userLocation.lng }]
      : []),
    ...nodes,
  ];

  if (allPoints.length === 0) return null;

  const lats = allPoints.map((p) => p.latitude);
  const lngs = allPoints.map((p) => p.longitude);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // Add 10% padding
  const latPadding = (maxLat - minLat) * 0.1 || 0.1;
  const lngPadding = (maxLng - minLng) * 0.1 || 0.1;

  return [
    [minLng - lngPadding, minLat - latPadding],
    [maxLng + lngPadding, maxLat + latPadding],
  ];
};

/**
 * Get color for density tier (for UI consistency)
 */
export const getDensityTierColor = (nodeCount: number): string => {
  const tier = getDensityTier(nodeCount);

  switch (tier.label) {
    case "Void Zone":
    case "Sparse Zone":
      return "#ef4444"; // Red (eligible, full access)
    case "Low Density":
      return "#f59e0b"; // Amber (eligible, 1.5× cost)
    case "Medium Density":
    case "Dense Zone":
      return "#6b7280"; // Gray (not eligible)
    default:
      return "#6b7280";
  }
};
