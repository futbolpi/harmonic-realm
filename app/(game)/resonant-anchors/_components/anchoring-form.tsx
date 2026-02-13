"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Zap, AlertCircle, ChevronUp, ChevronDown } from "lucide-react";
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
import {
  calculateDiscountedCost,
  calculatePointsBurned,
} from "@/lib/anchors/discount-calculator";
import { useProfile } from "@/hooks/queries/use-profile";
import LocationMap from "./location-map";
import DiscountShowcase from "./discount-showcase";
import { ConfirmationModal } from "./confirmation-modal";
import { CostBreakdownCard } from "./cost-breakdown-card";

interface AnchoringFormProps {
  anchorCost: string;
}

export default function AnchoringForm({ anchorCost }: AnchoringFormProps) {
  const [isLoading, startTransition] = useTransition();
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLon, setSelectedLon] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedDiscountLevels, setSelectedDiscountLevels] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

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
    selectedDiscountLevels,
  );

  const selectedLocation =
    selectedLat !== null && selectedLon !== null
      ? { lat: selectedLat, lon: selectedLon }
      : null;

  const isBelowFloor =
    selectedDiscountLevels > 0 &&
    calculateDiscountedCost(baseCostDecimal, selectedDiscountLevels) === null;

  return (
    <div className="flex h-[calc(100vh-16rem)] w-full flex-col gap-0 md:flex-row md:gap-4 md:h-screen bg-background">
      {/* Map Section - Full screen on mobile, 60% on desktop */}
      <div className="relative flex-1 md:rounded-lg md:border md:border-border md:overflow-hidden">
        <LocationMap
          onLocationSelect={handleMapLocationSelect}
          onGeolocationClick={handleUseCurrentLocation}
          selectedLocation={selectedLocation}
          mapRef={mapRef}
        />
      </div>

      {/* Desktop Side Panel - Hidden on mobile */}
      <div className="hidden md:flex md:w-100 md:flex-col md:gap-4 md:overflow-y-auto">
        {selectedLocation && (
          <>
            <CostBreakdownCard
              baseCost={baseCostDecimal}
              finalCost={finalCost}
              selectedLat={selectedLat}
              selectedLon={selectedLon}
              selectedDiscountLevels={selectedDiscountLevels}
            />

            {userReferralPoints > 0 && (
              <DiscountShowcase
                baseCost={baseCostDecimal}
                userReferralPoints={userReferralPoints}
                userFidelity={userFidelity}
                onDiscountLevelsChange={setSelectedDiscountLevels}
                selectedDiscountLevels={selectedDiscountLevels}
              />
            )}

            {isBelowFloor && (
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

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3"
              >
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

        {!selectedLocation && (
          <div className="text-center space-y-2 py-8 text-muted-foreground">
            <p className="text-sm">
              Click on the map or use the crosshair button to choose anchor
              coordinates
            </p>
          </div>
        )}
      </div>

      {/* Mobile Bottom Sheet */}
      {selectedLocation && (
        <div className="md:hidden fixed bottom-20 left-4 right-4 z-40 border-t border-border">
          <button
            onClick={() => setIsBottomSheetOpen(!isBottomSheetOpen)}
            className="w-full bg-card/95 backdrop-blur-sm p-3 flex items-center justify-center gap-2 hover:bg-card transition-colors"
          >
            {isBottomSheetOpen ? (
              <>
                <ChevronDown className="h-4 w-4" />
                <span className="text-sm font-medium">Close</span>
              </>
            ) : (
              <>
                <ChevronUp className="h-4 w-4" />
                <span className="text-sm font-medium">Anchor Details</span>
              </>
            )}
          </button>

          {isBottomSheetOpen && (
            <div className="bg-card/95 backdrop-blur-sm max-h-[70vh] overflow-y-auto space-y-4 px-4 py-4">
              <CostBreakdownCard
                baseCost={baseCostDecimal}
                finalCost={finalCost}
                selectedLat={selectedLat}
                selectedLon={selectedLon}
                selectedDiscountLevels={selectedDiscountLevels}
              />

              {userReferralPoints > 0 && (
                <DiscountShowcase
                  baseCost={baseCostDecimal}
                  userReferralPoints={userReferralPoints}
                  userFidelity={userFidelity}
                  onDiscountLevelsChange={setSelectedDiscountLevels}
                  selectedDiscountLevels={selectedDiscountLevels}
                />
              )}

              {isBelowFloor && (
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

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-3"
                >
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
                      isPending ||
                      selectedLat === null ||
                      selectedLon === null ||
                      isBelowFloor
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
            </div>
          )}
        </div>
      )}

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
