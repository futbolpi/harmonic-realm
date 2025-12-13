"use client";

import { useMemo } from "react";
import { addDays, isFuture } from "date-fns";

import { calculateDistance, formatCooldown } from "@/lib/utils";
import { getDriftCost } from "@/lib/drift/drift-cost";
import {
  DriftNodeWithCost,
  DriftQueryResponse,
  DriftStatus,
  StatusInfo,
  UseDriftResult,
} from "@/lib/schema/drift";
import {
  DRIFT_COOL_DOWN_DAYS,
  MAX_DRIFT_DISTANCE_KM,
  VOID_ZONE_RADIUS_KM,
} from "@/config/drift";
import { useProfile } from "./queries/use-profile";

/**
 * useDrift Hook - Manages drift state and node filtering
 *
 * @param initialNodes - Available drift opportunity nodes
 * @param userLocation - Current user location {lat, lng} or null
 * @returns Drift status, eligible nodes with costs, and metadata
 */
export function useDrift(
  initialNodes: DriftQueryResponse[],
  userLocation: { lat: number; lng: number } | null
): UseDriftResult {
  const { data: profile } = useProfile();

  // Memoize drift status calculation
  const driftStatus = useMemo(() => {
    // Check 1: Location required
    if (!userLocation) return DriftStatus.NO_LOCATION;

    // Check 2: Cooldown (72 hours)
    if (profile?.lastDriftAt) {
      const cooldownEnd = addDays(
        new Date(profile.lastDriftAt),
        DRIFT_COOL_DOWN_DAYS
      );

      if (isFuture(cooldownEnd)) return DriftStatus.ON_COOLDOWN;
    }

    // Check 3: Content abundance (has nodes within voiid zone)
    const nearbyNodes = initialNodes.filter((node) => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        node.latitude,
        node.longitude
      );
      return distance <= VOID_ZONE_RADIUS_KM;
    });
    if (nearbyNodes.length > 0) return DriftStatus.CONTENT_ABUNDANT;

    // Check 4: No eligible nodes
    if (initialNodes.length === 0) return DriftStatus.NO_ELIGIBLE_NODES;

    // Check 5: Can afford at least one node (deferred to nodesToRender calculation)
    // Return READY provisionally; will validate in statusInfo if needed

    return DriftStatus.READY;
  }, [userLocation, profile?.lastDriftAt, initialNodes]);

  // Memoize processed nodes with distance and cost calculations
  const nodesToRender = useMemo(() => {
    if (!userLocation) return [];
    if (driftStatus !== DriftStatus.READY) return [];

    const processedNodes = initialNodes
      .map((node) => {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          node.latitude,
          node.longitude
        );

        // Only calculate cost if node is in valid drift range (10-100km)
        let cost = 0;
        if (
          distance > VOID_ZONE_RADIUS_KM &&
          distance <= MAX_DRIFT_DISTANCE_KM
        ) {
          cost = getDriftCost({
            driftCount: profile?.driftCount ?? 0,
            distance,
            rarity: node.rarity,
          });
        }

        const canDrift =
          distance > VOID_ZONE_RADIUS_KM &&
          distance <= MAX_DRIFT_DISTANCE_KM &&
          (profile?.sharePoints ?? 0) >= cost;

        return {
          ...node,
          distance,
          cost,
          canDrift,
        } as DriftNodeWithCost;
      })
      .filter(
        (node) =>
          node.distance > VOID_ZONE_RADIUS_KM &&
          node.distance <= MAX_DRIFT_DISTANCE_KM
      )
      .sort((a, b) => a.distance - b.distance);

    // Check affordability: if no nodes can be drifted, update status to insufficient funds
    const hasAffordableNode = processedNodes.some((n) => n.canDrift);
    if (processedNodes.length > 0 && !hasAffordableNode) {
      // This will be caught in statusInfo calculation
      return [];
    }

    const firstTwenty = processedNodes.slice(0, 20);

    return firstTwenty;
  }, [
    userLocation,
    driftStatus,
    initialNodes,
    profile?.sharePoints,
    profile?.driftCount,
  ]);

  // Determine if we should show INSUFFICIENT_FUNDS status
  const actualStatus = useMemo(() => {
    if (driftStatus !== DriftStatus.READY) return driftStatus;

    // If no processed nodes and initial nodes exist, it's insufficient funds
    if (nodesToRender.length === 0 && initialNodes.length > 0) {
      const validDistanceNodes = initialNodes.filter((node) => {
        if (!userLocation) return false;
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          node.latitude,
          node.longitude
        );
        return (
          distance > VOID_ZONE_RADIUS_KM && distance <= MAX_DRIFT_DISTANCE_KM
        );
      });

      if (validDistanceNodes.length > 0) {
        return DriftStatus.INSUFFICIENT_FUNDS;
      }
    }

    return driftStatus;
  }, [driftStatus, nodesToRender, initialNodes, userLocation]);

  // Memoize status metadata
  const statusInfo = useMemo((): StatusInfo => {
    switch (actualStatus) {
      case DriftStatus.READY:
        return {
          icon: "✅",
          text: "Ready to Drift",
          variant: "default",
        };
      case DriftStatus.NO_LOCATION:
        return {
          icon: "📍",
          text: "Enable Location",
          variant: "outline",
        };
      case DriftStatus.ON_COOLDOWN: {
        if (!profile?.lastDriftAt) {
          return {
            icon: "⏳",
            text: "Cooldown Active",
            variant: "default",
          };
        }
        const cooldownEnd = addDays(
          new Date(profile.lastDriftAt),
          DRIFT_COOL_DOWN_DAYS
        );
        const timeLeft = formatCooldown(cooldownEnd);

        return {
          icon: "⏳",
          text: `Cooldown: ${timeLeft}`,
          variant: "secondary",
        };
      }
      case DriftStatus.NO_ELIGIBLE_NODES:
        return {
          icon: "❌",
          text: "No Dormant Nodes",
          variant: "destructive",
        };
      case DriftStatus.INSUFFICIENT_FUNDS:
        return {
          icon: "💰",
          text: "Insufficient SharePoints",
          variant: "destructive",
        };
      case DriftStatus.CONTENT_ABUNDANT:
        return {
          icon: "🌟",
          text: "Nodes Nearby",
          variant: "secondary",
        };
    }
  }, [actualStatus, profile?.lastDriftAt]);

  // Calculate cooldown end time
  const cooldownEndsAt = useMemo(() => {
    if (!profile?.lastDriftAt) return null;
    const cooldownEnd = addDays(
      new Date(profile.lastDriftAt),
      DRIFT_COOL_DOWN_DAYS
    );

    return cooldownEnd;
  }, [profile?.lastDriftAt]);

  return {
    driftStatus: actualStatus,
    statusInfo,
    nodesToRender,
    cooldownEndsAt,
  };
}
