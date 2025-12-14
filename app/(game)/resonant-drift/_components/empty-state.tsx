"use client";

import React, { type Dispatch, type SetStateAction } from "react";
import { useRouter } from "next/navigation";

import type { StatusInfo } from "@/lib/schema/drift";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const EmptyState = ({
  setShowInfoModal,
  statusInfo,
}: {
  setShowInfoModal: Dispatch<SetStateAction<boolean>>;
  statusInfo?: StatusInfo;
}) => {
  const router = useRouter();

  return (
    <div className="absolute inset-0 flex items-center justify-center z-15 bg-black/40">
      <Card className="w-full max-w-sm text-center p-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-full h-9 w-9 flex items-center justify-center text-white shadow-sm">
            🌌
          </div>
          <div className="text-left">
            <h2 className="text-lg font-semibold">
              {statusInfo?.text ?? "No Dormant Nodes Detected"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {statusInfo
                ? `Status: ${statusInfo.icon} ${statusInfo.text}`
                : "Try exploring beyond 10km to find drift targets"}
            </p>
          </div>
        </div>

        <ul className="text-sm text-muted-foreground space-y-2 my-3 text-left">
          <li>• Node not tuned for 7+ days</li>
          <li>• Not sponsored or lore-staked</li>
          <li>• Pioneer must be outside 10km of existing nodes</li>
          <li>• Pioneer must have sufficient sharepoints to drift</li>
          <li>
            • Pioneer must not be on cooldown — wait 72 hours after a drift
          </li>
          {statusInfo?.variant === "secondary" && (
            <li className="text-xs text-muted-foreground">
              • {statusInfo.text}
            </li>
          )}
        </ul>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/map")}
          >
            Explore World
          </Button>
          <Button className="flex-1" onClick={() => setShowInfoModal(true)}>
            Learn More
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default EmptyState;
