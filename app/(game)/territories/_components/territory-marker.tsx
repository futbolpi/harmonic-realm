"use client";

import { Marker, type MarkerEvent } from "react-map-gl/maplibre";
import { Crown, AlertCircle, Zap } from "lucide-react";

type TerritoryMarkerProps = {
  t: {
    hexId: string;
    centerLon: number;
    centerLat: number;
    nodeCount: number;
    trafficScore: number;
    isSelected: boolean;
    status?: "own" | "enemy" | "empty";
    hasChallenge?: boolean;
  };
  onClick?: (e: MarkerEvent<MouseEvent>) => void;
};

const TerritoryMarker = ({ t, onClick }: TerritoryMarkerProps) => {
  const statusColor = {
    own: "bg-emerald-600",
    enemy: "bg-red-600",
    empty: "bg-slate-500",
  }[t.status || "empty"];

  const borderColor = {
    own: "border-emerald-400",
    enemy: "border-red-400",
    empty: "border-slate-400",
  }[t.status || "empty"];

  return (
    <Marker
      key={`marker-${t.hexId}`}
      longitude={t.centerLon}
      latitude={t.centerLat}
      onClick={onClick}
    >
      <div className="flex flex-col items-center gap-1">
        {/* Main Marker Badge */}
        <div
          className={`
            flex items-center justify-center w-10 h-10 rounded-full shadow-lg 
            font-bold border-2 transition-all duration-200
            ${
              t.isSelected
                ? `${statusColor} text-white scale-125 z-50 ring-2 ring-offset-2`
                : `${statusColor} text-white hover:scale-110`
            }
            ${borderColor}
          `}
          title={`${t.nodeCount} nodes • Traffic: ${Math.round(
            t.trafficScore
          )}`}
        >
          <span className="text-sm">{t.nodeCount}</span>
        </div>

        {/* Status Indicator Icons */}
        {t.isSelected && (
          <div className="flex gap-1">
            {t.status === "own" && (
              <div className="bg-emerald-600 text-white rounded-full p-1 shadow-md">
                <Crown className="w-3 h-3" />
              </div>
            )}
            {t.status === "enemy" && (
              <div className="bg-red-600 text-white rounded-full p-1 shadow-md">
                <AlertCircle className="w-3 h-3" />
              </div>
            )}
            {t.trafficScore > 100 && (
              <div className="bg-amber-500 text-white rounded-full p-1 shadow-md">
                <Zap className="w-3 h-3" />
              </div>
            )}
          </div>
        )}

        {/* Traffic Score Indicator (small dot below) */}
        <div
          className={`
            w-2 h-2 rounded-full transition-all
            ${
              t.trafficScore > 200
                ? "bg-amber-500"
                : t.trafficScore > 100
                ? "bg-yellow-400"
                : "bg-gray-400"
            }
          `}
          title={`Traffic: ${Math.round(t.trafficScore)}`}
        />
      </div>
    </Marker>
  );
};

export default TerritoryMarker;
