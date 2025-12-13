"use client";

import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useTransition,
} from "react";
import { Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { toast } from "sonner";

import { executeDrift } from "@/actions/drifts/execute";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "@/components/credenza";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DriftNodeWithCost, UserLocation } from "@/lib/schema/drift";
import { useAuth } from "@/components/shared/auth/auth-context";
import { useProfile } from "@/hooks/queries/use-profile";
import { rarityMultipliers } from "@/config/drift";
import { getDriftCost } from "@/lib/drift/drift-cost";

type Props = {
  showNodeDetailModal: boolean;
  setShowNodeDetailModal: Dispatch<SetStateAction<boolean>>;
  selectedNode: DriftNodeWithCost | null;
  userLocation: UserLocation | null;
};

const NodeDetailModal = ({
  setShowNodeDetailModal,
  showNodeDetailModal,
  selectedNode,
  userLocation,
}: Props) => {
  const [isExecuting, startTransition] = useTransition();
  const router = useRouter();

  const { accessToken } = useAuth();
  const { refreshProfile } = useProfile();

  const discountPrice = selectedNode
    ? getDriftCost({
        driftCount: 0,
        distance: selectedNode.distance,
        rarity: selectedNode.rarity,
      })
    : null;

  const isDiscounted = selectedNode && discountPrice === selectedNode.cost;

  // Play success animation with confetti and energy beam
  const playDriftAnimation = useCallback(async () => {
    // Confetti burst at center of screen
    if (typeof window !== "undefined") {
      const x = window.innerWidth / 2;
      const y = window.innerHeight / 2;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: x / window.innerWidth, y: y / window.innerHeight },
      });
    }

    // Wait for animation to complete
    await new Promise((resolve) => setTimeout(resolve, 800));
  }, []);

  // Execute drift action
  const handleConfirmDrift = () => {
    startTransition(async () => {
      if (!selectedNode || !userLocation || !accessToken) return;

      try {
        const result = await executeDrift({
          nodeId: selectedNode.id,
          accessToken,
          latitude: userLocation.lat,
          longitude: userLocation.lng,
        });

        if (result.success) {
          // refresh profile
          refreshProfile();

          // Play animation
          await playDriftAnimation();

          // Close modal and show success
          setShowNodeDetailModal(false);
          toast.success("🌌 Node drifted! Explore your new vicinity.");

          // Navigate to node detail
          router.push(`/nodes/${selectedNode.id}`);
        } else {
          toast.error(result.error || "Failed to drift to node");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unknown error");
      }
    });
  };

  return (
    <Credenza open={showNodeDetailModal} onOpenChange={setShowNodeDetailModal}>
      <CredenzaContent className="p-4">
        <CredenzaHeader>
          <CredenzaTitle>
            {selectedNode && (
              <div className="flex items-center gap-2">
                <span>Node {selectedNode.id.slice(0, 8)}</span>
                <Badge>{selectedNode.rarity}</Badge>{" "}
                {isDiscounted ? (
                  <Badge variant="outline">First-drift discount</Badge>
                ) : (
                  <Badge variant="default">Standard pricing</Badge>
                )}{" "}
              </div>
            )}
          </CredenzaTitle>
          <CredenzaDescription>
            {selectedNode && `${selectedNode.distance.toFixed(1)} km away`}
          </CredenzaDescription>
        </CredenzaHeader>

        {selectedNode && (
          <CredenzaBody className="space-y-4">
            <Card className="p-4 bg-muted/50">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base Cost:</span>
                  <span>200 SP</span>
                </div>
                {isDiscounted && discountPrice && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>First-drift Discount:</span>
                    <span className="font-semibold">
                      Applied (Base reduced to {discountPrice.toFixed(2)} SP)
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Rarity Multiplier:</span>
                  <span>{rarityMultipliers[selectedNode.rarity]}x</span>
                </div>
                <div className="flex justify-between">
                  <span>Distance Factor:</span>
                  <span>
                    {(1 + (selectedNode.distance / 100) * 0.5).toFixed(2)}×
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Drift Cost:</span>
                  <span className="text-lg">
                    {selectedNode.cost.toLocaleString()} SP
                  </span>
                </div>
              </div>
            </Card>
          </CredenzaBody>
        )}

        <CredenzaFooter>
          <Button
            variant="outline"
            onClick={() => setShowNodeDetailModal(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDrift}
            disabled={!selectedNode?.canDrift || isExecuting}
            className="gap-2"
          >
            {isExecuting ? (
              <>Executing...</>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Confirm Drift
              </>
            )}
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
};

export default NodeDetailModal;
