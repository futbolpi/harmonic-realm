"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { useAuth } from "@/components/shared/auth/auth-context";
import { fetchMiningSession } from "@/lib/api-helpers/client/mining-sessions";
import { calculateDistance, isWithinMiningRange } from "@/lib/utils";
import { MINING_RANGE_METERS, SESSION_REFETCH_INTERVAL } from "@/config/site";
import { useLocation } from "../use-location";

type UseMininingSessionParams = {
  id: string;
  latitude: number;
  longitude: number;
  openForMining: boolean;
  maxMiners: number;
  completedMiners: number;
};

export function useMiningSession(node: UseMininingSessionParams) {
  const queryClient = useQueryClient();
  const wasInRangeRef = useRef<boolean>(false);

  const { isAuthenticated, accessToken } = useAuth();
  const userLocation = useLocation();

  const {
    completedMiners,
    id: nodeId,
    latitude: nodeLat,
    longitude: nodeLon,
    maxMiners,
    openForMining,
  } = node;

  // Calculate if user is within range
  const isInRange = userLocation
    ? isWithinMiningRange(
        userLocation.latitude,
        userLocation.longitude,
        nodeLat,
        nodeLon
      )
    : false;

  // Calculate distance for debugging/UI
  const distance = userLocation
    ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        nodeLat,
        nodeLon
      )
    : null;

  // calculate max miners reached
  const maxMinersReached = maxMiners >= completedMiners;

  const canMine = isInRange && openForMining && !maxMinersReached;

  // Invalidate query when user goes out of range
  useEffect(() => {
    if (wasInRangeRef.current && !isInRange) {
      // User was in range but now is out of range - invalidate the query
      queryClient.invalidateQueries({
        queryKey: ["mining-session", nodeId],
      });
    }
    wasInRangeRef.current = isInRange;
  }, [isInRange, nodeId, queryClient]);

  const query = useQuery({
    queryKey: ["mining-session", nodeId, accessToken],
    queryFn: async () => {
      if (!isAuthenticated || !accessToken) {
        throw new Error("User not authenticated");
      }

      if (!userLocation) {
        throw new Error("User not found");
      }

      let reason: null | string = "";

      // in range?
      if (!isInRange) {
        reason = "You are not within mining zone";
      }

      // is node available
      if (!openForMining) {
        reason = "Node is not currently active";
      }

      // is node max miners reached
      if (!maxMinersReached) {
        reason = "Node is at maximum capacity";
      }

      // has session ? // complete session : // start session

      const miningSession = await fetchMiningSession({
        accessToken,
        nodeId,
        canMine,
      });

      return { session: miningSession, canMine, reason };
    },
    enabled: !!nodeId && !!userLocation && isAuthenticated && isInRange,
    refetchInterval: (data) => {
      // If there's an active session, refetch more frequently
      if (data.state.data?.session?.status === "ACTIVE") {
        return SESSION_REFETCH_INTERVAL;
      }
      return 30000; // Default 30 seconds
    },
    staleTime: 5000, // Consider data stale after 5 seconds
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (
        error.message.includes("401") ||
        error.message.includes("unauthorized")
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const refreshSession = () => {
    queryClient.invalidateQueries({
      queryKey: ["mining-session", nodeId, accessToken],
    });
  };

  return {
    ...query,
    isInRange,
    distance,
    rangeMeters: MINING_RANGE_METERS,
    refreshSession,
  };
}
