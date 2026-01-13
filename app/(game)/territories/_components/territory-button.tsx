"use client";

import {
  useMemo,
  useTransition,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useRouter } from "next/navigation";
import { Zap, Shield, Sword, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { calculateMinStake } from "@/lib/guild/territories";
import type { TerritoryForMap } from "@/lib/api-helpers/server/guilds/territories-map";
import { useAuth } from "@/components/shared/auth/auth-context";
import { useProfile } from "@/hooks/queries/use-profile";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { stakeTerritory } from "@/actions/guilds/territories/stake";
import { TERRITORY_UNLOCKED_LEVEL } from "@/config/guilds/constants";

type TerritoryButtonProps = {
  selectedTerritoryData: TerritoryForMap | null;
  currentHex: string | null;
  setShowModal: Dispatch<SetStateAction<boolean>>;
};

const TerritoryButton = ({
  selectedTerritoryData,
  currentHex,
  setShowModal,
}: TerritoryButtonProps) => {
  const router = useRouter();
  const { accessToken } = useAuth();
  const { data: profile } = useProfile();
  const [isPending, startTransition] = useTransition();

  const userGuildId = profile?.guildMembership?.guildId;
  const userRole = profile?.guildMembership?.role;
  const vaultBalance = profile?.guildMembership?.guild?.vaultBalance || 0;
  const vaultLevel = profile?.guildMembership?.guild?.vaultLevel || 0;

  // Determine territory state
  const isUnclaimed = !selectedTerritoryData?.guild;
  const isUserOwner = selectedTerritoryData?.guild?.id === userGuildId;
  const isUserLeaderOrOfficer = userRole === "LEADER" || userRole === "OFFICER";

  const stakingValidation = useMemo(() => {
    // Only validate if territory is unclaimed
    if (!isUnclaimed) {
      return { eligible: false, error: null };
    }

    if (!userGuildId) {
      return {
        eligible: false,
        error: "You must be in a guild to stake territories",
      };
    }

    if (!isUserLeaderOrOfficer) {
      return {
        eligible: false,
        error: "Only guild leaders and officers can stake territories",
      };
    }

    const minStake = calculateMinStake(
      selectedTerritoryData?.trafficScore || 0
    );

    if (vaultBalance < minStake) {
      return {
        eligible: false,
        error: `Insufficient vault. Need ${minStake} RESONANCE (have ${vaultBalance})`,
      };
    }

    if (vaultLevel < TERRITORY_UNLOCKED_LEVEL) {
      return {
        eligible: false,
        error: `Low vault level. Need Level ${TERRITORY_UNLOCKED_LEVEL}+`,
      };
    }

    return { eligible: true, error: null };
  }, [
    isUnclaimed,
    userGuildId,
    isUserLeaderOrOfficer,
    vaultBalance,
    selectedTerritoryData?.trafficScore,
    vaultLevel,
  ]);

  const handleStake = async () => {
    if (!accessToken || !userGuildId || !currentHex) {
      toast.error("Authentication required");
      return;
    }

    const minStake = calculateMinStake(
      selectedTerritoryData?.trafficScore || 0
    );

    startTransition(async () => {
      try {
        const result = await stakeTerritory({
          accessToken,
          guildId: userGuildId,
          hexId: currentHex,
          stakeAmount: minStake,
        });

        if (result.success) {
          toast.success("Territory claimed! Entering detail page...");
          setShowModal(false);
          // Route to territory detail page
          setTimeout(() => {
            router.push(`/territories/${currentHex}`);
          }, 500);
        } else {
          toast.error(result.error || "Failed to stake territory");
        }
      } catch (error) {
        console.error("Staking error:", error);
        toast.error("An error occurred while staking");
      }
    });
  };

  if (isUnclaimed) {
    // Territory has no DB entry - show staking button or validation error
    return (
      <div className="space-y-3">
        {!stakingValidation.eligible && stakingValidation.error && (
          <Alert
            variant="destructive"
            className="bg-destructive/10 border-destructive/30"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {stakingValidation.error}
            </AlertDescription>
          </Alert>
        )}
        <Button
          onClick={handleStake}
          disabled={isPending || !stakingValidation.eligible}
          className="w-full gap-2"
          variant={stakingValidation.eligible ? "default" : "secondary"}
        >
          <Zap className="w-4 h-4" />
          {isPending ? "Staking Territory..." : "Stake Territory"}
        </Button>
      </div>
    );
  }

  // Territory exists in DB - show navigation buttons with contextual text
  return (
    <div className="space-y-3">
      {isUserOwner ? (
        // User owns this territory
        <Button
          onClick={() => {
            setShowModal(false);
            router.push(`/territories/${selectedTerritoryData.hexId}`);
          }}
          className="w-full gap-2"
          variant="default"
        >
          <Shield className="w-4 h-4" />
          View Control Panel
        </Button>
      ) : (
        // User doesn't own - can challenge
        <Button
          onClick={() => {
            setShowModal(false);
            router.push(`/territories/${selectedTerritoryData.hexId}`);
          }}
          className="w-full gap-2"
          variant="outline"
        >
          <Sword className="w-4 h-4" />
          {selectedTerritoryData.activeChallengeId
            ? "View Territory"
            : "Challenge Territory"}
        </Button>
      )}
    </div>
  );
};

export default TerritoryButton;
