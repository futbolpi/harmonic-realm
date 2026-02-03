"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Timer, Zap, Coins, MapPin, Loader2 } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { completeMiningSession } from "@/actions/mining/complete-mining-session";
import { useAuth } from "@/components/shared/auth/auth-context";
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
} from "@/components/credenza";
import { useMiningSessionAssets } from "@/hooks/queries/use-mining-session-assets";
import { MiningState } from "@/lib/schema/mining-session";
import { MINING_RANGE_METERS } from "@/config/site";
import { useLocation } from "@/hooks/use-location";

interface ActiveMiningDrawerProps {
  node: {
    id: string;
    name: string;
    lockInMinutes: number;
  };
  distanceMeters: number | null;
  miningState: MiningState;
  allowedDistanceMeters?: number;
  onComplete?: () => void;
}

export function ActiveMiningDrawer({
  node,
  distanceMeters,
  miningState,
  allowedDistanceMeters = MINING_RANGE_METERS,
  onComplete,
}: ActiveMiningDrawerProps) {
  // remaining time in milliseconds
  const [remainingMs, setRemainingMs] = useState<number>(
    node.lockInMinutes * 60 * 1000,
  );
  const remainingRef = useRef<number>(remainingMs);
  useEffect(() => {
    remainingRef.current = remainingMs;
  }, [remainingMs]);

  // state for the server action
  const [isCompleting, startTransition] = useTransition();
  const { accessToken } = useAuth();

  // helpers to manage concurrency and avoid double-calls
  const completedCalledRef = useRef(false);
  const tickIntervalRef = useRef<number | null>(null);

  // Get user's current location
  const userLocation = useLocation();
  // session data for action and ui
  const { data: sessionAssets, refreshSessionAssets } = useMiningSessionAssets(
    node.id,
  );
  const sessionData = sessionAssets?.session;

  // Are we inside the allowed radius and allowed to run the timer?
  const withinRange =
    typeof distanceMeters === "number" &&
    distanceMeters <= allowedDistanceMeters &&
    miningState === MiningState.Pending;

  // finalize function that calls the server action exactly once
  const finalizeNow = useCallback(async () => {
    if (completedCalledRef.current) return;
    completedCalledRef.current = true;

    if (!accessToken || !sessionData?.id || !userLocation) {
      toast.error("Unauthorized");
      return;
    }

    try {
      const response = await completeMiningSession({
        accessToken,
        sessionId: sessionData.id,
        userLatitude: userLocation.latitude,
        userLongitude: userLocation.longitude,
      });
      if (response.success && response.data) {
        const { chamberBonus, finalShares } = response.data;
        toast.success("Mining session completed!", {
          description: (
            <div className="space-y-1 mt-2">
              <div className="flex justify-between text-sm">
                <span>Shares Earned:</span>
                <span className="text-cyan-400 font-bold">
                  +{finalShares} Shares
                </span>
              </div>

              {chamberBonus.hasBoost && (
                <div className="text-xs text-emerald-300 bg-emerald-950/10 p-2 rounded border border-emerald-700">
                  <div className="font-semibold">Echo Chamber Bonus!</div>
                  <div>
                    Level {chamberBonus.chamberLevel} Chamber boosted your
                    earnings by{" "}
                    {(chamberBonus.boostMultiplier * 100).toFixed(0)}%
                  </div>
                </div>
              )}
            </div>
          ),
          duration: 10000,
        });
        refreshSessionAssets();
        onComplete?.();
      } else {
        toast.error(response.error || "Failed to complete mining session");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to complete mining session");
    }
  }, [
    accessToken,
    refreshSessionAssets,
    sessionData?.id,
    onComplete,
    userLocation,
  ]);

  // Reset timer whenever a new pending mining session starts for this node
  useEffect(() => {
    if (miningState === MiningState.Pending) {
      setRemainingMs(node.lockInMinutes * 60 * 1000);
      completedCalledRef.current = false;
    }
  }, [node.id, miningState, node.lockInMinutes]);

  // Timer logic: runs only while withinRange and not already completing
  useEffect(() => {
    // if not in-range or we're completing or the timer is already finished -> pause
    if (!withinRange || isCompleting || remainingRef.current <= 0) {
      if (tickIntervalRef.current) {
        window.clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
      return;
    }

    // start a small-interval timer for snappy UI (250ms)
    tickIntervalRef.current = window.setInterval(() => {
      setRemainingMs((prev) => Math.max(prev - 250, 0));
    }, 250);

    return () => {
      if (tickIntervalRef.current) {
        window.clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
    };
  }, [withinRange, isCompleting]);

  // When timer reaches zero, call finalize
  useEffect(() => {
    if (
      remainingMs <= 0 &&
      !completedCalledRef.current &&
      miningState === MiningState.Pending
    ) {
      startTransition(() => {
        finalizeNow();
      });
    }
  }, [remainingMs, finalizeNow, miningState]);

  // UI helpers
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const totalMs = Math.max(1, node.lockInMinutes * 60 * 1000);
  const progress = 1 - remainingMs / totalMs;
  const progressPercentage = Math.max(
    0,
    Math.min(100, Math.floor(progress * 100)),
  );

  return (
    <Credenza open={true}>
      <CredenzaContent className="border-t-0">
        <CredenzaHeader className="text-center pb-2">
          <CredenzaTitle className="flex items-center justify-center gap-2 text-lg">
            {isCompleting ? (
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            ) : (
              <Zap className="h-5 w-5 text-yellow-500" />
            )}
            {isCompleting
              ? "Completing Mining Session"
              : "Active Mining Session"}
          </CredenzaTitle>
        </CredenzaHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* Mining Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>

          {/* Timer Display */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Timer className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-muted-foreground">
                Time Remaining
              </span>
            </div>
            <div className="text-3xl font-bold text-foreground font-mono">
              {formatTime(remainingMs)}
            </div>
            {sessionData?.echoTransmissionApplied && (
              <div className="text-xs text-green-600 mt-1">
                Accelerated timeline active
              </div>
            )}
          </div>

          {/* Session Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-lg p-3 text-center">
              <Coins className="h-4 w-4 text-yellow-500 mx-auto mb-1" />
              <div className="text-lg font-bold">
                {sessionData?.minerSharesEarned.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">Shares Earned</div>
            </div>
            <div className="bg-card rounded-lg p-3 text-center">
              <MapPin className="h-4 w-4 text-green-500 mx-auto mb-1" />
              <div className="text-lg font-bold">{node.name}</div>
              <div className="text-xs text-muted-foreground">
                Mining Location
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge
              variant="secondary"
              className="bg-green-500/10 text-green-700 border-green-500/20"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              {sessionData?.status}
            </Badge>
          </div>

          {/* Warning */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <p className="text-xs text-amber-700 text-center">
              Stay within range to complete your mining session. Moving away
              will cancel the session.
            </p>
          </div>
        </div>
      </CredenzaContent>
    </Credenza>
  );
}
