"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Zap, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { MapRef } from "react-map-gl/maplibre";
import Decimal from "decimal.js";

import { getUserLocation } from "@/lib/utils/location";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  type InitiateNodeAnchoringParams,
  InitiateNodeAnchoringSchema,
} from "@/lib/schema/anchor";
import { useAuth } from "@/components/shared/auth/auth-context";
import { initiateAnchorStaking } from "@/actions/anchor/initiate-staking";
import LocationMap from "./location-map";
import DiscountShowcase from "./discount-showcase";
import { ConfirmationModal } from "./confirmation-modal";
import {
  calculateDiscountedCost,
  calculatePointsBurned,
} from "@/lib/anchors/discount-calculator";
import { useProfile } from "@/hooks/queries/use-profile";

interface AnchoringFormProps {
  anchorCost: string;
}

/**
 * Enhanced Anchoring Form with Discount System
 * Shows cost breakdown, discount showcase, and confirmation modal
 */
export default function AnchoringForm({ anchorCost }: AnchoringFormProps) {
  const [isLoading, startTransition] = useTransition();
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLon, setSelectedLon] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedDiscountLevels, setSelectedDiscountLevels] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const mapRef = useRef<MapRef>(null);
  const router = useRouter();
  const { accessToken } = useAuth();
  const { data: user } = useProfile();

  const isPending = isLoading || isLocating;

  const form = useForm<InitiateNodeAnchoringParams>({
    resolver: zodResolver(InitiateNodeAnchoringSchema),
    defaultValues: {
      latitude: 0,
      longitude: 0,
      accessToken: accessToken ?? "",
      discountLevels: 0,
    },
  });

  const handleMapLocationSelect = (lat: number, lon: number) => {
    setSelectedLat(lat);
    setSelectedLon(lon);
    form.setValue("latitude", lat);
    form.setValue("longitude", lon);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lon, lat],
        zoom: 15.5,
        bearing: 27,
        pitch: 45,
        speed: 0.5,
      });
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const position = await getUserLocation();
      const { latitude, longitude } = position.coords;
      handleMapLocationSelect(latitude, longitude);
      toast.success("Location detected", {
        description: "Your harmonic signature resonates here",
      });
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : "Unable to access your location";
      toast.error("Error", { description });
    } finally {
      setIsLocating(false);
    }
  };

  const onSubmit = (data: InitiateNodeAnchoringParams) => {
    data.discountLevels = selectedDiscountLevels;
    startTransition(async () => {
      try {
        const result = await initiateAnchorStaking(data);
        if (result.success && result.data) {
          toast.success("Anchoring initiated, proceed to payment");
          router.push(`/resonant-anchors/${result.data.id}`);
        } else {
          toast.error("Error", {
            description: result.error,
          });
        }
      } catch (error) {
        toast.error("Error", {
          description:
            error instanceof Error ? error.message : "Something went wrong",
        });
      }
    });
  };

  const userReferralPoints = user?.noOfReferrals ?? 0;
  const userFidelity = user?.resonanceFidelity ?? 0;

  const baseCostDecimal = new Decimal(anchorCost);
  const finalCost =
    selectedDiscountLevels > 0
      ? calculateDiscountedCost(baseCostDecimal, selectedDiscountLevels)
          ?.cost || baseCostDecimal
      : baseCostDecimal;
  const pointsBurned = calculatePointsBurned(
    userFidelity,
    selectedDiscountLevels
  );

  const selectedLocation =
    selectedLat !== null && selectedLon !== null
      ? { lat: selectedLat, lon: selectedLon }
      : null;

  return (
    <div className="flex h-[calc(100vh-16rem)] md:h-screen w-full flex-col bg-background md:rounded-lg md:border md:border-border">
      <div className="relative flex-1 md:min-h-[500px]">
        <LocationMap
          onLocationSelect={handleMapLocationSelect}
          onGeolocationClick={handleUseCurrentLocation}
          selectedLocation={selectedLocation}
          mapRef={mapRef}
        />
      </div>

      {/* Bottom Panel with Cost, Discount, and Submission */}
      <div className="space-y-4 border-t border-border bg-card/50 px-4 py-4 backdrop-blur-sm md:space-y-4 md:border-t-0 md:bg-card md:p-6 md:max-h-[calc(100vh-500px)] md:overflow-y-auto">
        {selectedLat !== null && selectedLon !== null && (
          <>
            {/* Cost Breakdown */}
            <div className="rounded-lg border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs font-medium text-muted-foreground">
                      Anchor Cost
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {anchorCost} π
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Coordinates</p>
                  <p className="font-mono text-xs font-medium text-primary">
                    {selectedLat.toFixed(4)}, {selectedLon.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>

            {/* Discount Showcase */}
            {userReferralPoints > 0 && (
              <DiscountShowcase
                baseCost={baseCostDecimal}
                userReferralPoints={userReferralPoints}
                userFidelity={userFidelity}
                onDiscountLevelsChange={setSelectedDiscountLevels}
                selectedDiscountLevels={selectedDiscountLevels}
              />
            )}

            {/* Warning: Floor Price */}
            {selectedDiscountLevels > 0 && (
              <Alert
                variant="destructive"
                className="bg-amber-500/10 border-amber-500/50"
              >
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-xs text-amber-700 dark:text-amber-400">
                  Cannot apply more discounts—cost would fall below the
                  resonance floor (0.314 π). This is the limit of the
                  Lattice&apos;s gift.
                </AlertDescription>
              </Alert>
            )}

            {/* Submission Button */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3"
              >
                {/* Cost Summary Before Submit */}
                {selectedDiscountLevels > 0 && (
                  <div className="rounded-lg bg-muted/50 p-3 border-l-4 border-primary">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Final Cost</span>
                      <span className="text-lg font-bold text-primary">
                        {finalCost.toString()} π
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  type="button"
                  onClick={() => setShowConfirmation(true)}
                  disabled={
                    isPending || selectedLat === null || selectedLon === null
                  }
                  className="w-full game-button"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Anchoring...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Initiate Resonant Anchor
                    </span>
                  )}
                </Button>
              </form>
            </Form>
          </>
        )}

        {/* Empty State */}
        {selectedLat === null && (
          <div className="text-center space-y-2 py-4">
            <p className="text-sm text-muted-foreground">
              Click on the map or use your location to choose anchor coordinates
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onOpenChange={setShowConfirmation}
        originalCost={baseCostDecimal}
        discountedCost={finalCost}
        discountLevels={selectedDiscountLevels}
        pointsBurned={pointsBurned}
        onConfirm={() => {
          setShowConfirmation(false);
          form.handleSubmit(onSubmit)();
        }}
        isLoading={isLoading}
      />
    </div>
  );
}
