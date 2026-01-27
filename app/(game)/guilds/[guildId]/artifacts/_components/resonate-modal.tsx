"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/components/shared/auth/auth-context";
import { useProfile } from "@/hooks/queries/use-profile";
import { resonateShardsAction } from "@/actions/guilds/artifacts/resonate-shards";
import { canResonateShards } from "@/lib/utils/guild/artifacts-utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

type ResonateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: {
    id: string;
    name: string;
    minVaultLevel: number;
  };
  guildId: string;
  guildVaultLevel: number;
};

export default function ResonateModal({
  open,
  onOpenChange,
  template,
  guildId,
  guildVaultLevel,
}: ResonateModalProps) {
  const [amount, setAmount] = useState(10);
  const [isResonating, startTransition] = useTransition();

  const { accessToken } = useAuth();
  const { data: profile, refreshProfile } = useProfile();

  const userShards = profile?.guildMembership?.echoShards || 0;
  const userGuildId = profile?.guildMembership?.guildId || null;

  const { canResonate, reason } = canResonateShards({
    userGuildId,
    targetGuildId: guildId,
    userShards,
    shardsToResonate: amount,
    guildVaultLevel,
    minVaultLevel: template.minVaultLevel,
  });

  const handleResonate = () => {
    if (!accessToken || !canResonate) {
      toast.error(reason || "Cannot resonate shards");
      return;
    }

    startTransition(async () => {
      try {
        const result = await resonateShardsAction({
          guildId,
          templateId: template.id,
          shards: amount,
          accessToken,
        });

        if (!result.success) {
          toast.error(result.error || "Failed to resonate shards");
          return;
        }

        refreshProfile();
        toast.success(`Resonated ${amount} shards`);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        onOpenChange(false);
      } catch (error) {
        console.error(error);
        toast.error("Failed to resonate shards");
      }
    });
  };

  const quickAmounts = [10, 25, 50, userShards];

  return (
    <Credenza open={open} onOpenChange={onOpenChange}>
      <CredenzaContent className="max-w-md">
        <CredenzaHeader>
          <CredenzaTitle>Resonate Echo Shards</CredenzaTitle>
          <CredenzaDescription>
            Contribute shards toward {template.name}
          </CredenzaDescription>
        </CredenzaHeader>

        <CredenzaBody className="py-4 space-y-4 overflow-y-auto max-h-96">
          {!canResonate && (
            <Alert variant="destructive">
              <AlertDescription>{reason}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>Your Echo Shards: {userShards}</Label>
            <div className="space-y-3">
              <Input
                type="number"
                min={1}
                max={userShards}
                value={amount}
                onChange={(e) =>
                  setAmount(Math.max(1, parseInt(e.target.value) || 1))
                }
              />

              <Slider
                value={[amount]}
                min={1}
                max={Math.max(1, userShards)}
                onValueChange={(v) => setAmount(v[0])}
              />

              <div className="flex gap-2">
                {quickAmounts.map((q) => (
                  <Button
                    key={q}
                    size="sm"
                    variant="outline"
                    onClick={() => setAmount(Math.min(q, userShards))}
                    disabled={q > userShards}
                  >
                    {q === userShards ? "MAX" : q}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground p-3 rounded-md bg-muted/50">
            💡 Echo Shards are earned from completed mining sessions, tuning
            sessions and drifts. Contribute them to help craft and upgrade guild
            artifacts.
          </div>
        </CredenzaBody>

        <CredenzaFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isResonating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleResonate}
            disabled={isResonating || !canResonate}
          >
            {isResonating ? "Resonating..." : `Resonate ${amount} Shards`}
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
