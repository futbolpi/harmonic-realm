"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

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
import { equipArtifactAction } from "@/actions/guilds/artifacts/equip-artifact";
import { canEquipArtifact } from "@/lib/utils/guild/artifacts-utils";
import { getArtifactSlots } from "@/lib/utils/guild/artifact";

type EquipModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artifact: {
    id: string;
    isEquipped: boolean;
    level: number;
    template: {
      name: string;
      description: string;
    };
  };
  guildId: string;
  equippedCount: number;
  guildVaultLevel: number;
};

export default function EquipModal({
  open,
  onOpenChange,
  artifact,
  guildId,
  equippedCount,
  guildVaultLevel,
}: EquipModalProps) {
  const [isEquipping, startTransition] = useTransition();

  const { accessToken } = useAuth();
  const { data: profile, refreshProfile } = useProfile();

  const userRole = profile?.guildMembership?.role || null;

  const isEquipping_action = !artifact.isEquipped;

  const { canEquip, reason } = canEquipArtifact({
    userRole,
    artifactLevel: artifact.level,
    currentlyEquipped: artifact.isEquipped,
    equippedCount,
    isEquipping: isEquipping_action,
    maxSlots: getArtifactSlots(guildVaultLevel),
  });

  const handleEquip = () => {
    if (!accessToken || !canEquip) {
      toast.error(reason || "Cannot equip artifact");
      return;
    }

    startTransition(async () => {
      try {
        const result = await equipArtifactAction({
          guildId,
          artifactId: artifact.id,
          equip: isEquipping_action,
          accessToken,
        });

        if (!result.success) {
          toast.error(result.error || "Failed to equip artifact");
          return;
        }

        refreshProfile();
        toast.success(
          isEquipping_action
            ? `${artifact.template.name} equipped!`
            : `${artifact.template.name} unequipped`,
        );
        onOpenChange(false);
      } catch (error) {
        console.error(error);
        toast.error("Failed to equip artifact");
      }
    });
  };

  return (
    <Credenza open={open} onOpenChange={onOpenChange}>
      <CredenzaContent className="max-w-md">
        <CredenzaHeader>
          <CredenzaTitle>
            {isEquipping_action ? "Equip" : "Unequip"} Artifact
          </CredenzaTitle>
          <CredenzaDescription>
            {isEquipping_action ? "Activate" : "Deactivate"}{" "}
            {artifact.template.name}
          </CredenzaDescription>
        </CredenzaHeader>

        <CredenzaBody className="py-4 space-y-4 overflow-y-auto max-h-96">
          {!canEquip && (
            <Alert variant="destructive">
              <AlertDescription>{reason}</AlertDescription>
            </Alert>
          )}

          <div className="p-4 rounded-md bg-muted/50 space-y-3">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">
                  {artifact.template.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {artifact.template.description}
                </p>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {isEquipping_action ? (
              <>
                Equipped artifacts provide their buffs to all guild members.
                Make sure you have an available slot before equipping.
              </>
            ) : (
              <>
                Unequipping will deactivate the artifact&apos;s effects for all
                guild members. The artifact will remain crafted and can be
                re-equipped anytime.
              </>
            )}
          </div>
        </CredenzaBody>

        <CredenzaFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isEquipping}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEquip}
            disabled={isEquipping || !canEquip}
            variant={isEquipping_action ? "default" : "destructive"}
          >
            {isEquipping ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {isEquipping_action ? "Equipping..." : "Unequipping..."}
              </>
            ) : isEquipping_action ? (
              "Equip Artifact"
            ) : (
              "Unequip Artifact"
            )}
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
