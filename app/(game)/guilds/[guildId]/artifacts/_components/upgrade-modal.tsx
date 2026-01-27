"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Loader2 } from "lucide-react";

import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "@/components/credenza";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/components/shared/auth/auth-context";
import { useProfile } from "@/hooks/queries/use-profile";
import { upgradeArtifactAction } from "@/actions/guilds/artifacts/upgrade-artifact";
import { canUpgradeArtifact } from "@/lib/utils/guild/artifacts-utils";
import {
  formatArtifactEffect,
  calculateArtifactEffectValue,
} from "@/lib/utils/guild/artifact";
import type { ArtifactEffectType } from "@/lib/generated/prisma/enums";

type UpgradeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artifact: {
    id: string;
    level: number;
    shardsBurnt: number;
    template: {
      id: string;
      name: string;
      effectType: ArtifactEffectType;
      baseValue: number;
      valuePerLevel: number;
    };
  };
  guildId: string;
  vaultBalance: number;
  upgradeCost: {
    shards: number;
    resonance: number;
  };
};

export default function UpgradeModal({
  open,
  onOpenChange,
  artifact,
  guildId,
  vaultBalance,
  upgradeCost,
}: UpgradeModalProps) {
  const [isUpgrading, startTransition] = useTransition();

  const { accessToken } = useAuth();
  const { data: profile, refreshProfile } = useProfile();

  const userRole = profile?.guildMembership?.role || null;

  const { canUpgrade, reason } = canUpgradeArtifact({
    userRole,
    artifactLevel: artifact.level,
    shardsBurnt: artifact.shardsBurnt,
    requiredShards: upgradeCost.shards,
    vaultBalance,
    resonanceCost: upgradeCost.resonance,
  });

  const currentEffect = calculateArtifactEffectValue(
    artifact.template.baseValue,
    artifact.template.valuePerLevel,
    artifact.level,
  );

  const nextEffect = calculateArtifactEffectValue(
    artifact.template.baseValue,
    artifact.template.valuePerLevel,
    artifact.level + 1,
  );

  const handleUpgrade = () => {
    if (!accessToken || !canUpgrade) {
      toast.error(reason || "Cannot upgrade artifact");
      return;
    }

    startTransition(async () => {
      try {
        const result = await upgradeArtifactAction({
          guildId,
          artifactId: artifact.id,
          accessToken,
        });

        if (!result.success) {
          toast.error(result.error || "Failed to upgrade artifact");
          return;
        }

        refreshProfile();
        toast.success(
          `${artifact.template.name} upgraded to Level ${artifact.level + 1}!`,
        );
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        onOpenChange(false);
      } catch (error) {
        console.error(error);
        toast.error("Failed to upgrade artifact");
      }
    });
  };

  return (
    <Credenza open={open} onOpenChange={onOpenChange}>
      <CredenzaContent className="max-w-md">
        <CredenzaHeader>
          <CredenzaTitle>Upgrade Artifact</CredenzaTitle>
          <CredenzaDescription>
            Enhance {artifact.template.name} to Level {artifact.level + 1}
          </CredenzaDescription>
        </CredenzaHeader>

        <CredenzaBody className="py-4 space-y-4 overflow-y-auto max-h-96">
          {!canUpgrade && (
            <Alert variant="destructive">
              <AlertDescription>{reason}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <div className="p-3 rounded-md bg-muted/50">
              <h4 className="font-semibold text-sm mb-2">Effect Improvement</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Current:</span>
                  <span className="font-medium">
                    {formatArtifactEffect(
                      artifact.template.effectType,
                      currentEffect,
                    )}
                  </span>
                </div>
                <div className="flex justify-center text-primary">→</div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Next:</span>
                  <span className="font-medium text-primary">
                    {formatArtifactEffect(
                      artifact.template.effectType,
                      nextEffect,
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-md bg-muted/50">
              <h4 className="font-semibold text-sm mb-2">Upgrade Cost</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Echo Shards:</span>
                  <span className="font-medium">{upgradeCost.shards} ✓</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RESONANCE:</span>
                  <span
                    className={
                      vaultBalance >= upgradeCost.resonance
                        ? "font-medium text-green-500"
                        : "font-medium text-red-500"
                    }
                  >
                    {upgradeCost.resonance}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Vault Balance:</span>
                  <span>{vaultBalance.toLocaleString()} SP</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              💡 Upgrading will consume RESONANCE from the guild vault and
              enhance the artifact&apos;s power.
            </div>
          </div>
        </CredenzaBody>

        <CredenzaFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpgrading}
          >
            Cancel
          </Button>
          <Button onClick={handleUpgrade} disabled={isUpgrading || !canUpgrade}>
            {isUpgrading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Upgrading...
              </>
            ) : (
              "Upgrade Artifact"
            )}
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
