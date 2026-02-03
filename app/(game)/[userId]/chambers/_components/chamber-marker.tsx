"use client";

import { Crown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ChamberMarkerProps {
  level: number;
  currentDurability: number;
  isSelected?: boolean;
  className?: string;
}

export function ChamberMarker({
  level,
  currentDurability,
  isSelected = false,
  className,
}: ChamberMarkerProps) {
  // Color mapping for durability
  const getColorClasses = () => {
    if (currentDurability >= 70) {
      return {
        bg: "bg-blue-500",
        border: "border-blue-400",
        ring: "ring-blue-500/50",
        shadow: "shadow-blue-500/50",
      };
    }
    if (currentDurability >= 40) {
      return {
        bg: "bg-yellow-500",
        border: "border-yellow-400",
        ring: "ring-yellow-500/50",
        shadow: "shadow-yellow-500/50",
      };
    }
    if (currentDurability >= 20) {
      return {
        bg: "bg-orange-500",
        border: "border-orange-400",
        ring: "ring-orange-500/50",
        shadow: "shadow-orange-500/50",
      };
    }
    return {
      bg: "bg-red-500",
      border: "border-red-400",
      ring: "ring-red-500/50",
      shadow: "shadow-red-500/50",
    };
  };

  const colors = getColorClasses();

  return (
    <div className={cn("relative", className)}>
      {/* Pulsing outer ring */}
      <div
        className={cn(
          "absolute inset-0 rounded-full animate-ping opacity-75",
          colors.bg,
        )}
        style={{ animationDuration: "2s" }}
      />

      {/* Main marker */}
      <div
        className={cn(
          "relative w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 cursor-pointer",
          colors.bg,
          colors.border,
          colors.shadow,
          "shadow-lg",
          isSelected && `ring-4 ${colors.ring} scale-110`,
        )}
      >
        <Crown className="h-5 w-5 text-white" />
      </div>

      {/* Level badge */}
      <div className="absolute -top-1 -right-1">
        <Badge
          variant="secondary"
          className="h-5 w-5 p-0 flex items-center justify-center text-xs font-bold rounded-full border-2 border-background"
        >
          {level}
        </Badge>
      </div>

      {/* Durability indicator (for critical states) */}
      {currentDurability < 20 && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
}
