"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Node } from "@/lib/schema/node";
import { useLocation } from "@/hooks/use-location";
import { useMiningSession } from "@/hooks/queries/use-mining-session";
import { NodeDetailMap } from "./node-detail-map";
import { StartMiningDrawer } from "./start-mining-drawer";
import { ActiveMiningDrawer } from "./active-mining-drawer";
import { CompletedSessionDrawer } from "./completed-session-drawer";

interface NodeDetailClientProps {
  node: Node;
}

export function NodeDetailClient({ node }: NodeDetailClientProps) {
  const router = useRouter();

  const userLocation = useLocation();
  // Fetch mining session data with range validation
  const {
    data: sessionData,
    isInRange,
    distance,
  } = useMiningSession({
    nodeId: node.id,
    nodeLocation: {
      latitude: node.latitude,
      longitude: node.longitude,
    },
  });

  const showActiveDrawer =
    isInRange && sessionData?.session?.status === "ACTIVE";
  const showStartDrawer =
    isInRange && sessionData?.canMine && !sessionData?.session;
  const showOutOfRangeInfo = !isInRange && !!userLocation;

  return (
    <div className="relative h-screen bg-background">
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
              ? `${Math.round(distance)}m`
              : `${(distance / 1000).toFixed(1)}km`}
          </div>
        </div>
      )}

      {/* Main map component */}
      <NodeDetailMap node={node} />

      {/* Active mining session drawer - only shown when user is in range with active session */}
      {showActiveDrawer && <ActiveMiningDrawer node={node} />}

      {/* Start mining drawer - only shown when user can mine */}
      {showStartDrawer && <StartMiningDrawer node={node} />}

      {/* Completed session drawer */}
      <CompletedSessionDrawer />

      {/* Out of range indicator */}
      {showOutOfRangeInfo && (
        <div className="absolute bottom-20 left-4 right-4 z-10">
          <div className="bg-amber-500/90 text-white p-3 rounded-lg shadow-lg text-center">
            <p className="text-sm font-medium">Move closer to start mining</p>
            <p className="text-xs opacity-90">
              You need to be within 100m of the node
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
