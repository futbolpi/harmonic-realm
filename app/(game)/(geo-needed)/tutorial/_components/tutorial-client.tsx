"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Node } from "@/lib/schema/node";
import { MINING_RANGE_METERS } from "@/config/site";
import { useTutorial } from "@/hooks/use-tutorial";
import { useLocation } from "@/hooks/use-location";
import { TutorialMiningDrawer } from "./tutorial-mining-drawer";
import { TutorialDetailMap } from "./tutorial-detail-map";
import { StartTutorialDrawer } from "./start-tutorial-drawer";
import { TutorialTuningModal } from "./tutorial-tuning-modal";
import { NoLocationComponent } from "./no-location-component";

interface TutorialClientProps {
  node: Node;
}

export function TutorialClient({ node }: TutorialClientProps) {
  const router = useRouter();

  // Fetch mining session data with range validation
  const {
    showStartModal,
    showMiningModal,
    distance,
    miningState,
    showTuningModal,
    onCompleteMining,
    onStartMining,
  } = useTutorial();
  const userLocation = useLocation();

  const isInRange = distance !== null && distance <= MINING_RANGE_METERS;

  // If no location, show location prompt
  if (!userLocation) {
    return (
      <NoLocationComponent onLocationGranted={() => window.location.reload()} />
    );
  }

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

      {/* Distance indicator */}
      {distance !== null && (
        <div className="absolute top-4 right-4 z-10">
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
        </div>
      )}

      {/* Main map component */}
      <TutorialDetailMap
        node={{ name: node.name }}
        userLocation={userLocation}
      />

      {/* Active mining session drawer - only shown when user is in range with active session */}
      {showMiningModal && (
        <TutorialMiningDrawer
          distanceMeters={distance}
          miningState={miningState}
          node={{
            id: node.id,
            lockInMinutes: node.type.lockInMinutes,
            name: node.name,
          }}
          allowedDistanceMeters={MINING_RANGE_METERS}
          onComplete={onCompleteMining}
        />
      )}

      {/* Start mining drawer - only shown when user can mine */}

      {showStartModal && (
        <StartTutorialDrawer
          node={node}
          onStartMining={onStartMining}
          distance={distance}
          miningState={miningState}
        />
      )}
      {/* Start tuning drawer - only shown when user can tune */}
      <TutorialTuningModal
        isOpen={showTuningModal}
        nodeFrequencySeed={node.echoIntensity ?? 1}
      />

      {/* can't mine info */}

      <div className="absolute bottom-20 left-4 right-4 z-10">
        <div className="bg-card text-card-foreground p-3 rounded-lg shadow-lg text-center">
          <p className="text-xs opacity-90">
            Practice mining and tuning without leaving home.
          </p>
        </div>
      </div>
    </div>
  );
}
