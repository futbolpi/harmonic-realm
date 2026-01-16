"use client";

import { useTransition, useMemo } from "react";
import { AlertCircle, Zap } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaFooter,
  CredenzaDescription,
  CredenzaClose,
} from "@/components/credenza";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { acceptChallenge } from "@/actions/guilds/challenges/accept";
import { useAuth } from "@/components/shared/auth/auth-context";
import { useProfile } from "@/hooks/queries/use-profile";
import type { GuildChallengesData } from "../services";

interface AcceptChallengeModalProps {
  challenge: GuildChallengesData["available"][number];
  guildId: string;
  activeMemberCount: number;
  onClose: () => void;
}

export default function AcceptChallengeModal({
  challenge,
  activeMemberCount,
  guildId,
  onClose,
}: AcceptChallengeModalProps) {
  const { accessToken } = useAuth();
  const { data: profile } = useProfile();
  const [isPending, startTransition] = useTransition();

  const userGuildId = profile?.guildMembership?.guildId;
  const userRole = profile?.guildMembership?.role;
  const vaultLevel = profile?.guildMembership?.guild?.vaultLevel || 0;

  const {
    minVaultLevel,
    minMembers,
    name,
    description,
    icon,
    prestigeReward,
    resonanceReward,
  } = challenge.template;

  // Validate acceptance criteria
  const validation = useMemo(() => {
    const errors: string[] = [];

    if (!userGuildId || userGuildId !== guildId) {
      errors.push("You are not a member of this guild");
    }

    if (userRole !== "LEADER" && userRole !== "OFFICER") {
      errors.push("Only leaders and officers can accept challenges");
    }

    if (vaultLevel < minVaultLevel) {
      errors.push(
        `Guild vault must be level ${minVaultLevel} or higher (current: ${vaultLevel})`
      );
    }

    if (activeMemberCount < minMembers) {
      errors.push(
        `Guild needs at least ${minMembers} active members (current: ${activeMemberCount})`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [
    userGuildId,
    userRole,
    vaultLevel,
    minVaultLevel,
    activeMemberCount,
    minMembers,
    guildId,
  ]);

  const handleAccept = () => {
    if (!accessToken || !validation.isValid) {
      toast.error("Cannot accept challenge");
      return;
    }

    startTransition(async () => {
      try {
        const result = await acceptChallenge({
          guildId,
          challengeId: challenge.id,
          accessToken,
        });

        if (result.success) {
          toast.success(
            `🎯 ${name} accepted! Your guild rises to the challenge.`
          );
          onClose();
        } else {
          toast.error(result.error || "Failed to accept challenge");
        }
      } catch (error) {
        console.error("Challenge acceptance error:", error);
        toast.error("An unexpected error occurred");
      }
    });
  };

  return (
    <Credenza open={!!challenge} onOpenChange={onClose}>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            {name}
          </CredenzaTitle>
          <CredenzaDescription>{description}</CredenzaDescription>
        </CredenzaHeader>

        <CredenzaBody className="py-4 space-y-4 overflow-y-auto max-h-96">
          {/* Requirements */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-sm">Requirements</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Minimum Members</span>
                <Badge
                  variant={
                    activeMemberCount >= minMembers ? "default" : "destructive"
                  }
                >
                  {activeMemberCount} / {minMembers}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Minimum Vault Level
                </span>
                <Badge
                  variant={
                    vaultLevel >= minVaultLevel ? "default" : "destructive"
                  }
                >
                  {vaultLevel} / {minVaultLevel}
                </Badge>
              </div>
            </div>
          </div>

          {/* Rewards */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm">Rewards</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">💎 RESONANCE</span>
                <div className="font-semibold text-lg">{resonanceReward}</div>
              </div>
              <div>
                <span className="text-muted-foreground">⭐ Prestige</span>
                <div className="font-semibold text-lg">{prestigeReward}</div>
              </div>
            </div>
          </div>

          {/* Validation Errors */}
          {!validation.isValid && (
            <Alert
              variant="destructive"
              className="bg-destructive/10 border-destructive/30"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs space-y-1">
                {validation.errors.map((error, i) => (
                  <div key={i}>• {error}</div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          {/* Lore Message */}
          <p className="text-xs text-muted-foreground italic text-center pt-2">
            &quot;When the guild rises together, the Lattice resonates with
            purpose...&quot;
          </p>
        </CredenzaBody>

        <CredenzaFooter>
          <CredenzaClose asChild>
            <Button variant="outline" onClick={onClose}>
              Decline
            </Button>
          </CredenzaClose>
          <Button
            onClick={handleAccept}
            disabled={isPending || !validation.isValid}
            className="gap-2"
          >
            {isPending ? (
              <>
                <Zap className="h-4 w-4 animate-pulse" />
                Accepting...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Accept Challenge
              </>
            )}
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
