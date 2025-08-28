"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Coins, Sparkles } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/shared/auth/auth-context";
import { initiateLocationLoreStaking } from "@/actions/location-lore/initiate-staking";
import {
  CONTRIBUTION_TIERS,
  LORE_LEVELS,
  LoreLevel,
} from "@/lib/node-lore/location-lore";

interface LoreStakingDialogProps {
  nodeId: string;
  targetLevel: number;
  currentStaked: number;
  trigger?: React.ReactNode;
}

export function LoreStakingDialog({
  nodeId,
  targetLevel,
  currentStaked,
  trigger,
}: LoreStakingDialogProps) {
  const [piAmount, setPiAmount] = useState("");
  const [isLoading, startTransition] = useTransition();
  const [open, onOpenChange] = useState(false);
  const router = useRouter();

  const { accessToken, isAuthenticated } = useAuth();

  const defaultTrigger = (
    <Button className="game-button" size="sm">
      <Coins className="h-4 w-4 mr-2" />
      Contribute
    </Button>
  );

  const levelConfig = LORE_LEVELS[targetLevel as LoreLevel];
  const stillNeeded = Math.max(
    0,
    (levelConfig.totalRequired || levelConfig.piRequired) - currentStaked
  );
  const suggestedAmount = Math.min(stillNeeded, 1.0);

  const getContributionTier = (amount: number) => {
    const tierValues = Object.values(CONTRIBUTION_TIERS);
    return (
      tierValues
        .slice()
        .reverse()
        .find((tier) => amount >= tier.minPi) ||
      CONTRIBUTION_TIERS["ECHO_SUPPORTER"]
    );
  };

  const currentTier = piAmount
    ? getContributionTier(Number.parseFloat(piAmount) || 0)
    : null;

  const handleStake = () => {
    startTransition(async () => {
      if (!isAuthenticated || !accessToken) {
        toast.error("Please log in to contribute Pi");
        return;
      }
      try {
        const amount = Number.parseFloat(piAmount);
        const response = await initiateLocationLoreStaking({
          accessToken,
          nodeId,
          targetLevel,
          piAmount: amount,
        });

        if (!response.success) {
          toast.error(response.error || "Failed to initiate staking");
          return;
        }
        onOpenChange(false);
        setPiAmount("");
        if (response.data) {
          // Redirect to the stake detail page
          toast.success(`Proceed to make payment for ${response.data.memo}`);
          router.push(`/lore-stakes/${response.data.stakeId}`);
        }
      } catch (error) {
        console.error("Staking failed:", error);
        toast.error(error instanceof Error ? error.message : "Staking failed");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Contribute to the Story
          </DialogTitle>
          <DialogDescription>
            Help unlock &quot;{levelConfig.name}&quot; by contributing Pi to
            this location&apos;s narrative awakening.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Level Info Card */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {targetLevel}
                </div>
                <div>
                  <h3 className="font-semibold">{levelConfig.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {stillNeeded.toFixed(1)} Pi still needed
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {levelConfig.description}
              </p>
            </CardContent>
          </Card>

          {/* Pi Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="pi-amount">Pi Amount</Label>
            <div className="relative">
              <Input
                id="pi-amount"
                type="number"
                placeholder={`${suggestedAmount}`}
                value={piAmount}
                onChange={(e) => setPiAmount(e.target.value)}
                min="0.1"
                max={stillNeeded}
                step="0.1"
                className="pr-12"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                Pi
              </div>
            </div>
            <div className="flex gap-2">
              {stillNeeded >= 0.5 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPiAmount("0.5")}
                >
                  0.5 Pi
                </Button>
              )}
              {stillNeeded >= 1.0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPiAmount("1.0")}
                >
                  1.0 Pi
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPiAmount(stillNeeded.toString())}
              >
                Complete ({stillNeeded.toFixed(1)} Pi)
              </Button>
            </div>
          </div>

          {/* Contribution Tier */}
          {currentTier && (
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <currentTier.icon
                    className={cn("h-4 w-4", currentTier.color)}
                  />
                  <span className="font-medium">Recognition Tier:</span>
                  <Badge variant="outline" className={currentTier.color}>
                    {currentTier.name}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Your contribution will be recognized in the location&apos;s
                  lore as a {currentTier.name}.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStake}
              disabled={
                !piAmount || Number.parseFloat(piAmount) < 0.1 || isLoading
              }
              className="flex-1 game-button"
            >
              {isLoading ? (
                "Processing..."
              ) : (
                <>
                  <Coins className="h-4 w-4 mr-2" />
                  Contribute {piAmount} Pi
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
