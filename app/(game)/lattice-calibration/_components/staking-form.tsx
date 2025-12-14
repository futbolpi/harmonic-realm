"use client";

import { useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Zap } from "lucide-react";
import type { MapRef } from "react-map-gl/maplibre";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  InitiateCalibrationSchema,
  InitiateCalibrationParams,
} from "@/lib/schema/calibration";
import { useAuth } from "@/components/shared/auth/auth-context";
import { initiateCalibrationStaking } from "@/actions/calibration/initiate-staking";
import { getUserLocation } from "@/lib/utils/location";
import { LocationMap } from "./location-map";

interface StakingFormProps {
  phase: { requiredPiFunding: string; currentProgress?: string };
}

export function StakingForm({ phase }: StakingFormProps) {
  const [isLoading, startTransition] = useTransition();
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLon, setSelectedLon] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const mapRef = useRef<MapRef>(null);

  const router = useRouter();

  const { accessToken } = useAuth();

  const isPending = isLoading || isLocating;

  const form = useForm({
    resolver: zodResolver(InitiateCalibrationSchema),
    defaultValues: {
      piContributed: 3.14,
      currentLat: 0,
      currentLon: 0,
      accessToken: accessToken ?? "",
    },
  });

  const handleMapLocationSelect = (lat: number, lon: number) => {
    setSelectedLat(lat);
    setSelectedLon(lon);
    form.setValue("currentLat", lat);
    form.setValue("currentLon", lon);
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

  // Get user location
  const handleUseCurrentLocation = async () => {
    setIsLocating(true);

    try {
      const position = await getUserLocation();
      const { latitude, longitude } = position.coords;
      handleMapLocationSelect(latitude, longitude);
      toast.success("Location detected", {
        description: `Using coordinates: ${latitude.toFixed(
          4
        )}, ${longitude.toFixed(4)}`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to get location, please refresh browser";
      toast.error(errorMessage);
    } finally {
      setIsLocating(false);
    }
  };

  const onSubmit = async (data: InitiateCalibrationParams) => {
    startTransition(async () => {
      try {
        const result = await initiateCalibrationStaking(data);
        if (result.success && result.data) {
          toast.success("Staking initiated successfully, proceed to payment");
          router.push(`/awakening-contributions/${result.data.id}`);
        } else {
          toast.error("Staking failed", {
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

  const selectedLocation =
    selectedLat !== null && selectedLon !== null
      ? {
          lat: selectedLat,
          lon: selectedLon,
        }
      : null;

  return (
    <div className="flex h-[calc(100vh-16rem)] md:h-screen w-full flex-col bg-background md:rounded-lg md:border md:border-border">
      <div className="relative flex-1 md:min-h-[500px]">
        <LocationMap
          onLocationSelect={handleMapLocationSelect}
          onGeolocationClick={handleUseCurrentLocation}
          selectedLocation={selectedLocation}
          mapRef={mapRef}
          isLocating={isLocating}
        />
      </div>

      <div className="space-y-3 border-t border-border bg-card/50 px-4 py-4 backdrop-blur-sm md:space-y-4 md:border-t-0 md:bg-card md:p-6">
        {/* Progress */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-foreground">
              Pi Funding Progress
            </span>
            <span className="text-sm text-muted-foreground">
              {phase.currentProgress ?? "0"} / {phase.requiredPiFunding} Pi
            </span>
          </div>
          <Progress
            value={Math.min(
              (parseFloat(phase.currentProgress ?? "0") /
                parseFloat(phase.requiredPiFunding)) *
                100,
              100
            )}
            className="h-2"
          />
        </div>
        {/* Location Info & Pi Amount Card */}
        {selectedLat !== null && selectedLon !== null && (
          <div className="rounded-lg border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    Required Funding
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {phase.requiredPiFunding} π
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

            {/* Pi Amount Input */}
            <Form {...form}>
              <FormField
                control={form.control}
                name="piContributed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Contribution Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="3.14"
                        step="0.01"
                        min="0.1"
                        disabled={isPending}
                        {...field}
                        value={field.value ?? 0.1}
                        onChange={(e) => {
                          field.onChange(
                            isNaN(e.target.valueAsNumber)
                              ? ""
                              : e.target.valueAsNumber
                          );
                        }}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Contribute any amount towards the calibration goal
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Form>
          </div>
        )}

        {/* Submit Button */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Button
              type="submit"
              className="w-full game-button"
              disabled={
                isPending || selectedLat === null || selectedLon === null
              }
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Initiate Staking
                </span>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
