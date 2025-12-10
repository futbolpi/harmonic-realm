"use client";
import { useCallback, useMemo, useState } from "react";
import confetti from "canvas-confetti";

import { MiningState } from "@/lib/schema/mining-session";
import { useLocation } from "./use-location";
import { useProfile } from "./queries/use-profile";

type TutorialStage = "ELIGIBLE" | "MINING" | "TUNING";

export function useTutorial() {
  const [tutorialStage, setTutorialStage] = useState<TutorialStage>("ELIGIBLE");
  // Get user's current location
  const userLocation = useLocation();
  // Get User Profile
  const profileQuery = useProfile();

  // Memoize mining state determination
  // loading,eligible,pending,tune,nodeClosed
  const miningState = useMemo(() => {
    if (profileQuery.isLoading) return MiningState.Loading;
    if (profileQuery.isError) return MiningState.Error;

    // Location checks
    if (!userLocation) return MiningState.NoLocation;

    if (profileQuery.data) {
      if (!profileQuery.data.hasCompletedTutorial && tutorialStage === "MINING")
        return MiningState.Pending;
      if (!profileQuery.data.hasCompletedTutorial && tutorialStage === "TUNING")
        return MiningState.Tune;
      if (profileQuery.data.hasCompletedTutorial) return MiningState.Completed;
    }

    return MiningState.Eligible;
  }, [
    profileQuery.data,
    profileQuery.isError,
    profileQuery.isLoading,
    tutorialStage,
    userLocation,
  ]);

  const onCompleteMining = useCallback(async () => {
    const end = Date.now() + 3 * 1000; // 3 seconds
    const scalar = 2;
    const pineapple = confetti.shapeFromText({
      text: "⚡",
      scalar,
    });
    const frame = () => {
      if (Date.now() > end) return;
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        scalar,
        shapes: [pineapple],
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        scalar,
        shapes: [pineapple],
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
      });
      requestAnimationFrame(frame);
    };
    frame();
    // Wait for confetti animation to complete (3 second)
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setTutorialStage("TUNING");
  }, []);

  return {
    miningState,
    distance: userLocation ? 0 : null,
    showStartModal: miningState === MiningState.Eligible,
    showMiningModal: miningState === MiningState.Pending,
    showTuningModal: miningState === MiningState.Tune,
    onCompleteMining,
    onStartMining: () => setTutorialStage("MINING"),
  };
}
