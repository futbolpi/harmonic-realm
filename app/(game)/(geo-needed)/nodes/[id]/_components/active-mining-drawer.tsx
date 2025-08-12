"use client";

import { useState, useEffect } from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Timer, Zap, Coins, MapPin, Loader2 } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Node } from "@/lib/schema/node";
import { useMiningSession } from "@/hooks/queries/use-mining-session";
import { completeMiningSession } from "@/actions/mining/complete-mining-session";
import { useAuth } from "@/components/shared/auth/auth-context";
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
} from "@/components/credenza";

interface ActiveMiningDrawerProps {
  node: Node;
}

export function ActiveMiningDrawer({ node }: ActiveMiningDrawerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isPending, startTransition] = useTransition();

  const { data: sessionData, refreshSession } = useMiningSession({
    nodeId: node.id,
    nodeLocation: { latitude: node.latitude, longitude: node.longitude },
  });
  const { accessToken } = useAuth();

  // Calculate time remaining based on lockInMinutes
  useEffect(() => {
    const lockInDurationMs = node.type.lockInMinutes * 60 * 1000;
    const startTime = Date.now();
    const endTime = startTime + lockInDurationMs;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setTimeRemaining(remaining);

      if (remaining === 0) {
        startTransition(async () => {
          if (!accessToken || !sessionData?.session) {
            toast.error("Unauthorized");
            return;
          }

          try {
            await completeMiningSession({
              accessToken,
              sessionId: sessionData.session.id,
            });
            toast.success("Mining session completed!");
            refreshSession();
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
    refreshSession,
    sessionData?.session?.id,
    accessToken,
    sessionData?.session,
  ]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progressPercentage =
    ((node.type.lockInMinutes * 60 * 1000 - timeRemaining) /
      (node.type.lockInMinutes * 60 * 1000)) *
    100;

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
          </div>

          {/* Session Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-lg p-3 text-center">
              <Coins className="h-4 w-4 text-yellow-500 mx-auto mb-1" />
              <div className="text-lg font-bold">
                {sessionData?.session?.sharesEarned.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">Shares Earned</div>
            </div>
            <div className="bg-card rounded-lg p-3 text-center">
              <MapPin className="h-4 w-4 text-green-500 mx-auto mb-1" />
              <div className="text-lg font-bold">
                {node.type?.name || "Node"}
              </div>
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
              {sessionData?.session?.status}
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
