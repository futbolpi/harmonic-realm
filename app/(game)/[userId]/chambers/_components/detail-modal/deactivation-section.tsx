"use client";

import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState, useTransition } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  calculateDeactivationRefund,
  canDeactivateChamber,
  CHAMBER_CONSTANTS,
} from "@/lib/utils/chambers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/queries/use-profile";
import { useAuth } from "@/components/shared/auth/auth-context";
import { deactivateChamber } from "@/actions/chambers/deactivate-chamber";

type DeactivationSectionProps = {
  chamber: { totalResonanceInvested: number; id: string };
  onClose: () => void;
  ownerId: string;
};

const DeactivationSection = ({
  chamber,
  onClose,
  ownerId,
}: DeactivationSectionProps) => {
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { data: userProfile, refreshProfile } = useProfile();
  const { accessToken } = useAuth();
  const deactivationRefund = calculateDeactivationRefund(
    chamber.totalResonanceInvested,
  );

  const deactivatePermission = canDeactivateChamber({
    chamberActive: true,
  });

  const handleDeactivate = () => {
    if (!confirmDeactivate) {
      setConfirmDeactivate(true);
      return;
    }

    if (!deactivatePermission.allowed || !accessToken) {
      toast.error(deactivatePermission.reason || "Cannot deactivate chamber");
      return;
    }

    startTransition(async () => {
      try {
        const result = await deactivateChamber({
          accessToken,
          chamberId: chamber.id,
        });

        if (result.success && result.data) {
          toast.success("Chamber deactivated", {
            description: `Refunded ${result.data.refund} RES (${result.data.refundPercentage}% of investment)`,
          });
          refreshProfile();
          onClose();
        } else {
          toast.error(result.error || "Failed to deactivate chamber");
        }
      } catch (error) {
        console.error("Deactivation error:", error);
        toast.error("An unexpected error occurred");
      }
    });
  };

  if (ownerId !== userProfile?.id) {
    return null;
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-destructive">
          <Trash2 className="h-4 w-4" />
          Deactivate Chamber
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Alert>
          <AlertDescription className="text-xs">
            Deactivating this chamber will remove its boost effect and free up a
            chamber slot. You will receive a{" "}
            {CHAMBER_CONSTANTS.DEACTIVATION_REFUND_PERCENT}% refund.
          </AlertDescription>
        </Alert>

        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Refund Amount</span>
          <Badge variant="outline" className="font-mono">
            {deactivationRefund} RES
          </Badge>
        </div>

        <Button
          onClick={handleDeactivate}
          disabled={!deactivatePermission.allowed || isPending}
          variant={confirmDeactivate ? "destructive" : "outline"}
          className="w-full"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deactivating...
            </>
          ) : confirmDeactivate ? (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Confirm Deactivation
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Deactivate Chamber
            </>
          )}
        </Button>

        {confirmDeactivate && (
          <Button
            onClick={() => setConfirmDeactivate(false)}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DeactivationSection;
