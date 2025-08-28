"use client";

import { useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Coins,
  ArrowLeft,
  Sparkles,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { piPayment } from "@/lib/pi/pi-payment";
import { Badge } from "@/components/ui/badge";
import { useLoreStake } from "@/hooks/queries/use-lore-stake";
import { LORE_LEVELS, LoreLevel } from "@/lib/node-lore/location-lore";
import StakeLoading from "./stake-loading";
import StakeError from "./stake-error";
import StakeNotFound from "./stake-not-found";

interface StakeDetailProps {
  stakeId: string;
}

export default function LoreStakeDetailClient({ stakeId }: StakeDetailProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Use the custom hook to fetch stake details
  const {
    data: stakeDetails,
    isLoading,
    isError,
    error,
    refreshStake,
  } = useLoreStake(stakeId);

  useEffect(() => {
    // Initialize Pi SDK
    const initPi = async () => {
      try {
        await piPayment.initializePiSDK();
      } catch (error) {
        console.error("Failed to initialize Pi SDK:", error);
        toast.error("Failed to initialize payment system");
      }
    };

    initPi();
  }, []);

  const handlePayment = () => {
    if (!stakeDetails) return;

    startTransition(async () => {
      try {
        await piPayment.createLocationLorePayment(
          stakeDetails.nodeId,
          stakeDetails.targetLevel,
          stakeDetails.piAmount.toNumber()
        );

        // The payment flow is handled by Pi SDK callbacks
        // Refresh the stake details after a short delay to check for updates
        setTimeout(() => {
          refreshStake();
        }, 60000);
      } catch (error) {
        console.error("Payment failed:", error);
        toast.error("Payment failed. Please try again.");
      }
    });
  };

  const getStatusDisplay = () => {
    if (!stakeDetails) return null;

    switch (stakeDetails.paymentStatus) {
      case "COMPLETED":
        return (
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle className="h-5 w-5" />
            <span>Payment Completed</span>
          </div>
        );
      case "FAILED":
        return (
          <div className="flex items-center gap-2 text-red-500">
            <XCircle className="h-5 w-5" />
            <span>Payment Failed</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-amber-500">
            <Sparkles className="h-5 w-5" />
            <span>Payment Pending</span>
          </div>
        );
    }
  };

  // Get level name from the level number
  const getLevelName = (level: number) => {
    return LORE_LEVELS[level as LoreLevel]?.name || `Level ${level}`;
  };

  if (isLoading) {
    return <StakeLoading />;
  }

  if (isError) {
    return <StakeError errorMessage={error.message} />;
  }

  if (!stakeDetails) {
    return <StakeNotFound />;
  }

  return (
    <div className="container max-w-md mx-auto p-4">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push(`/nodes/${stakeDetails.nodeId}/lore`)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Node
      </Button>

      <Card className="border-primary/20 bg-card/95 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Lore Contribution
          </CardTitle>
          <CardDescription>
            Complete your payment to contribute to the node&apos;s story
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg bg-primary/5 p-4 border border-primary/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Level Target:</span>
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  {stakeDetails.targetLevel}
                </div>
                <span className="font-medium">
                  {getLevelName(stakeDetails.targetLevel)}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Contribution:</span>
              <div className="flex items-center gap-1">
                <Coins className="h-4 w-4 text-amber-500" />
                <span className="font-medium">
                  {stakeDetails.piAmount.toString()} Pi
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Recognition:</span>
              <Badge variant="secondary" className="text-purple-500">
                {stakeDetails.contributionTier?.replace("_", " ") ||
                  "Echo Supporter"}
              </Badge>
            </div>
          </div>

          <div className="rounded-lg bg-accent/5 p-4 border border-accent/10">
            <h3 className="font-medium mb-2">Payment Status</h3>
            {getStatusDisplay()}
          </div>
        </CardContent>

        <CardFooter>
          {stakeDetails.paymentStatus === "PENDING" ? (
            <Button
              onClick={handlePayment}
              disabled={isPending}
              className="w-full game-button"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Coins className="h-4 w-4 mr-2" />
              )}
              {isPending ? "Processing..." : `Pay ${stakeDetails.piAmount} Pi`}
            </Button>
          ) : stakeDetails.paymentStatus === "COMPLETED" ? (
            <Button
              onClick={() => router.push(`/nodes/${stakeDetails.nodeId}/lore`)}
              className="w-full game-button"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Node Lore
            </Button>
          ) : (
            <Button
              onClick={handlePayment}
              disabled={isPending}
              className="w-full game-button"
            >
              <Coins className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
