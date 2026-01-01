"use client";

import { useTransition, type Dispatch, type SetStateAction } from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";

import {
  Credenza,
  CredenzaFooter,
  CredenzaContent,
  CredenzaBody,
  CredenzaHeader,
  CredenzaTitle,
} from "@/components/credenza";
import { Button } from "@/components/ui/button";
import { upgradeVault } from "@/actions/vaults/upgrade";
import { useAuth } from "@/components/shared/auth/auth-context";

type UpgradeModalProps = {
  setShowUpgrade: Dispatch<SetStateAction<boolean>>;
  showUpgrade: boolean;
  guild: { vaultLevel: number; id: string; vaultBalance: number };
  vaultUpgrade: { resonanceCost: number };
};

const UpgradeModal = ({
  setShowUpgrade,
  showUpgrade,
  guild,
  vaultUpgrade,
}: UpgradeModalProps) => {
  const [isUpgrading, startTransition] = useTransition();

  const { accessToken } = useAuth();

  const handleConfirmUpgrade = () => {
    if (!accessToken) {
      toast.error("Unauthorized");
      return;
    }
    startTransition(async () => {
      try {
        const response = await upgradeVault({ accessToken, guildId: guild.id });
        if (!response.success) {
          toast.error(response.error || "Upgrade failed");
        } else {
          toast.success("Vault upgraded!");
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.25 } });
          setShowUpgrade(false);
        }
      } catch (error) {
        console.log({ error });
        toast.error("Upgrade failed");
      }
    });
  };

  return (
    <Credenza open={showUpgrade} onOpenChange={setShowUpgrade}>
      <CredenzaContent className="max-w-md p-4">
        <CredenzaHeader>
          <CredenzaTitle>Upgrade Vault</CredenzaTitle>
        </CredenzaHeader>
        <CredenzaBody>
          <div className="space-y-2">
            <div>Current: Level {guild.vaultLevel}</div>
            <div>
              Cost:{" "}
              <strong>
                {vaultUpgrade.resonanceCost.toLocaleString()} Points
              </strong>{" "}
            </div>
            <div className="text-sm text-muted-foreground">
              Vault Balance: {guild.vaultBalance.toLocaleString()} Points ✓
            </div>
          </div>
        </CredenzaBody>
        <CredenzaFooter className="flex gap-2">
          <Button variant="outline" onClick={() => setShowUpgrade(false)}>
            Cancel
          </Button>
          <Button disabled={isUpgrading} onClick={handleConfirmUpgrade}>
            Upgrade
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
};

export default UpgradeModal;
