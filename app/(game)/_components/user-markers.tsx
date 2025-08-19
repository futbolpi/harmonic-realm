"use client";

import { User } from "lucide-react";

import { cn } from "@/lib/utils";

interface UserMarkerProps {
  isCurrentUser?: boolean;
  level?: number;
  className?: string;
}

export function UserMarker({
  isCurrentUser = false,
  level = 1,
  className,
}: UserMarkerProps) {
  const getLevelColors = () => {
    if (level >= 50)
      return {
        primary: "from-pink-400 to-rose-400",
        glow: "shadow-pink-400/50",
      };
    if (level >= 25)
      return {
        primary: "from-amber-400 to-orange-400",
        glow: "shadow-amber-400/50",
      };
    if (level >= 10)
      return {
        primary: "from-purple-400 to-violet-400",
        glow: "shadow-purple-400/50",
      };
    return {
      primary: "from-green-400 to-emerald-400",
      glow: "shadow-green-400/50",
    };
  };

  const colors = getLevelColors();

  return (
    <div
      className={cn(
        "relative cursor-pointer transition-all duration-300 hover:scale-110",
        className
      )}
    >
      {/* Current user pulsing aura */}
      {isCurrentUser && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/30 to-blue-400/30 animate-ping" />
      )}

      {/* Pioneer marker */}
      <div
        className={cn(
          "relative w-6 h-6 rounded-full bg-gradient-to-br shadow-lg border-2 border-white/50",
          colors.primary,
          colors.glow,
          isCurrentUser && "shadow-xl ring-2 ring-cyan-400/50"
        )}
      >
        {/* Inner glow */}
        <div className="absolute inset-0.5 rounded-full bg-white/20 animate-pulse" />

        {/* Pioneer icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <User className="w-3 h-3 text-white drop-shadow-sm" />
        </div>

        {/* Level indicator */}
        {level > 1 && (
          <div className="absolute -top-2 -right-2 bg-slate-800 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center border border-white/30">
            {level > 99 ? "∞" : level}
          </div>
        )}
      </div>

      {/* Current user energy trail */}
      {isCurrentUser && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 w-0.5 h-2 bg-gradient-to-t from-cyan-400 to-transparent animate-pulse" />
          <div className="absolute bottom-0 left-1/2 w-0.5 h-2 bg-gradient-to-b from-cyan-400 to-transparent animate-pulse delay-300" />
          <div className="absolute left-0 top-1/2 w-2 h-0.5 bg-gradient-to-l from-cyan-400 to-transparent animate-pulse delay-600" />
          <div className="absolute right-0 top-1/2 w-2 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent animate-pulse delay-900" />
        </div>
      )}
    </div>
  );
}
