"use client";

import { Loader2, TrendingUp } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  calculateChamberUpgradeCost,
  canUpgradeChamber,
  CHAMBER_CONSTANTS,
  formatBoostPercentage,
} from "@/lib/utils/chambers";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/queries/use-profile";
import { useAuth } from "@/components/shared/auth/auth-context";
import { upgradeChamber } from "@/actions/chambers/upgrade-chamber";

type UpgradeSectionProps = {
  chamber: { level: number; id: string };
  onClose: () => void;
  ownerId: string;
};

const UpgradeSection = ({ chamber, onClose, ownerId }: UpgradeSectionProps) => {
  const [isPending, startTransition] = useTransition();

  const { data: userProfile, refreshProfile } = useProfile();
  const { accessToken } = useAuth();

  const userBalance = userProfile?.sharePoints || 0;
  const upgradeCost =
    chamber.level < CHAMBER_CONSTANTS.MAX_LEVEL
      ? calculateChamberUpgradeCost(chamber.level)
      : 0;

  const upgradePermission = canUpgradeChamber({
    currentLevel: chamber.level,
    userBalance,
    chamberActive: true,
  });

  const handleUpgrade = () => {
    if (!upgradePermission.allowed || !accessToken) {
      toast.error(upgradePermission.reason || "Cannot upgrade chamber");
      return;
    }

    startTransition(async () => {
      try {
        const result = await upgradeChamber({
          accessToken,
          chamberId: chamber.id,
        });

        if (result.success && result.data) {
          toast.success("Chamber upgraded!", {
            description: `Now Level ${result.data.newLevel} with ${formatBoostPercentage(result.data.newLevel)} boost`,
          });
          refreshProfile();
          onClose();
        } else {
          toast.error(result.error || "Failed to upgrade chamber");
        }
      } catch (error) {
        console.error("Upgrade error:", error);
        toast.error("An unexpected error occurred");
      }
    });
  };

  if (
    chamber.level >= CHAMBER_CONSTANTS.MAX_LEVEL ||
    ownerId !== userProfile?.id
  ) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Upgrade Chamber
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Current Level</span>
          <Badge variant="outline">{chamber.level}</Badge>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Next Level</span>
          <Badge variant="outline">{chamber.level + 1}</Badge>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">New Boost</span>
          <span className="font-bold text-primary">
            {formatBoostPercentage(chamber.level + 1)}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Cost</span>
          <Badge
            variant={userBalance >= upgradeCost ? "default" : "destructive"}
          >
            {upgradeCost} RES
          </Badge>
        </div>

        {!upgradePermission.allowed && (
          <Alert variant="destructive">
            <AlertDescription className="text-xs">
              {upgradePermission.reason}
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleUpgrade}
          disabled={!upgradePermission.allowed || isPending}
          className="w-full"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Upgrading...
            </>
          ) : (
            <>
              <TrendingUp className="mr-2 h-4 w-4" />
              Upgrade ({upgradeCost} RES)
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UpgradeSection;
