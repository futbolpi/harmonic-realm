"use client";

import { memo } from "react";
import { Zap } from "lucide-react";

import { cn } from "@/lib/utils";

type NodeColor = {
  fromColor: string;
  color: string;
  toColor: string;
  borderColor: string;
  shadowColor: string;
};

interface NodeMarkerProps {
  nodeColor: NodeColor;
  isActive?: boolean;
  isDiscovered?: boolean;
  className?: string;
}

export const NodeMarker = memo(function NodeMarker({
  nodeColor,
  // isActive = false,
  // isDiscovered = false,
  className,
}: NodeMarkerProps) {
  return (
    <div
      className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110",
        "border-2 border-solid shadow-lg animate-pulse",
        nodeColor.color,
        // nodeColor.fromColor,
        // nodeColor.toColor,
        nodeColor.borderColor,
        // nodeColor.shadowColor,
        // isActive && "animate-pulse",
        // !isDiscovered && "opacity-60",
        className
      )}
    >
      <Zap className="w-4 h-4 text-white drop-shadow-sm" />
    </div>
  );
});
