"use client";

import { useState } from "react";
import { Award } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPrestigeTier, type PrestigeTier } from "@/lib/utils/prestige";
import PrestigeModal from "./prestige-modal";

type PrestigeButtonProps = {
  prestigePoints: number;
  prestigeLevel: number;
  prestigeMultiplier: number;
  guildName: string;
};

const TIER_COLORS: Record<
  PrestigeTier,
  { badge: string; button: string; glow: string }
> = {
  Bronze: {
    badge:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
    button: "hover:bg-amber-50 dark:hover:bg-amber-950/20",
    glow: "shadow-amber-500/20",
  },
  Silver: {
    badge:
      "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-200",
    button: "hover:bg-slate-50 dark:hover:bg-slate-950/20",
    glow: "shadow-slate-500/20",
  },
  Gold: {
    badge:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
    button: "hover:bg-yellow-50 dark:hover:bg-yellow-950/20",
    glow: "shadow-yellow-500/30",
  },
  Platinum: {
    badge: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-200",
    button: "hover:bg-cyan-50 dark:hover:bg-cyan-950/20",
    glow: "shadow-cyan-500/30",
  },
  Diamond: {
    badge:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200",
    button: "hover:bg-purple-50 dark:hover:bg-purple-950/20",
    glow: "shadow-purple-500/30",
  },
};

export default function PrestigeButton({
  prestigePoints,
  prestigeLevel,
  prestigeMultiplier,
  guildName,
}: PrestigeButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const tier = getPrestigeTier(prestigeLevel);
  const tierColors = TIER_COLORS[tier];

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowModal(true)}
        className={`${tierColors.button} transition-all ${tierColors.glow} hover:shadow-lg`}
      >
        <Award className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Prestige</span>
        <Badge variant="secondary" className={`ml-2 ${tierColors.badge}`}>
          {tier} {prestigeLevel}
        </Badge>
      </Button>

      <PrestigeModal
        open={showModal}
        onOpenChange={setShowModal}
        prestigePoints={prestigePoints}
        prestigeLevel={prestigeLevel}
        prestigeMultiplier={prestigeMultiplier}
        guildName={guildName}
      />
    </>
  );
}
