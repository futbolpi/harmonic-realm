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
import { craftArtifactAction } from "@/actions/guilds/artifacts/craft-artifact";
import { canCraftArtifact } from "@/lib/utils/guild/artifacts-utils";

type CraftModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artifact: {
    id: string;
    level: number;
    shardsBurnt: number;
    template: {
      id: string;
      name: string;
      echoShardsCost: number;
      resonanceCost: number;
      loreText: string;
    };
  };
  guildId: string;
  vaultBalance: number;
};

export default function CraftModal({
  open,
  onOpenChange,
  artifact,
  guildId,
  vaultBalance,
}: CraftModalProps) {
  const [isCrafting, startTransition] = useTransition();

  const { accessToken } = useAuth();
  const { data: profile, refreshProfile } = useProfile();

  const userRole = profile?.guildMembership?.role || null;

  const { canCraft, reason } = canCraftArtifact({
    userRole,
    artifactLevel: artifact.level,
    shardsBurnt: artifact.shardsBurnt,
    requiredShards: artifact.template.echoShardsCost,
    vaultBalance,
    resonanceCost: artifact.template.resonanceCost,
  });

  const handleCraft = () => {
    if (!accessToken || !canCraft) {
      toast.error(reason || "Cannot craft artifact");
      return;
    }

    startTransition(async () => {
      try {
        const result = await craftArtifactAction({
          guildId,
          templateId: artifact.template.id,
          accessToken,
        });

        if (!result.success) {
          toast.error(result.error || "Failed to craft artifact");
          return;
        }

        refreshProfile();
        toast.success(`${artifact.template.name} crafted!`);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        onOpenChange(false);
      } catch (error) {
        console.error(error);
        toast.error("Failed to craft artifact");
      }
    });
  };

  return (
    <Credenza open={open} onOpenChange={onOpenChange}>
      <CredenzaContent className="max-w-md">
        <CredenzaHeader>
          <CredenzaTitle>Craft Artifact</CredenzaTitle>
          <CredenzaDescription>
            Finalize crafting of {artifact.template.name}
          </CredenzaDescription>
        </CredenzaHeader>

        <CredenzaBody className="py-4 space-y-4 overflow-y-auto max-h-96">
          {!canCraft && (
            <Alert variant="destructive">
              <AlertDescription>{reason}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <div className="p-3 rounded-md bg-muted/50">
              <h4 className="font-semibold text-sm mb-2">Crafting Cost</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Echo Shards:</span>
                  <span className="font-medium">
                    {artifact.template.echoShardsCost} ✓
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RESONANCE:</span>
                  <span
                    className={
                      vaultBalance >= artifact.template.resonanceCost
                        ? "font-medium text-green-500"
                        : "font-medium text-red-500"
                    }
                  >
                    {artifact.template.resonanceCost}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Vault Balance:</span>
                  <span>{vaultBalance.toLocaleString()} SP</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-md bg-primary/5 border border-primary/20">
              <p className="text-sm italic text-muted-foreground">
                &quot;{artifact.template.loreText}&quot;
              </p>
            </div>

            <div className="text-xs text-muted-foreground">
              💡 Crafting will consume RESONANCE from the guild vault and
              activate the artifact at Level 1.
            </div>
          </div>
        </CredenzaBody>

        <CredenzaFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCrafting}
          >
            Cancel
          </Button>
          <Button onClick={handleCraft} disabled={isCrafting || !canCraft}>
            {isCrafting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Crafting...
              </>
            ) : (
              "Craft Artifact"
            )}
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
