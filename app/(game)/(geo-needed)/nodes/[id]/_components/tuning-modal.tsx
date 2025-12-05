"use client";

import React, { useRef, useEffect, useState, useTransition } from "react";
import { Loader2, Waves, Trophy } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { NodeTypeRarity } from "@/lib/generated/prisma/enums";
import { submitTuningSession } from "@/actions/tuning-sessions/complete";
import { useAuth } from "@/components/shared/auth/auth-context";
import { useMiningSessionAssets } from "@/hooks/queries/use-mining-session-assets";
import { getRarityInfo } from "@/app/(game)/map/utils";
import { useLocation } from "@/hooks/use-location";
import {
  TUNING_STREAK_REQ_DAYS,
  TUNING_STREAK_REWARD,
  LANDLORD_TAX_RATE,
  NODE_TUNING_DAILY_CAP,
} from "@/config/site";

interface TuningProps {
  nodeId: string;
  nodeRarity: NodeTypeRarity;
  isOpen: boolean;
  isSponsored: boolean;
  nodeFrequencySeed: number;
}

export function ResonanceTuningModal({
  nodeId,
  nodeRarity,
  isOpen,
  nodeFrequencySeed,
  isSponsored,
}: TuningProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(0);
  const [userFreq, setUserFreq] = useState(50);
  const [isPending, startTransition] = useTransition();

  // session data for action and ui
  const { accessToken } = useAuth();
  const { refreshSessionAssets, data: sessionAssets } =
    useMiningSessionAssets(nodeId);
  const userLocation = useLocation();

  // Calculate progress toward next 5-day milestone
  // e.g., streak 7 -> 7 % 5 = 2. Progress = 2/5.
  const tuningData = sessionAssets?.tuningSession;
  const currentStreak = tuningData?.currentStreak || 0;
  const playCount = tuningData?.playCount || 0;
  const attemptsLeft = NODE_TUNING_DAILY_CAP - playCount;
  const streakProgress = currentStreak % TUNING_STREAK_REQ_DAYS || 0;
  const daysUntilBonus = TUNING_STREAK_REQ_DAYS - streakProgress;
  const taxRate = (LANDLORD_TAX_RATE * 100).toFixed(2);

  // Generate a random interference factor (±10%) to vary target frequency per session
  // This prevents users from memorizing the exact frequency for each node
  const interferenceRef = useRef(
    1 + (Math.random() - 0.5) * 0.2 // Range: 0.9 to 1.1 (±10%)
  ).current;
  const baseFrequency = 20 + nodeFrequencySeed * 60;
  const targetFrequency = useRef(baseFrequency * interferenceRef).current;
  const rarity = getRarityInfo(nodeRarity);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width,
        h = canvas.height,
        cy = h / 2;

      // Target Wave (Color matches Rarity)
      ctx.beginPath();
      // Map rarity to hex for canvas stroke
      const colorMap: Record<NodeTypeRarity, string> = {
        Common: "#3b82f6",
        Uncommon: "#22c55e",
        Epic: "#a855f7",
        Rare: "#f59e0b",
        Legendary: "#ec4899",
      };
      ctx.strokeStyle = colorMap[nodeRarity] || "#94a3b8";
      ctx.lineWidth = 4;
      for (let x = 0; x < w; x++) {
        const y =
          cy +
          Math.sin((x + phaseRef.current) * 0.01 * (targetFrequency / 40)) *
            (h / 3.5);
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      // User Wave (Cyan)
      ctx.beginPath();
      ctx.strokeStyle = "#06b6d4";
      ctx.lineWidth = 3;
      for (let x = 0; x < w; x++) {
        const y =
          cy +
          Math.sin((x + phaseRef.current) * 0.01 * (userFreq / 40)) * (h / 3.5);
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Lock Visual
      if (Math.abs(userFreq - targetFrequency) < 5) {
        ctx.fillStyle = "rgba(6, 182, 212, 0.1)";
        ctx.fillRect(0, 0, w, h);
      }

      phaseRef.current += 2;
      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [userFreq, targetFrequency, isOpen, nodeRarity]);

  // Trigger initial animation on component mount
  useEffect(() => {
    if (isOpen) {
      // Force a re-render to start the animation
      phaseRef.current = 0;
    }
  }, [isOpen]);

  const handleStabilize = () => {
    const diff = Math.abs(userFreq - targetFrequency);
    const rawScore = Math.max(0, 100 - diff * 4);

    startTransition(async () => {
      if (!accessToken || !userLocation) {
        toast.error("Forbidden");
        return;
      }

      try {
        const res = await submitTuningSession({
          nodeId,
          userLat: userLocation.latitude,
          userLng: userLocation.longitude,
          accuracyScore: rawScore,
          accessToken,
        });

        if (res.success && res.data) {
          const {
            currentStreak,
            milestoneReached,
            shares,
            grossShares,
            landlordTax,
          } = res.data;

          // Build tax breakdown display (only show if tax was applied)
          const taxBreakdown =
            landlordTax && landlordTax > 0
              ? `Gross: ${grossShares} | Tax (${taxRate}%): ${landlordTax} | Net: ${shares}`
              : `${shares} Shares`;

          toast.success("Resonance Stabilized!", {
            description: (
              <div className="space-y-1 mt-2">
                <div className="flex justify-between text-sm">
                  <span>Accuracy: {rawScore.toFixed(0)}%</span>
                  <span className="text-cyan-400 font-bold">
                    +{shares} Shares
                  </span>
                </div>
                {/* Show tax breakdown if applicable */}
                {landlordTax && landlordTax > 0 && (
                  <div className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-700">
                    <div>
                      Landlord Tax: -{landlordTax} π ({taxBreakdown})
                    </div>
                  </div>
                )}
                {milestoneReached ? (
                  <div className="flex items-center gap-2 text-amber-400 font-bold bg-amber-950/30 p-2 rounded animate-pulse">
                    <Trophy size={16} /> {TUNING_STREAK_REQ_DAYS}-Day Streak
                    Bonus! +{TUNING_STREAK_REWARD} Points
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">
                    Streak: {currentStreak} days. Next bonus in{" "}
                    {TUNING_STREAK_REQ_DAYS -
                      (currentStreak % TUNING_STREAK_REQ_DAYS)}{" "}
                    days.
                  </div>
                )}
              </div>
            ),
            duration: 10000,
          });
          setUserFreq(50);
          refreshSessionAssets();
        }
      } catch (e) {
        toast.error((e as Error).message);
      }
    });
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl font-light tracking-wider">
              <Waves className="h-5 w-5 text-primary" /> TUNER
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-semibold">
                {attemptsLeft}/{NODE_TUNING_DAILY_CAP}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "uppercase tracking-wider px-3 py-1 text-sm font-medium",
                  nodeRarity === "Legendary" ? rarity.shadowColor : "",
                  rarity.textColor,
                  rarity.borderColor
                )}
              >
                {nodeRarity}
              </Badge>
            </div>
          </div>
          <DialogDescription className="text-slate-400 pt-2">
            Match the frequency. Move slider to start resonating.
          </DialogDescription>
          {/* Tax Notice: Show when node has a sponsor (3% landlord tax will apply) */}
          {isSponsored && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent/30 border border-accent/50">
              <div className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="text-xs text-accent-foreground">
                Landlord Tax: {taxRate}% of earnings on this node
              </span>
            </div>
          )}
        </DialogHeader>

        {/* Streak Visualization */}
        <div className="bg-card p-3 rounded-lg border">
          <div className="flex justify-between text-xs mb-2 text-card-foreground">
            <span>Streak Bonus Progress</span>
            <span
              className={
                daysUntilBonus === TUNING_STREAK_REQ_DAYS
                  ? "text-primary font-bold"
                  : ""
              }
            >
              {daysUntilBonus === TUNING_STREAK_REQ_DAYS
                ? "Bonus Today!"
                : `${daysUntilBonus} days left`}
            </span>
          </div>
          <div className="flex gap-1 h-2">
            {/* Render 5 segments. Filled if index < streakProgress */}
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 rounded-full transition-all",
                  i < streakProgress
                    ? "bg-primary shadow-primary/10"
                    : "bg-background/90"
                )}
              />
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="relative aspect-video w-full rounded-md border border-slate-800 bg-black/40 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={480}
            height={270}
            className="w-full h-full"
          />
          <div className="absolute top-2 right-2">
            <Badge
              variant="secondary"
              className="game-button font-mono backdrop-blur-sm"
            >
              {userFreq.toFixed(1)} Hz
            </Badge>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          <Slider
            value={[userFreq]}
            onValueChange={(val) => setUserFreq(val[0])}
            min={0}
            max={100}
            step={0.1}
            className="cursor-grab active:cursor-grabbing"
          />
          <Button
            size="lg"
            className={cn(
              "w-full font-bold text-white transition-all duration-500",
              Math.abs(userFreq - targetFrequency) < 5
                ? "bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                : "bg-slate-700 hover:bg-slate-600"
            )}
            onClick={handleStabilize}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              "STABILIZE RESONANCE"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
