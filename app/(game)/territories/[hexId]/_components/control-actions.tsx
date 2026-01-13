"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sword, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/shared/auth/auth-context";
import { useProfile } from "@/hooks/queries/use-profile";
import { TERRITORY_UNLOCKED_LEVEL } from "@/config/guilds/constants";
import { challengeTerritory } from "@/actions/guilds/territories/challenge";
import { calculateMinStake } from "@/lib/guild/territories";
import { stakeTerritory } from "@/actions/guilds/territories/stake";

interface Props {
  territory: {
    guild: { id: string } | null;
    currentStake: number;
    trafficScore: number;
    centerLat: number;
    centerLon: number;
    hexId: string;
  };
  type: "claim" | "challenge";
}

export default function TerritoryControlActions({ territory, type }: Props) {
  const router = useRouter();
  const { accessToken } = useAuth();
  const { data: profile, refreshProfile } = useProfile();
  const [isPending, startTransition] = useTransition();

  const userGuildId = profile?.guildMembership?.guildId;
  const userRole = profile?.guildMembership?.role;
  const vaultBalance = profile?.guildMembership?.guild?.vaultBalance || 0;
  const vaultLevel = profile?.guildMembership?.guild?.vaultLevel || 0;
  const isLeaderOrOfficer = userRole === "LEADER" || userRole === "OFFICER";

  const handleChallenge = async () => {
    if (!accessToken || !userGuildId) {
      toast.error("Authentication required");
      return;
    }

    if (!isLeaderOrOfficer) {
      toast.error("Only guild leaders/officers can challenge");
      return;
    }

    if (userGuildId === territory.guild?.id) {
      toast.error("Cannot challenge own territory");
      return;
    }

    const stakeRequired = territory.currentStake;
    if (vaultBalance < stakeRequired) {
      toast.error(
        `Insufficient vault balance. Need ${stakeRequired} RESONANCE`
      );
      return;
    }

    if (vaultLevel < TERRITORY_UNLOCKED_LEVEL) {
      toast.error(`Low vault level. Need Level ${TERRITORY_UNLOCKED_LEVEL}+`);
      return;
    }

    startTransition(async () => {
      try {
        const result = await challengeTerritory({
          accessToken,
          guildId: userGuildId,
          hexId: territory.hexId,
          stakeAmount: stakeRequired,
        });

        if (result.success) {
          toast.success("Challenge initiated! Redirecting...");
          refreshProfile();
          setTimeout(() => {
            router.push(
              `/map?lat=${territory.centerLat}&lng=${territory.centerLon}`
            );
          }, 500);
        } else {
          toast.error(result.error || "Failed to challenge territory");
        }
      } catch (error) {
        console.error("Challenge error:", error);
        toast.error("An error occurred while challenging");
      }
    });
  };

  const handleStake = async () => {
    if (!accessToken || !userGuildId) {
      toast.error("Authentication required");
      return;
    }

    if (!isLeaderOrOfficer) {
      toast.error("Only guild leaders/officers can stake");
      return;
    }

    if (territory.guild?.id) {
      toast.error("Territory is already controlled");
      return;
    }

    const minStake = calculateMinStake(territory.trafficScore || 0);

    if (vaultBalance < minStake) {
      toast.error(`Insufficient vault balance. Need ${minStake} RESONANCE`);
      return;
    }

    if (vaultLevel < TERRITORY_UNLOCKED_LEVEL) {
      toast.error(`Low vault level. Need Level ${TERRITORY_UNLOCKED_LEVEL}+`);
      return;
    }

    startTransition(async () => {
      try {
        // Call server action
        const result = await stakeTerritory({
          accessToken,
          guildId: userGuildId,
          hexId: territory.hexId,
          stakeAmount: minStake,
        });

        if (result.success) {
          toast.success("Territory staked! Redirecting...");
          refreshProfile();
        } else {
          toast.error(result.error || "Failed to stake territory");
        }
      } catch (error) {
        console.error("Stake error:", error);
        toast.error("An error occurred while staking");
      }
    });
  };

  // Common UI bits
  const showVaultLevelWarning = vaultLevel < TERRITORY_UNLOCKED_LEVEL;

  if (type === "challenge") {
    const canChallenge =
      isLeaderOrOfficer &&
      vaultBalance >= territory.currentStake &&
      vaultLevel >= TERRITORY_UNLOCKED_LEVEL &&
      userGuildId !== territory.guild?.id;

    return (
      <div className="space-y-2">
        {showVaultLevelWarning && (
          <div className="flex gap-2 text-xs text-amber-600 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <p>
              Vault level too low to perform challenges (Level{" "}
              {TERRITORY_UNLOCKED_LEVEL}+)
            </p>
          </div>
        )}

        {!isLeaderOrOfficer && (
          <div className="flex gap-2 text-xs text-amber-600 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <p>Only guild leaders/officers can challenge</p>
          </div>
        )}
        {isLeaderOrOfficer && vaultBalance < territory.currentStake && (
          <div className="flex gap-2 text-xs text-red-600 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <p>
              Insufficient vault balance ({vaultBalance} /{" "}
              {territory.currentStake})
            </p>
          </div>
        )}
        <Button
          onClick={handleChallenge}
          disabled={isPending || !canChallenge}
          className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white"
        >
          <Sword className="w-4 h-4" />
          {isPending ? "Initiating Challenge..." : "Challenge Territory"}
        </Button>
      </div>
    );
  }

  if (type === "claim") {
    const canStake =
      isLeaderOrOfficer &&
      vaultBalance >= calculateMinStake(territory.trafficScore || 0) &&
      !territory.guild?.id &&
      vaultLevel >= TERRITORY_UNLOCKED_LEVEL;

    return (
      <div className="space-y-2">
        {showVaultLevelWarning && (
          <div className="flex gap-2 text-xs text-amber-600 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <p>
              Vault level too low to stake territories (Level{" "}
              {TERRITORY_UNLOCKED_LEVEL}+)
            </p>
          </div>
        )}

        {!isLeaderOrOfficer && (
          <div className="flex gap-2 text-xs text-amber-600 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <p>Only guild leaders/officers can stake territories</p>
          </div>
        )}

        {isLeaderOrOfficer &&
          vaultBalance < calculateMinStake(territory.trafficScore || 0) && (
            <div className="flex gap-2 text-xs text-red-600 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <p>
                Insufficient vault balance ({vaultBalance} /{" "}
                {calculateMinStake(territory.trafficScore || 0)})
              </p>
            </div>
          )}

        <Button
          onClick={handleStake}
          disabled={isPending || !canStake}
          className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Sword className="w-4 h-4" />
          {isPending ? "Staking..." : "Stake Territory"}
        </Button>
      </div>
    );
  }

  return null;
}
