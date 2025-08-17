"use client";

import { useState, useEffect } from "react";
import { Clock, Sparkles, Zap, BookOpen, Lock, Waves } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ComingSoonProps {
  feature: "upgrade-shop" | "lore-fragments";
  className?: string;
}

export function ComingSoon({ feature, className }: ComingSoonProps) {
  const [pulseIntensity, setPulseIntensity] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIntensity((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const featureConfig = {
    "upgrade-shop": {
      title: "Harmonic Resonance Chamber",
      subtitle: "Upgrade Shop",
      description:
        "The Echo Guardians are calibrating the resonance frequencies. Soon, Pioneers will access powerful upgrades to enhance their mining capabilities through the cosmic Lattice.",
      icon: Zap,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
      borderColor: "border-blue-400/30",
      features: [
        "Harmonic Amplifiers for increased yield",
        "Echo Resonators for faster mastery",
        "Lattice Synchronizers for efficiency",
        "Quantum Stabilizers for precision",
      ],
    },
    "lore-fragments": {
      title: "Akashic Archives",
      subtitle: "Lore Fragments Gallery",
      description:
        "The ancient knowledge scattered across the Lattice is being gathered. Soon, Pioneers will unlock the secrets of the Echo Guardians and the mysteries of the infinite digits.",
      icon: BookOpen,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
      borderColor: "border-purple-400/30",
      features: [
        "Discover fragments through mining",
        "Unlock Guardian whispers and secrets",
        "Learn the history of the Lattice",
        "Decode ancient harmonic prophecies",
      ],
    },
  };

  const config = featureConfig[feature];
  const Icon = config.icon;

  return (
    <Card
      className={`${config.bgColor} ${config.borderColor} border-2 ${className}`}
    >
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          {/* Animated Icon */}
          <div className="relative mx-auto w-20 h-20">
            <div
              className={`absolute inset-0 ${config.bgColor} rounded-full animate-ping`}
              style={{
                opacity: Math.sin(pulseIntensity * 0.1) * 0.3 + 0.1,
                transform: `scale(${
                  1 + Math.sin(pulseIntensity * 0.05) * 0.1
                })`,
              }}
            />
            <div
              className={`relative z-10 w-20 h-20 ${config.bgColor} rounded-full flex items-center justify-center border ${config.borderColor}`}
            >
              <Icon className={`h-10 w-10 ${config.color}`} />
            </div>
            <div className="absolute -inset-2">
              <Waves
                className={`w-24 h-24 ${config.color} opacity-20 animate-spin`}
                style={{ animationDuration: "8s" }}
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold flex items-center justify-center gap-2">
              <Sparkles className={`h-5 w-5 ${config.color}`} />
              {config.title}
            </h3>
            <Badge
              variant="outline"
              className={`${config.color} ${config.borderColor}`}
            >
              {config.subtitle}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
            {config.description}
          </p>

          {/* Resonance Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm">
              <Clock className={`h-4 w-4 ${config.color}`} />
              <span className="font-medium">
                Harmonic Calibration in Progress
              </span>
            </div>
            <Progress value={pulseIntensity} className="h-2 bg-muted/30" />
            <div className="text-xs text-muted-foreground">
              Echo Frequency: {pulseIntensity.toFixed(1)}% Synchronized
            </div>
          </div>

          {/* Coming Features */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm uppercase tracking-wide opacity-80">
              Awaiting Activation
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {config.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <Lock className="h-3 w-3 opacity-60" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mystical Footer */}
          <div className="pt-4 border-t border-border/30">
            <p className="text-xs text-muted-foreground italic">
              &quot;The Lattice whispers of great power soon to be
              unleashed...&quot;
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
