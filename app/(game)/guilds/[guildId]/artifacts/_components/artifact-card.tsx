"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatArtifactEffect } from "@/lib/utils/guild/artifact";
import {
  getArtifactStatusInfo,
  getEffectIcon,
  getRarityColor,
} from "@/lib/utils/guild/artifacts-utils";
import type {
  ArtifactEffectType,
  ArtifactRarity,
} from "@/lib/generated/prisma/enums";
import ResonateModal from "./resonate-modal";
import CraftModal from "./craft-modal";
import UpgradeModal from "./upgrade-modal";
import EquipModal from "./equip-modal";

type ArtifactCardProps = {
  artifact: {
    id: string;
    level: number;
    shardsBurnt: number;
    isEquipped: boolean;
    effectValue: number;
    upgradeCost: { shards: number; resonance: number } | null;
    template: {
      id: string;
      name: string;
      description: string;
      rarity: ArtifactRarity;
      effectType: ArtifactEffectType;
      echoShardsCost: number;
      resonanceCost: number;
      baseValue: number;
      minVaultLevel: number;
      valuePerLevel: number;
      loreText: string;
    };
  };
  guildId: string;
  vaultBalance: number;
  vaultLevel: number;
  equippedCount: number;
};

export default function ArtifactCard({
  artifact,
  guildId,
  vaultBalance,
  vaultLevel,
  equippedCount,
}: ArtifactCardProps) {
  const [showResonate, setShowResonate] = useState(false);
  const [showCraft, setShowCraft] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showEquip, setShowEquip] = useState(false);

  const statusInfo = getArtifactStatusInfo(
    artifact.level,
    artifact.shardsBurnt,
    artifact.level === 0
      ? artifact.template.echoShardsCost
      : artifact.upgradeCost?.shards || 0,
  );

  const effectIcon = getEffectIcon(artifact.template.effectType);
  const rarityColor = getRarityColor(artifact.template.rarity);

  return (
    <>
      <Card
        className={`relative overflow-hidden border-2 ${
          artifact.isEquipped ? "border-primary/50 bg-primary/5" : ""
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1">
              <span className="text-2xl">{effectIcon}</span>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base truncate">
                  {artifact.template.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="outline" className={`text-xs ${rarityColor}`}>
                    {artifact.template.rarity}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {statusInfo.statusText}
                  </Badge>
                  {artifact.isEquipped && (
                    <Badge className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Equipped
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pb-4">
          {/* Effect Display */}
          <div className="p-2 rounded-md bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Effect</p>
            <p className="text-sm font-semibold">
              {formatArtifactEffect(
                artifact.template.effectType,
                artifact.level > 0
                  ? artifact.effectValue
                  : artifact.template.baseValue,
              )}
            </p>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">
                {artifact.level === 0 ? "Crafting" : "Upgrade"} Progress
              </span>
              <span className="font-medium">
                {statusInfo.progress.toFixed(0)}%
              </span>
            </div>
            <Progress value={statusInfo.progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {artifact.shardsBurnt} /{" "}
              {artifact.level === 0
                ? artifact.template.echoShardsCost
                : artifact.upgradeCost?.shards || 0}{" "}
              shards
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setShowResonate(true)}
              className="flex-1 text-xs py-1.5 px-3 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              Resonate
            </button>

            {artifact.level === 0 &&
              artifact.shardsBurnt >= artifact.template.echoShardsCost && (
                <button
                  onClick={() => setShowCraft(true)}
                  className="flex-1 text-xs py-1.5 px-3 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
                >
                  Craft
                </button>
              )}

            {artifact.level > 0 && artifact.level < 10 && (
              <>
                {artifact.upgradeCost &&
                  artifact.shardsBurnt >= artifact.upgradeCost.shards && (
                    <button
                      onClick={() => setShowUpgrade(true)}
                      className="flex-1 text-xs py-1.5 px-3 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
                    >
                      Upgrade
                    </button>
                  )}
                <button
                  onClick={() => setShowEquip(true)}
                  className="flex-1 text-xs py-1.5 px-3 rounded-md bg-accent text-accent-foreground hover:bg-accent/80 transition-colors"
                >
                  {artifact.isEquipped ? "Unequip" : "Equip"}
                </button>
              </>
            )}

            {artifact.level === 10 && (
              <button
                onClick={() => setShowEquip(true)}
                className="flex-1 text-xs py-1.5 px-3 rounded-md bg-accent hover:bg-accent/80 transition-colors"
              >
                {artifact.isEquipped ? "Unequip" : "Equip"}
              </button>
            )}
          </div>

          {/* Lore Text */}
          <p className="text-xs text-muted-foreground italic pt-2 border-t">
            {artifact.template.loreText}
          </p>
        </CardContent>
      </Card>

      <ResonateModal
        open={showResonate}
        onOpenChange={setShowResonate}
        template={{
          id: artifact.template.id,
          name: artifact.template.name,
          minVaultLevel: artifact.template.minVaultLevel,
        }}
        guildId={guildId}
        guildVaultLevel={vaultLevel}
      />

      {artifact.level === 0 && (
        <CraftModal
          open={showCraft}
          onOpenChange={setShowCraft}
          artifact={artifact}
          guildId={guildId}
          vaultBalance={vaultBalance}
        />
      )}

      {artifact.level > 0 && artifact.level < 10 && artifact.upgradeCost && (
        <UpgradeModal
          open={showUpgrade}
          onOpenChange={setShowUpgrade}
          artifact={artifact}
          guildId={guildId}
          vaultBalance={vaultBalance}
          upgradeCost={artifact.upgradeCost}
        />
      )}

      {artifact.level > 0 && (
        <EquipModal
          open={showEquip}
          onOpenChange={setShowEquip}
          artifact={artifact}
          guildId={guildId}
          equippedCount={equippedCount}
          guildVaultLevel={vaultLevel}
        />
      )}
    </>
  );
}
