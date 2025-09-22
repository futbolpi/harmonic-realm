"use client";

import { useMemo } from "react";

import { calculateDistance } from "@/lib/utils";
import { MINING_RANGE_METERS } from "@/config/site";
import {
  MiningState,
  UseMiningLogicProps,
  UseMiningLogicResult,
} from "@/lib/schema/mining-session";
import { useMiningSessionAssets } from "./use-mining-session-assets";
import { useLocation } from "../use-location";

export function useMiningLogic({
  nodeId,
  nodeLocation,
  maxSessions,
  completedSessions,
  isOpenForMining,
  allowedDistanceMeters = MINING_RANGE_METERS,
  allowRestartAfterCancelled = false,
}: UseMiningLogicProps): UseMiningLogicResult {
  // Fetch user's mining session for this node
  const sessionQuery = useMiningSessionAssets(nodeId);
  const session = sessionQuery.data?.session;

  // Get user's current location
  const userLocation = useLocation();

  // Memoize distance calculation in meters
  const distance = useMemo(() => {
    if (!userLocation) return null;

    const d =
      calculateDistance(
        nodeLocation.latitude,
        nodeLocation.longitude,
        userLocation.latitude,
        userLocation.longitude
      ) * 1000;

    return Math.round(d * 10) / 10;
  }, [nodeLocation, userLocation]);

  // Memoize mining state determination
  const miningState = useMemo(() => {
    if (sessionQuery.isLoading) return MiningState.Loading;
    if (sessionQuery.isError) return MiningState.Error;

    // Prioritize existing session status
    if (session) {
      if (session.status === "ACTIVE") return MiningState.Pending;
      if (session.status === "COMPLETED") return MiningState.Completed;
      if (session.status === "CANCELLED") {
        // Proceed to other checks (assuming cancelled allows retry)
        return allowRestartAfterCancelled
          ? MiningState.Cancelled
          : MiningState.Cancelled;
      }
    }

    // Node-level checks
    if (!isOpenForMining) return MiningState.NodeClosed;
    if (completedSessions >= maxSessions) return MiningState.NodeFull;

    // Location checks
    if (!userLocation) return MiningState.NoLocation;
    if (distance !== null && distance > allowedDistanceMeters)
      return MiningState.TooFar;

    return MiningState.Eligible;
  }, [
    sessionQuery.isLoading,
    sessionQuery.isError,
    session,
    isOpenForMining,
    completedSessions,
    maxSessions,
    userLocation,
    distance,
    allowedDistanceMeters,
    allowRestartAfterCancelled,
  ]);

  return {
    miningState,
    distance,
    showStartModal: miningState === MiningState.Eligible,
    showMiningModal: miningState === MiningState.Pending,
    showCompletedModal: miningState === MiningState.Completed,
  };
}
