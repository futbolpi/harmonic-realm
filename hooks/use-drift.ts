"use client";

import { useMemo } from "react";
import { addDays, isFuture } from "date-fns";

import { calculateDistance, formatCooldown } from "@/lib/utils";
import { getDriftCost } from "@/lib/drift/drift-cost";
import {
  DriftQueryResponse,
  DriftStatus,
  StatusInfo,
  UseDriftResult,
} from "@/lib/schema/drift";
import {
  DRIFT_COOL_DOWN_DAYS,
  MAX_DRIFT_DISTANCE_KM,
  VOID_ZONE_RADIUS_KM,
  getDensityTier,
  getRemainingDiscounts,
} from "@/config/drift";
import { useProfile } from "./queries/use-profile";

// ============================================================================
// USE DRIFT HOOK V2.0
// ============================================================================

/**
 * Hook for managing drift state and node filtering with v2.0 enhancements
 *
 * V2.0 Changes:
 * - Density-based eligibility (0-5 nodes instead of binary 0)
 * - Updated cost calculation with new formula
 * - Graduated discount tracking
 * - Reduced cooldown (2 days)
 *
 * @param initialNodes - Available drift opportunity nodes
 * @param userLocation - Current user location {lat, lng} or null
 * @returns Drift status, eligible nodes with costs, and metadata
 */
export function useDrift(
  initialNodes: DriftQueryResponse[],
  userLocation: { lat: number; lng: number } | null,
): UseDriftResult {
  const { data: profile } = useProfile();

  // ==========================================================================
  // CALCULATE NODE COUNT WITHIN VOID ZONE (V2.0: FOR DENSITY TIERS)
  // ==========================================================================

  const nodeCountWithin10km = useMemo(() => {
    if (!userLocation) return 0;

    return initialNodes.filter((node) => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        node.latitude,
        node.longitude,
      );
      return distance <= VOID_ZONE_RADIUS_KM;
    }).length;
  }, [userLocation, initialNodes]);

  // ==========================================================================
  // CALCULATE DRIFT STATUS
  // ==========================================================================

  const driftStatus = useMemo(() => {
    // Check 1: Location required
    if (!userLocation) return DriftStatus.NO_LOCATION;

    // Check 2: Cooldown (v2.0: 2 days instead of 3)
    if (profile?.lastDriftAt) {
      const cooldownEnd = addDays(
        new Date(profile.lastDriftAt),
        DRIFT_COOL_DOWN_DAYS,
      );

      if (isFuture(cooldownEnd)) return DriftStatus.ON_COOLDOWN;
    }

    // Check 3: Density-based eligibility (v2.0: graduated instead of binary)
    const densityTier = getDensityTier(nodeCountWithin10km);

    if (densityTier.multiplier === null) {
      // 6+ nodes = not eligible
      return DriftStatus.CONTENT_ABUNDANT;
    }

    // Check 4: No eligible nodes
    if (initialNodes.length === 0) return DriftStatus.NO_ELIGIBLE_NODES;

    return DriftStatus.READY;
  }, [userLocation, profile?.lastDriftAt, nodeCountWithin10km, initialNodes]);

  // ==========================================================================
  // PROCESS NODES WITH DISTANCE AND COST CALCULATIONS (V2.0)
  // ==========================================================================

  const nodesToRender = useMemo(() => {
    if (!userLocation) return [];
    if (driftStatus !== DriftStatus.READY) return [];

    const processedNodes = initialNodes
      .map((node) => {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          node.latitude,
          node.longitude,
        );

        // Only calculate cost if node is in valid drift range (10-100km)
        let cost = 0;
        let canDrift = false;

        if (
          distance > VOID_ZONE_RADIUS_KM &&
          distance <= MAX_DRIFT_DISTANCE_KM
        ) {
          // V2.0: Use new cost calculation with density
          const costResult = getDriftCost({
            driftCount: profile?.driftCount ?? 0,
            distance,
            rarity: node.rarity,
            nodeCountWithin10km,
          });

          cost = costResult.cost;
          canDrift = costResult.eligible && (profile?.sharePoints ?? 0) >= cost;
        }

        return {
          ...node,
          distance,
          cost,
          canDrift,
        };
      })
      .filter((node) => node.canDrift) // Exclude nodes that can't be drifted
      .sort((a, b) => a.cost - b.cost); // Sort by cost (cheapest first)

    return processedNodes;
  }, [userLocation, driftStatus, initialNodes, profile, nodeCountWithin10km]);

  // ==========================================================================
  // BUILD STATUS INFO FOR UI
  // ==========================================================================

  const statusInfo = useMemo<StatusInfo>(() => {
    const densityTier = getDensityTier(nodeCountWithin10km);
    const remainingDiscounts = getRemainingDiscounts(profile?.driftCount ?? 0);

    switch (driftStatus) {
      case DriftStatus.NO_LOCATION:
        return {
          status: DriftStatus.NO_LOCATION,
          title: "Location Required",
          description: "Enable location access to use Resonant Drift",
          canDrift: false,
        };

      case DriftStatus.ON_COOLDOWN:
        if (profile?.lastDriftAt) {
          const cooldownEnd = addDays(
            new Date(profile.lastDriftAt),
            DRIFT_COOL_DOWN_DAYS,
          );
          const remaining = formatCooldown(cooldownEnd);

          return {
            status: DriftStatus.ON_COOLDOWN,
            title: "Drift Cooldown Active",
            description: `Next drift available in ${remaining}`,
            canDrift: false,
            cooldownEnd,
          };
        }
        break;

      case DriftStatus.CONTENT_ABUNDANT:
        return {
          status: DriftStatus.CONTENT_ABUNDANT,
          title: densityTier.label,
          description: `${nodeCountWithin10km} nodes within 10km. Drift only available in sparse areas (0-5 nodes).`,
          canDrift: false,
          nodeCount: nodeCountWithin10km,
          densityTier: densityTier.label,
        };

      case DriftStatus.NO_ELIGIBLE_NODES:
        return {
          status: DriftStatus.NO_ELIGIBLE_NODES,
          title: "No Dormant Nodes",
          description:
            "No eligible nodes found within 100km. Nodes must be inactive for 7+ days.",
          canDrift: false,
        };

      case DriftStatus.READY:
        const cheapestNode = nodesToRender[0];
        const affordableCount = nodesToRender.filter((n) => n.canDrift).length;

        return {
          status: DriftStatus.READY,
          title: densityTier.label,
          description:
            remainingDiscounts > 0
              ? `${affordableCount} nodes available. ${remainingDiscounts} discounted drifts remaining!`
              : `${affordableCount} nodes available. Standard pricing applies.`,
          canDrift: affordableCount > 0,
          nodeCount: nodeCountWithin10km,
          densityTier: densityTier.label,
          cheapestCost: cheapestNode?.cost,
          affordableCount,
          remainingDiscounts,
        };

      default:
        return {
          status: DriftStatus.NO_LOCATION,
          title: "Unknown Status",
          description: "Unable to determine drift status",
          canDrift: false,
        };
    }

    return {
      status: DriftStatus.NO_LOCATION,
      title: "Unknown Status",
      description: "Unable to determine drift status",
      canDrift: false,
    };
  }, [driftStatus, profile, nodesToRender, nodeCountWithin10km]);

  return {
    driftStatus,
    statusInfo,
    nodesToRender,
    nodeCountWithin10km,
    densityTier: getDensityTier(nodeCountWithin10km),
  };
}
