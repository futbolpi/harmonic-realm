"use client";

import { env } from "@/env";
import { $Enums } from "@/lib/generated/prisma";
import { Node } from "@/lib/schema/node";

// MapLibre configuration - using free MapTiler style
export const MAPLIBRE_STYLE = `https://api.maptiler.com/maps/streets/style.json?key=${env.NEXT_PUBLIC_MAPTILER_TOKEN}`;

// Alternative free styles
export const MAP_STYLES = {
  default: "https://demotiles.maplibre.org/style.json",
  dark: "https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json",
  satellite: "https://tiles.stadiamaps.com/styles/alidade_satellite.json",
} as const;

// Node marker colors based on rarity
export const NODE_COLORS: Record<$Enums.NodeTypeRarity, string> = {
  Common: "#10b981", // green - common
  Uncommon: "#3b82f6", // blue - uncommon
  Rare: "#8b5cf6", // purple - rare
  Epic: "#f59e0b", // orange - epic
  Legendary: "#ef4444", // red - legendary
} as const;

// Calculate distance between two points (in km)
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Get node icon based on type
export function getNodeIcon(node: Node): string {
  const iconMap: Record<string, string> = {
    "Urban Hub": "🏢",
    "Community Center": "🏛️",
    Landmark: "🗽",
    "Rare Node": "💎",
    Local: "📍",
  };

  return iconMap[node.type.name] || "⚡";
}

// Get rarity info
export function getRarityInfo(rarity: $Enums.NodeTypeRarity) {
  const rarityMap = {
    Common: {
      rating: 1,
      color: "bg-green-500",
      textColor: "text-green-400",
    },
    Uncommon: {
      rating: 2,
      color: "bg-blue-500",
      textColor: "text-blue-400",
    },
    Rare: {
      rating: 3,
      color: "bg-purple-500",
      textColor: "text-purple-400",
    },
    Epic: { rating: 4, color: "bg-orange-500", textColor: "text-orange-400" },
    Legendary: { rating: 5, color: "bg-red-500", textColor: "text-red-400" },
  };
  return rarityMap[rarity] || rarityMap.Common;
}

// Filter and sort nodes
export function filterNodes(
  nodes: Node[],
  filters: {
    rarity: $Enums.NodeTypeRarity | null;
    nodeType: string | null;
    openOnly: boolean | null;
    sponsored: boolean | null;
  }
): Node[] {
  return nodes.filter((node) => {
    if (filters.rarity && filters.rarity !== node.type.rarity) {
      return false;
    }

    if (filters.nodeType && filters.nodeType !== node.type.name) {
      return false;
    }

    if (filters.openOnly !== null) {
      const isOpen = !!node.openForMining;
      if (filters.openOnly && !isOpen) return false;
      if (!filters.openOnly && isOpen) return false;
    }

    if (filters.sponsored !== null) {
      const hassponsor = !!node.sponsor;
      if (filters.sponsored && !hassponsor) return false;
      if (!filters.sponsored && hassponsor) return false;
    }

    return true;
  });
}

export function sortNodes(
  nodes: Node[],
  sortBy: "distance" | "rarity" | "yield" | "name",
  userLocation: { latitude: number; longitude: number } | null
): Node[] {
  return [...nodes].sort((a, b) => {
    switch (sortBy) {
      case "distance":
        if (!userLocation) return 0;
        const distA = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          a.latitude,
          a.longitude
        );
        const distB = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          b.latitude,
          b.longitude
        );
        return distA - distB;

      case "rarity":
        return (
          getRarityInfo(b.type.rarity).rating -
          getRarityInfo(a.type.rarity).rating
        );

      case "yield":
        return b.type.baseYieldPerMinute - a.type.baseYieldPerMinute;

      case "name":
        return a.type.name.localeCompare(b.type.name);

      default:
        return 0;
    }
  });
}
