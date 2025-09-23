"use client";

import { useState, useEffect } from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  Timer,
  Zap,
  Coins,
  MapPin,
  Loader2,
  Radio,
  Sparkles,
  Clock,
} from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Node } from "@/lib/schema/node";
import { completeMiningSession } from "@/actions/mining/complete-mining-session";
import { useAuth } from "@/components/shared/auth/auth-context";
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
} from "@/components/credenza";
import { useMiningSessionAssets } from "@/hooks/queries/use-mining-session-assets";
import { getPiSDK } from "@/components/shared/pi/pi-sdk";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { applyEchoTransmission } from "@/actions/echo/apply-echo-transmission";
import { displayInterstitialAd, showRewardedAd } from "../_utils/pi-ads";

interface ActiveMiningDrawerProps {
  node: Node;
}

export function ActiveMiningDrawer({ node }: ActiveMiningDrawerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isPending, startTransition] = useTransition();
  const [isApplyingTransmission, startApplyingTransmission] = useTransition();

  const { accessToken } = useAuth();

  const { data: sessionAssets, refreshSessionAssets } = useMiningSessionAssets(
    node.id
  );
  const echoData = sessionAssets?.echoInfo;
  const sessionData = sessionAssets?.session;

  // Calculate time remaining based on lockInMinutes
  useEffect(() => {
    const lockInDurationMs = node.type.lockInMinutes * 60 * 1000;
    const startTime = Date.now();
    const endTime = startTime + lockInDurationMs;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setTimeRemaining(remaining);

      if (remaining === 0 && !isPending) {
        startTransition(async () => {
          if (!accessToken || !sessionData?.id) {
            toast.error("Unauthorized");
            return;
          }

          try {
            const response = await completeMiningSession({
              accessToken,
              sessionId: sessionData.id,
            });
            if (response.success) {
              toast.success("Mining session completed!");
              refreshSessionAssets();
            } else {
              toast.error(
                response.error || "Failed to complete mining session"
              );
            }
          } catch (error) {
            console.log(error);
            toast.error("Failed to complete mining session");
          }
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [
    node.type.lockInMinutes,
    sessionData?.id,
    accessToken,
    node.latitude,
    node.longitude,
    isPending,
    refreshSessionAssets,
  ]);

  // Handle Echo Transmission activation
  const handleEchoTransmission = (needsRecharge: boolean) => {
    if (!echoData || !accessToken) {
      return;
    }

    if (!sessionData) {
      return;
    }

    const sessionId = sessionData.id;

    startApplyingTransmission(async () => {
      try {
        // Check if Pi Ads SDK is available
        let adId: string | undefined;
        if (needsRecharge) {
          const piSdk = getPiSDK();
          const nativeFeaturesList = await piSdk.nativeFeaturesList();
          const adNetworkSupported = nativeFeaturesList.includes("ad_network");
          if (!adNetworkSupported) {
            toast.error(
              "Please update your Pi Browser to get echo transmissions"
            );
            return;
          }
          const isRewardedAdReady = await piSdk.Ads.isAdReady("rewarded");
          if (isRewardedAdReady.ready === false) {
            const adResponse = await displayInterstitialAd(piSdk);
            if (adResponse?.result === "AD_CLOSED") {
              adId = "interstitial";
            } else {
              toast.error("Failed to apply Echo Transmission");
              return;
            }
          } else {
            const adResponse = await showRewardedAd(piSdk);
            if (!!adResponse) {
              adId = adResponse;
            } else {
              toast.error("Failed to apply Echo Transmission");
              return;
            }
          }
        }

        const response = await applyEchoTransmission({
          accessToken: accessToken,
          sessionId,
          nodeId: node.id,
          adId,
        });

        if (response.success) {
          toast.success(
            response.error || "Echo Transmission channeled! Time accelerated."
          );
          if (!!response.data?.timeReduction) {
            const timeReduction = response.data.timeReduction;
            setTimeRemaining((timeRemaining) => {
              return Math.min(1, timeRemaining) * (1 - timeReduction / 100);
            });
          }
          refreshSessionAssets();
        } else {
          toast.error(response.error || "Failed to apply Echo Transmission");
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to load Echo Transmission");
      }
    });
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progressPercentage =
    ((node.type.lockInMinutes * 60 * 1000 - timeRemaining) /
      (node.type.lockInMinutes * 60 * 1000)) *
    100;

  // Check if Echo Transmission is available
  const canUseEchoTransmission =
    !!echoData &&
    echoData.status === "CHARGED" &&
    !echoData.usedNodeIds.includes(node.id) &&
    !sessionData?.echoTransmissionApplied &&
    timeRemaining > 1000;

  // Check if user needs to recharge
  const needsRecharge =
    !echoData ||
    echoData.status === "EXPIRED" ||
    echoData.status === "DEPLETED";

  return (
    <Credenza open={true}>
      <CredenzaContent className="border-t-0">
        <CredenzaHeader className="text-center pb-2">
          <CredenzaTitle className="flex items-center justify-center gap-2 text-lg">
            {isPending ? (
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            ) : (
              <Zap className="h-5 w-5 text-yellow-500" />
            )}
            {isPending ? "Completing Mining Session" : "Active Mining Session"}
          </CredenzaTitle>
        </CredenzaHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* Echo Transmission Section */}
          {!sessionData?.echoTransmissionApplied && (
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Radio className="h-5 w-5 text-purple-500" />
                <span className="font-medium text-purple-700">
                  Echo Resonator
                </span>
                <Badge
                  variant={
                    echoData?.status === "CHARGED" ? "default" : "secondary"
                  }
                  className={
                    echoData?.status === "CHARGED"
                      ? "bg-green-500/10 text-green-700 border-green-500/20"
                      : "bg-gray-500/10 text-gray-700"
                  }
                >
                  {echoData?.status || "EXPIRED"}
                </Badge>
              </div>

              {canUseEchoTransmission ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Channel temporal frequencies to reduce mining time by{" "}
                    {echoData.maxTimeReduction}%
                  </p>
                  <Button
                    onClick={() => handleEchoTransmission(false)}
                    disabled={isApplyingTransmission}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {isApplyingTransmission ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Channeling Transmission...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Channel Echo Transmission
                      </>
                    )}
                  </Button>
                </div>
              ) : needsRecharge ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Your Echo Resonator needs recalibration through cosmic
                    transmissions
                  </p>
                  <Button
                    onClick={() => handleEchoTransmission(true)}
                    disabled={isApplyingTransmission}
                    variant="outline"
                    className="w-full"
                  >
                    {isApplyingTransmission ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Recharging Resonator...
                      </>
                    ) : (
                      <>
                        <Radio className="h-4 w-4 mr-2" />
                        Recharge Echo Resonator
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {echoData?.usedNodeIds.includes(node.id)
                      ? "This Node's temporal signature has been locked by your previous transmission."
                      : "Echo Transmission already applied to this session."}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Echo Transmission Applied Indicator */}
          {sessionData?.echoTransmissionApplied && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Echo Transmission Active - Time Accelerated by{" "}
                  {sessionData.timeReductionPercent}%
                </span>
              </div>
            </div>
          )}

          {/* Mining Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>

          {/* Timer Display */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Timer className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-muted-foreground">
                Time Remaining
              </span>
            </div>
            <div className="text-3xl font-bold text-foreground font-mono">
              {formatTime(timeRemaining)}
            </div>
            {sessionData?.echoTransmissionApplied && (
              <div className="text-xs text-green-600 mt-1">
                Accelerated timeline active
              </div>
            )}
          </div>

          {/* Session Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-lg p-3 text-center">
              <Coins className="h-4 w-4 text-yellow-500 mx-auto mb-1" />
              <div className="text-lg font-bold">
                {sessionData?.minerSharesEarned.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">Shares Earned</div>
            </div>
            <div className="bg-card rounded-lg p-3 text-center">
              <MapPin className="h-4 w-4 text-green-500 mx-auto mb-1" />
              <div className="text-lg font-bold">{node.type.name}</div>
              <div className="text-xs text-muted-foreground">
                Mining Location
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge
              variant="secondary"
              className="bg-green-500/10 text-green-700 border-green-500/20"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              {sessionData?.status}
            </Badge>
          </div>

          {/* Warning */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <p className="text-xs text-amber-700 text-center">
              Stay within range to complete your mining session. Moving away
              will cancel the session.
            </p>
          </div>
        </div>
      </CredenzaContent>
    </Credenza>
  );
}
