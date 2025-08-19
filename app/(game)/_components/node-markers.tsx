"use client";

import { Zap, Crown } from "lucide-react";

import { NodeTypeRarity } from "@/lib/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { getNodeColors } from "../(geo-needed)/map/utils";

interface NodeMarkerProps {
  nodeRarity: NodeTypeRarity;
  isActive?: boolean;
  isDiscovered?: boolean;
  className?: string;
}

export function NodeMarker({
  nodeRarity,
  isActive = false,
  isDiscovered = false,
  className,
}: NodeMarkerProps) {
  const colors = getNodeColors(nodeRarity);

  return (
    <div
      className={cn(
        "relative cursor-pointer transition-all duration-300 hover:scale-110",
        className
      )}
    >
      {/* Outer pulsing ring */}
      <div
        className={cn(
          "absolute inset-0 rounded-full border-2 animate-ping",
          colors.border,
          isActive ? "opacity-75" : "opacity-30"
        )}
      />

      {/* Middle energy ring */}
      <div
        className={cn(
          "absolute inset-1 rounded-full",
          colors.secondary,
          "animate-pulse"
        )}
      />

      {/* Core node */}
      <div
        className={cn(
          "relative w-8 h-8 rounded-full bg-gradient-to-br shadow-lg",
          colors.primary,
          colors.glow,
          isActive && "shadow-xl",
          !isDiscovered && "opacity-60"
        )}
      >
        {/* Inner energy core */}
        <div className="absolute inset-1 rounded-full bg-white/30 animate-pulse" />

        {/* Lattice symbol */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white drop-shadow-sm" />
        </div>

        {/* Legendary crown */}
        {nodeRarity === "Legendary" && (
          <div className="absolute -top-1 -right-1">
            <Crown className="w-3 h-3 text-amber-300 drop-shadow-sm" />
          </div>
        )}
      </div>

      {/* Energy particles */}
      {isActive && (
        <>
          <div className="absolute -top-1 -left-1 w-1 h-1 bg-white rounded-full animate-bounce delay-0" />
          <div className="absolute -top-1 -right-1 w-1 h-1 bg-white rounded-full animate-bounce delay-300" />
          <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-white rounded-full animate-bounce delay-600" />
          <div className="absolute -bottom-1 -right-1 w-1 h-1 bg-white rounded-full animate-bounce delay-900" />
        </>
      )}
    </div>
  );
}
