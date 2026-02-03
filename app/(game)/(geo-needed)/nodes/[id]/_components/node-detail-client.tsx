"use client";

import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { ArrowLeft, Crown } from "lucide-react";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Node } from "@/lib/schema/node";
import { useMiningLogic } from "@/hooks/queries/use-mining-logic";
import { MINING_RANGE_METERS } from "@/config/site";
import { formatBoostPercentage } from "@/lib/utils/chambers";
import { NodeDetailMap } from "./node-detail-map";
import { StartMiningDrawer } from "./start-mining-drawer";
import { ActiveMiningDrawer } from "./active-mining-drawer";
import { getFeedbackMessage } from "../_utils/feedback-message";
import { ResonanceTuningModal } from "./tuning-modal";
import { useMiningSessionAssets } from "@/hooks/queries/use-mining-session-assets";

interface NodeDetailClientProps {
  node: Node;
}

export function NodeDetailClient({ node }: NodeDetailClientProps) {
  const router = useRouter();
  const { data } = useMiningSessionAssets(node.id);

  // Fetch mining session data with range validation
  const {
    showStartModal,
    showMiningModal,
    distance,
    miningState,
    showTuningModal,
  } = useMiningLogic({
    completedSessions: node.sessions.length,
    isOpenForMining: node.openForMining,
    maxSessions: node.type.maxMiners,
    nodeId: node.id,
    nodeLocation: { latitude: node.latitude, longitude: node.longitude },
    allowedDistanceMeters: MINING_RANGE_METERS,
  });

  // Check for active chamber bonus

  const isInRange = distance !== null && distance <= MINING_RANGE_METERS;
  const feedback = getFeedbackMessage({
    miningState,
    distanceMeters: distance,
    allowedDistanceMeters: MINING_RANGE_METERS,
  });

  const onComplete = useCallback(() => {
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
  }, []);

  return (
    <div className="relative bg-background">
      {/* Back button overlay */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => router.back()}
          className="shadow-lg"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Distance & Chamber Bonus indicators */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
        {/* Distance indicator */}
        {distance !== null && (
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium shadow-lg ${
              isInRange
                ? "bg-green-500/90 text-white"
                : "bg-red-500/90 text-white"
            }`}
          >
            {distance < 1000
              ? `${distance}m`
              : `${(distance / 1000).toFixed(1)}km`}
          </div>
        )}

        {/* Chamber bonus indicator */}
        {isInRange && data?.chamberBonus?.hasBoost && (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-2.5 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Crown className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-xs font-semibold text-purple-400">
                Echo Chamber Active
              </span>
            </div>
            <p className="text-xs text-purple-300 mt-1">
              Level {data.chamberBonus.chamberLevel} •{" "}
              {formatBoostPercentage(data.chamberBonus.chamberLevel || 1)} Boost
            </p>
          </div>
        )}
      </div>

      {/* Main map component */}
      <NodeDetailMap node={node} />

      {/* Active mining session drawer - only shown when user is in range with active session */}
      {showMiningModal && (
        <ActiveMiningDrawer
          distanceMeters={distance}
          miningState={miningState}
          node={{
            id: node.id,
            lockInMinutes: node.type.lockInMinutes,
            name: node.name,
          }}
          allowedDistanceMeters={MINING_RANGE_METERS}
          onComplete={onComplete}
        />
      )}

      {/* Start mining drawer - only shown when user can mine */}

      {showStartModal && <StartMiningDrawer node={node} />}
      {/* Start tuning drawer - only shown when user can tune */}
      <ResonanceTuningModal
        isOpen={isInRange && showTuningModal}
        nodeId={node.id}
        nodeFrequencySeed={node.echoIntensity ?? 1}
        nodeRarity={node.type.rarity}
        isSponsored={!!node.sponsor}
      />

      {/* can't mine info */}
      {feedback && (
        <div className="absolute bottom-20 left-4 right-4 z-10">
          <div className="bg-card text-card-foreground p-3 rounded-lg shadow-lg text-center">
            <p className="text-xs opacity-90">{feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
}
