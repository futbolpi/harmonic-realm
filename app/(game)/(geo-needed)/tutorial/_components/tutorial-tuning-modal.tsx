"use client";

import React, { useRef, useEffect, useState, useTransition } from "react";
import { Loader2, Waves } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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
import { useAuth } from "@/components/shared/auth/auth-context";
import { getRarityInfo } from "@/app/(game)/map/utils";
import { completeTutorial } from "@/actions/tutorial/complete";
import { useProfile } from "@/hooks/queries/use-profile";

interface TuningProps {
  isOpen: boolean;
  nodeFrequencySeed: number;
}

export function TutorialTuningModal({
  isOpen,
  nodeFrequencySeed,
}: TuningProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(0);
  const [userFreq, setUserFreq] = useState(50);
  const [isPending, startTransition] = useTransition();
  const [isDisintegrating, setIsDisintegrating] = useState(false);
  const router = useRouter();

  // session data for action and ui
  const { accessToken } = useAuth();
  const { refreshProfile } = useProfile();
  const nodeRarity = "Common";

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
    let disintegrationProgress = 0;

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
      const targetColor = colorMap[nodeRarity] || "#94a3b8";

      // If disintegrating, apply fading and particle effect
      if (isDisintegrating) {
        disintegrationProgress = Math.min(disintegrationProgress + 0.05, 1);
        const opacity = 1 - disintegrationProgress;
        ctx.strokeStyle = targetColor
          .replace(")", `, ${opacity})`)
          .replace("rgb", "rgba");

        // Add pixelation/noise effect during disintegration
        ctx.lineWidth = 4 + disintegrationProgress * 4;
        for (let x = 0; x < w; x += Math.ceil(1 + disintegrationProgress * 5)) {
          const noise = (Math.random() - 0.5) * disintegrationProgress * h;
          const y =
            cy +
            Math.sin((x + phaseRef.current) * 0.01 * (targetFrequency / 40)) *
              (h / 3.5) +
            noise;
          ctx.lineTo(x, y);
        }
      } else {
        ctx.lineWidth = 4;
        ctx.strokeStyle = targetColor;
        for (let x = 0; x < w; x++) {
          const y =
            cy +
            Math.sin((x + phaseRef.current) * 0.01 * (targetFrequency / 40)) *
              (h / 3.5);
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // User Wave (Cyan) - also disintegrates
      ctx.beginPath();
      const userColor = "#06b6d4";
      if (isDisintegrating) {
        const opacity = 1 - disintegrationProgress;
        ctx.strokeStyle = userColor
          .replace(")", `, ${opacity})`)
          .replace("rgb", "rgba");
        ctx.lineWidth = 3 + disintegrationProgress * 3;
        for (let x = 0; x < w; x += Math.ceil(1 + disintegrationProgress * 5)) {
          const noise = (Math.random() - 0.5) * disintegrationProgress * h;
          const y =
            cy +
            Math.sin((x + phaseRef.current) * 0.01 * (userFreq / 40)) *
              (h / 3.5) +
            noise;
          ctx.lineTo(x, y);
        }
      } else {
        ctx.strokeStyle = userColor;
        ctx.lineWidth = 3;
        for (let x = 0; x < w; x++) {
          const y =
            cy +
            Math.sin((x + phaseRef.current) * 0.01 * (userFreq / 40)) *
              (h / 3.5);
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Lock Visual (fades out during disintegration)
      if (!isDisintegrating && Math.abs(userFreq - targetFrequency) < 5) {
        ctx.fillStyle = "rgba(6, 182, 212, 0.1)";
        ctx.fillRect(0, 0, w, h);
      }

      phaseRef.current += 2;

      // Stop animation when disintegration is complete
      if (!(isDisintegrating && disintegrationProgress >= 1)) {
        animationId = requestAnimationFrame(render);
      }
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [userFreq, targetFrequency, isOpen, nodeRarity, isDisintegrating]);

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

    // Trigger disintegration animation
    setIsDisintegrating(true);

    startTransition(async () => {
      if (!accessToken) {
        toast.error("Please sign in to receive the tutorial reward");
        return;
      }

      try {
        // Wait for disintegration animation to complete (1 second)
        const res = await completeTutorial({
          accessToken,
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (res.success && res.data) {
          const { awardedShares } = res.data;

          toast.success("Tutorial Completed!", {
            description: (
              <div className="space-y-1 mt-2">
                <div className="flex justify-between text-sm">
                  <span>Accuracy: {rawScore.toFixed(0)}%</span>
                  <span className="text-cyan-400 font-bold">
                    +{awardedShares} Shares
                  </span>
                </div>
                <div className="text-xs text-emerald-300 bg-emerald-950/10 p-2 rounded border border-emerald-700">
                  <div className="font-semibold">Tutorial Completed!</div>
                  <div>
                    You are Tuned. Explore the physical world to find more
                    Nodes.
                  </div>
                </div>
              </div>
            ),
          });
          refreshProfile();
          // Navigate to map after disintegration and success
          setTimeout(() => {
            router.push("/map");
          }, 500);
        } else {
          toast.error(
            res.error || "There was an error, please try again later"
          );
          setIsDisintegrating(false);
        }
      } catch (e) {
        toast.error((e as Error).message);
        setIsDisintegrating(false);
      }
    });
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-lg">
        <motion.div
          initial={{ opacity: 1, scale: 1 }}
          animate={
            isDisintegrating
              ? { opacity: 0, scale: 0.8, y: 20 }
              : { opacity: 1, scale: 1, y: 0 }
          }
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="sm:max-w-lg"
        >
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-xl font-light tracking-wider">
                <Waves className="h-5 w-5 text-primary" /> TUNER
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "uppercase tracking-wider px-3 py-1 text-sm font-medium",
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
          </DialogHeader>

          {/* Canvas */}
          <div className="relative aspect-video mt-3 w-full rounded-md border border-slate-800 bg-black/40 overflow-hidden">
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
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
