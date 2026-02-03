"use client";

import { useTransition } from "react";
import { Loader2, MapPin, Zap, Crown, Info } from "lucide-react";
import { toast } from "sonner";

import {
  Credenza,
  CredenzaBody,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/credenza";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  calculateChamberCreationCost,
  canCreateChamber,
  CHAMBER_CONSTANTS,
  formatBoostPercentage,
} from "@/lib/utils/chambers";
import { createChamber } from "@/actions/chambers/create-chamber";
import { useAuth } from "@/components/shared/auth/auth-context";
import { useProfile } from "@/hooks/queries/use-profile";

interface CreateChamberModalProps {
  latitude: number;
  longitude: number;
  existingChambers: Array<{ latitude: number; longitude: number }>;
  trigger: React.ReactNode;
  onClose: () => void;
}

export function CreateChamberModal({
  latitude,
  longitude,
  existingChambers,
  trigger,
  onClose,
}: CreateChamberModalProps) {
  const [isPending, startTransition] = useTransition();

  const { accessToken } = useAuth();
  const { data: profile, refreshProfile } = useProfile();

  const userBalance = profile?.sharePoints || 0;

  // Calculate permission and cost
  const permission = canCreateChamber({
    existingCount: existingChambers.length,
    userBalance,
    proposedLat: latitude,
    proposedLng: longitude,
    existingChambers,
  });

  const cost = calculateChamberCreationCost(existingChambers.length);
  const canAfford = userBalance >= cost;

  const handleCreate = () => {
    if (!permission.allowed || !accessToken) {
      toast.error(permission.reason || "Cannot create chamber");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createChamber({
          accessToken,
          latitude,
          longitude,
        });

        if (result.success && result.data) {
          toast.success("Echo Resonance Chamber manifested!", {
            description: `Level ${result.data.level} chamber created. ${formatBoostPercentage(result.data.level)} boost active within 5km radius.`,
          });
          refreshProfile();
          onClose();
        } else {
          toast.error(result.error || "Failed to create chamber");
        }
      } catch (error) {
        console.error("Chamber creation error:", error);
        toast.error("An unexpected error occurred");
      }
    });
  };

  return (
    <Credenza>
      <CredenzaTrigger asChild>{trigger}</CredenzaTrigger>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Manifest Echo Resonance Chamber
          </CredenzaTitle>
          <CredenzaDescription>
            Create a harmonic sanctuary to boost SharePoint earnings within its
            sphere of influence
          </CredenzaDescription>
        </CredenzaHeader>

        <CredenzaBody className="space-y-4 py-4 max-h-96 overflow-y-auto">
          {/* Location Info */}
          <div className="p-3 rounded-lg bg-muted/20 flex items-center gap-3">
            <MapPin className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <div className="text-sm font-medium">Chamber Location</div>
              <div className="text-xs text-muted-foreground">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Creation Cost</span>
              <Badge
                variant={canAfford ? "default" : "destructive"}
                className="font-mono"
              >
                {cost} RES
              </Badge>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Your Balance</span>
              <span className="font-mono">{userBalance.toFixed(2)} RES</span>
            </div>
            {!canAfford && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>
                  Insufficient RESONANCE. Need {(cost - userBalance).toFixed(2)}{" "}
                  more RES.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Benefits Preview */}
          <div className="space-y-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 text-primary">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-semibold">Chamber Benefits</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground">Initial Boost</div>
                <div className="font-bold text-primary">
                  {formatBoostPercentage(1)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Radius</div>
                <div className="font-bold">
                  {CHAMBER_CONSTANTS.BOOST_RADIUS_KM}km
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Max Level</div>
                <div className="font-bold">{CHAMBER_CONSTANTS.MAX_LEVEL}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Max Boost</div>
                <div className="font-bold text-primary">
                  {formatBoostPercentage(CHAMBER_CONSTANTS.MAX_LEVEL)}
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Notice */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Chambers require maintenance every{" "}
              {CHAMBER_CONSTANTS.MAINTENANCE_INTERVAL_DAYS} days to maintain
              durability. Durability decays at{" "}
              {CHAMBER_CONSTANTS.DURABILITY_DECAY_PER_DAY.toFixed(1)}% per day.
            </AlertDescription>
          </Alert>

          {/* Permission Errors */}
          {!permission.allowed && (
            <Alert variant="destructive">
              <AlertDescription>{permission.reason}</AlertDescription>
            </Alert>
          )}
        </CredenzaBody>

        <CredenzaFooter>
          <Button
            onClick={handleCreate}
            disabled={!permission.allowed || !canAfford || isPending}
            className="w-full"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Manifesting Chamber...
              </>
            ) : (
              <>
                <Crown className="mr-2 h-4 w-4" />
                Create Chamber ({cost} RES)
              </>
            )}
          </Button>
          <CredenzaClose asChild>
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </CredenzaClose>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
