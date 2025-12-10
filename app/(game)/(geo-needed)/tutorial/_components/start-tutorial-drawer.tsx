"use client";

import { useTransition } from "react";
import { Loader2, Play, Zap, Clock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Node } from "@/lib/schema/node";
import {
  Credenza,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaContent,
} from "@/components/credenza";
import { MINING_RANGE_METERS } from "@/config/site";
import { MiningState } from "@/lib/schema/mining-session";
import { getRarityInfo } from "@/app/(game)/map/utils";
import { getFeedbackMessage } from "../../nodes/[id]/_utils/feedback-message";

interface StartTutorialDrawerProps {
  node: Node;
  onStartMining: () => void;
  miningState: MiningState;
  distance: number | null;
}

export function StartTutorialDrawer({
  node,
  onStartMining,
  distance,
  miningState,
}: StartTutorialDrawerProps) {
  const [isPending, startTransition] = useTransition();

  const feedback = getFeedbackMessage({
    miningState,
    distanceMeters: distance,
    allowedDistanceMeters: MINING_RANGE_METERS,
  });

  const onSubmit = () => {
    startTransition(() => {
      onStartMining();
      toast.success("Mining session started successfully!");
    });
  };

  const estimatedYield = (
    node.type.baseYieldPerMinute * node.type.lockInMinutes
  ).toFixed(1);

  return (
    <Credenza open={true}>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Start Mining Session
          </CredenzaTitle>
        </CredenzaHeader>

        <div className="p-4 space-y-6">
          {/* Node info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-white",
                getRarityInfo(node.type?.rarity || 1).color
              )}
            >
              <span className="text-lg">
                {node.type?.iconUrl?.includes("text=")
                  ? node.type.iconUrl.split("text=")[1]
                  : "⛏️"}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">
                  {node.type?.name || "Mining Node"}
                </h3>
                <Badge
                  className={cn(
                    "text-white text-xs",
                    getRarityInfo(node.type.rarity).color
                  )}
                >
                  {node.type.rarity}
                </Badge>
              </div>
              {node.sponsor && (
                <Badge
                  variant="outline"
                  className="text-xs text-green-500 border-green-500/50 mt-1"
                >
                  {node.sponsor}
                </Badge>
              )}
            </div>
          </div>

          {/* Yield preview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/20">
              <Zap className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-yellow-500">
                {estimatedYield} Shares
              </div>
              <div className="text-xs text-muted-foreground">
                Estimated Yield
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/20">
              <Clock className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-blue-500">
                {node.type.lockInMinutes}
              </div>
              <div className="text-xs text-muted-foreground">Minutes</div>
            </div>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full"
            onClick={onSubmit}
            disabled={miningState !== MiningState.Eligible || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting Session...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start Mining ({estimatedYield}⚡︎)
              </>
            )}
          </Button>

          {miningState !== MiningState.Eligible && feedback && (
            <p className="text-sm text-muted-foreground text-center">
              {feedback}
            </p>
          )}
        </div>
      </CredenzaContent>
    </Credenza>
  );
}
