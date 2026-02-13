"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Zap, MapPin, TrendingDown } from "lucide-react";

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
import { Separator } from "@/components/ui/separator";
import type { DriftNodeWithCost, UserLocation } from "@/lib/schema/drift";
import { useAuth } from "@/components/shared/auth/auth-context";
import { useProfile } from "@/hooks/queries/use-profile";
import { getDriftCost, formatCostBreakdown } from "@/lib/drift/drift-cost";

interface DriftNodeDetailModalProps {
  node: DriftNodeWithCost | null;
  userLocation: UserLocation | null;
  nodeCountWithin10km: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DriftNodeDetailModal({
  node,
  userLocation,
  nodeCountWithin10km,
  open,
  onOpenChange,
}: DriftNodeDetailModalProps) {
  const [isExecuting, startTransition] = useTransition();
  const router = useRouter();
  const { accessToken } = useAuth();

  const { refreshProfile, data: profile } = useProfile();

  if (!node) return null;

  // Calculate cost breakdown
  const costResult = getDriftCost({
    driftCount: profile?.driftCount ?? 0,
    distance: node.distance,
    rarity: node.rarity,
    nodeCountWithin10km,
  });

  const breakdown = formatCostBreakdown(costResult.breakdown);
  const isDiscounted = costResult.breakdown.firstTimeDiscount > 0;

  const handleDrift = () => {
    if (!userLocation || !accessToken) return;

    startTransition(async () => {
      try {
        const result = await executeDrift({
          nodeId: node.id,
          accessToken,
          latitude: userLocation.lat,
          longitude: userLocation.lng,
        });

        if (result.success) {
          // Refresh profile
          refreshProfile();

          // Confetti animation
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { x: 0.5, y: 0.5 },
          });

          // Success feedback
          toast.success("🌌 Node Drifted!", {
            description: `Node summoned for ${costResult.cost} SP. Navigate to the new location!`,
          });

          // Close modal
          onOpenChange(false);

          // Redirect to node detail page
          router.push(`/nodes/${node.id}`);
        } else {
          toast.error("Drift Failed", {
            description: result.error || "Unable to summon node",
          });
        }
      } catch (error) {
        toast.error("Error", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });
  };

  return (
    <Credenza open={open} onOpenChange={onOpenChange}>
      <CredenzaContent className="max-w-md">
        <CredenzaHeader>
          <CredenzaTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Drift Node
          </CredenzaTitle>
          <CredenzaDescription>
            ID: {node.id.slice(0, 8)}... • {node.distance.toFixed(1)}km away
          </CredenzaDescription>
        </CredenzaHeader>

        <CredenzaBody className="space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Rarity and status */}
          <div className="flex items-center gap-2">
            <Badge variant="outline">{node.rarity}</Badge>
            {isDiscounted && (
              <Badge variant="secondary" className="gap-1">
                <TrendingDown className="h-3 w-3" />
                {(costResult.breakdown.firstTimeDiscount * 100).toFixed(0)}% Off
              </Badge>
            )}
            {(costResult.breakdown.densityMultiplier ?? 0) > 1 && (
              <Badge variant="outline">
                {costResult.breakdown.densityTier}
              </Badge>
            )}
          </div>

          {/* Cost breakdown */}
          <Card className="p-4 bg-muted/50">
            <h4 className="font-semibold text-sm mb-3">Cost Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Cost:</span>
                <span>{breakdown.baseCost}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Rarity Multiplier:
                </span>
                <span>{breakdown.rarityMultiplier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distance Factor:</span>
                <span>{breakdown.distanceFactor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Usage Penalty:</span>
                <span>{breakdown.usagePenalty}</span>
              </div>
              {(costResult.breakdown.densityMultiplier ?? 0) > 1 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Density Premium:
                  </span>
                  <span>{breakdown.densityMultiplier}</span>
                </div>
              )}
              {isDiscounted && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>First-Time Discount:</span>
                  <span className="font-semibold">
                    {breakdown.firstTimeDiscount}
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between font-bold text-base">
                <span>Total Cost:</span>
                <span className="text-primary">
                  {costResult.cost.toLocaleString()} SP
                </span>
              </div>
            </div>
          </Card>

          {/* Landing zone info */}
          <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="text-muted-foreground">
                Node will land{" "}
                <span className="font-semibold text-foreground">2-8km</span>{" "}
                from your location. You&apos;ll need to travel to reach it
                within the 7-day grace period.
              </p>
            </div>
          </div>

          {/* Affordability check */}
          {!node.canDrift && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">
                Insufficient sharePoints. You have{" "}
                {profile?.sharePoints.toLocaleString() ?? 0} SP, need{" "}
                {costResult.cost.toLocaleString()} SP.
              </p>
            </div>
          )}
        </CredenzaBody>

        <CredenzaFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDrift}
            disabled={!node.canDrift || isExecuting}
          >
            {isExecuting ? "Summoning..." : `Drift for ${costResult.cost} SP`}
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
