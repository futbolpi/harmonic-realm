"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Zap } from "lucide-react";
import { toast } from "sonner";
import type { MapRef } from "react-map-gl/maplibre";

import { getUserLocation } from "@/lib/utils/location";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  InitiateNodeAnchoringParams,
  InitiateNodeAnchoringSchema,
} from "@/lib/schema/anchor";
import { useAuth } from "@/components/shared/auth/auth-context";
import { initiateAnchorStaking } from "@/actions/anchor/initiate-staking";
import LocationMap from "./location-map";

type AnchoringFormProps = { anchorCost: string };

/**
 * Anchoring Form Component - Map-centric location selection
 * Users select location by clicking map or using geolocation button
 */
export default function AnchoringForm({ anchorCost }: AnchoringFormProps) {
  const [isLoading, startTransition] = useTransition();
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLon, setSelectedLon] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const mapRef = useRef<MapRef>(null);

  const router = useRouter();

  const { accessToken } = useAuth();

  const isPending = isLoading || isLocating;

  const form = useForm<InitiateNodeAnchoringParams>({
    resolver: zodResolver(InitiateNodeAnchoringSchema),
    defaultValues: {
      latitude: 0,
      longitude: 0,
      accessToken: accessToken ?? "",
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
        // duration: 1000,
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

  // Handle form submission
  const onSubmit = (data: InitiateNodeAnchoringParams) => {
    startTransition(async () => {
      try {
        const result = await initiateAnchorStaking(data);
        if (result.success && result.data) {
          toast.success("Initated successfully, proceed to payment");
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
        />
      </div>

      <div className="space-y-3 border-t border-border bg-card/50 px-4 py-4 backdrop-blur-sm md:space-y-4 md:border-t-0 md:bg-card md:p-6">
        {/* Cost Card */}
        {selectedLat !== null && selectedLon !== null && (
          <div className="rounded-lg border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4">
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
        )}

        {/* Submission Button */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Button
              type="submit"
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
      </div>
    </div>
  );
}
