"use client";

import { Loader2, Wrench } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

import { maintainChamber } from "@/actions/chambers/maintain-chamber";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  calculateChamberMaintenanceCost,
  canMaintainChamber,
  getDurabilityStatus,
} from "@/lib/utils/chambers";
import { useAuth } from "@/components/shared/auth/auth-context";
import { useProfile } from "@/hooks/queries/use-profile";

type MaintenanceSectionProps = {
  chamber: {
    currentDurability: number;
    id: string;
    level: number;
    lastMaintenanceAt: string;
  };
  onClose: () => void;
  ownerId: string;
};

const MaintenanceSection = ({
  chamber,
  onClose,
  ownerId,
}: MaintenanceSectionProps) => {
  const [isPending, startTransition] = useTransition();

  const { data: userProfile, refreshProfile } = useProfile();
  const { accessToken } = useAuth();

  const userBalance = userProfile?.sharePoints || 0;

  const durabilityStatus = getDurabilityStatus(chamber.currentDurability);
  const maintenanceCost = calculateChamberMaintenanceCost(chamber.level);

  const maintenancePermission = canMaintainChamber({
    level: chamber.level,
    lastMaintenanceAt: new Date(chamber.lastMaintenanceAt),
    userBalance,
    chamberActive: true,
  });

  const handleMaintain = () => {
    if (!maintenancePermission.allowed || !accessToken) {
      toast.error(maintenancePermission.reason || "Cannot maintain chamber");
      return;
    }

    startTransition(async () => {
      try {
        const result = await maintainChamber({
          accessToken,
          chamberId: chamber.id,
        });

        if (result.success && result.data) {
          toast.success("Chamber maintained!", {
            description: `Durability restored to 100%. Next maintenance due ${formatDistanceToNow(result.data.nextMaintenanceDue, { addSuffix: true })}`,
          });
          refreshProfile();
          onClose();
        } else {
          toast.error(result.error || "Failed to maintain chamber");
        }
      } catch (error) {
        console.error("Maintenance error:", error);
        toast.error("An unexpected error occurred");
      }
    });
  };

  if (ownerId !== userProfile?.id) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Wrench className="h-4 w-4 text-blue-500" />
          Maintenance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Current Durability</span>
          <span className={durabilityStatus.color}>
            {chamber.currentDurability.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Cost</span>
          <Badge
            variant={userBalance >= maintenanceCost ? "default" : "destructive"}
          >
            {maintenanceCost} RES
          </Badge>
        </div>

        {!maintenancePermission.allowed && (
          <Alert>
            <AlertDescription className="text-xs">
              {maintenancePermission.reason}
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleMaintain}
          disabled={!maintenancePermission.allowed || isPending}
          variant="secondary"
          className="w-full"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Maintaining...
            </>
          ) : (
            <>
              <Wrench className="mr-2 h-4 w-4" />
              Maintain ({maintenanceCost} RES)
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MaintenanceSection;
