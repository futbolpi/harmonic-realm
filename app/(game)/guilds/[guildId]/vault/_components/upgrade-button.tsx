"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/queries/use-profile";
import { canUserUpgrade } from "@/lib/guild/utils";
import UpgradeModal from "./upgrade-modal";

type UpgradeButtonProps = {
  guild: { id: string; vaultBalance: number; vaultLevel: number };
  upgradeCost: number;
};

const UpgradeButton = ({ guild, upgradeCost }: UpgradeButtonProps) => {
  const [showUpgrade, setShowUpgrade] = useState(false);

  const { data: profile } = useProfile();

  const guildMembership = profile?.guildMembership
    ? {
        guild: { ...guild, id: profile.guildMembership.guildId },
        role: profile.guildMembership.role,
      }
    : null;

  const { canUpgrade, reason } = canUserUpgrade({
    upgradeCost,
    guildToUpgradeId: guild.id,
    guildMembership,
  });

  return (
    <div className="mt-3 flex items-center gap-2">
      <Button
        variant={canUpgrade ? "default" : "outline"}
        onClick={() => setShowUpgrade(true)}
        disabled={!canUpgrade}
      >
        Upgrade Vault
      </Button>
      {!canUpgrade && (
        <div className="text-xs text-muted-foreground">{reason || ""}</div>
      )}
      <UpgradeModal
        guild={guild}
        setShowUpgrade={setShowUpgrade}
        showUpgrade={showUpgrade}
        vaultUpgrade={{ resonanceCost: upgradeCost }}
      />
    </div>
  );
};

export default UpgradeButton;
