"use client";

import { Navigation } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DriftStatus } from "@/lib/schema/drift";

type Props = {
  driftStatus: DriftStatus;
  handleFindMe: () => void;
  locationLoading: boolean;
};

const EmptyState = ({ driftStatus, handleFindMe, locationLoading }: Props) => {
  if (driftStatus === DriftStatus.NO_LOCATION) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-40">
        <div className="text-center space-y-4 max-w-md p-6">
          <div className="text-6xl">📍</div>
          <h3 className="text-xl font-semibold">Location Required</h3>
          <p className="text-muted-foreground">
            Enable location access to explore drift opportunities in your area.
          </p>
          <Button
            onClick={handleFindMe}
            size="lg"
            className="gap-2"
            disabled={locationLoading}
          >
            <Navigation className="h-4 w-4" />
            Enable Location
          </Button>
        </div>
      </div>
    );
  }

  if (driftStatus === DriftStatus.NO_ELIGIBLE_NODES) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-40">
        <div className="text-center space-y-4 max-w-md p-6">
          <div className="text-6xl">🌌</div>
          <h3 className="text-xl font-semibold">No Dormant Nodes</h3>
          <p className="text-muted-foreground">
            No eligible nodes found within 100km. Nodes must be inactive for 7+
            days and not recently drifted.
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default EmptyState;
