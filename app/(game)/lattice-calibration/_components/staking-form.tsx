"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  InitiateCalibrationSchema,
  InitiateCalibrationParams,
} from "@/lib/schema/calibration";
import { useAuth } from "@/components/shared/auth/auth-context";
import { initiateCalibrationStaking } from "@/actions/calibration/initiate-staking";
import { getUserLocation } from "@/lib/utils/location";
import { LocationMap } from "./location-map";
import { isValidCoordinates } from "@/lib/node-spawn/region-metrics";

interface StakingFormProps {
  phase: { requiredPiFunding: string };
}

export function StakingForm({ phase }: StakingFormProps) {
  const [isLoading, startTransition] = useTransition();
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const isPending = isLoading || isLocating;

  const router = useRouter();

  const { accessToken } = useAuth();

  const form = useForm({
    resolver: zodResolver(InitiateCalibrationSchema),
    defaultValues: {
      piContributed: 3.14,
      currentLat: 0,
      currentLon: 0,
      accessToken: accessToken ?? "",
    },
  });

  // Get user location
  const handleGetLocation = async () => {
    setIsLocating(true);

    try {
      const position = await getUserLocation();
      const { latitude, longitude } = position.coords;
      form.setValue("currentLat", latitude);
      form.setValue("currentLon", longitude);
      setSelectedLocation({ lat: latitude, lon: longitude });
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
          toast.success("Staking initated successfully, proceed to payment");
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

  const showMap =
    selectedLocation &&
    isValidCoordinates(selectedLocation.lat, selectedLocation.lon);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Initiate Staking</CardTitle>
        <CardDescription>
          Contribute Pi to calibrate the lattice and earn rewards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Location Selection Tabs */}
            <Tabs
              defaultValue="current"
              onValueChange={(value) => {
                if (value === "manual") {
                  setSelectedLocation(null);
                }
              }}
            >
              <TabsList className="grid w-full grid-cols-2 bg-muted">
                <TabsTrigger value="current">Current Location</TabsTrigger>
                <TabsTrigger value="manual">Manual Input</TabsTrigger>
              </TabsList>

              {/* Current Location Tab */}
              <TabsContent value="current" className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGetLocation}
                  disabled={isPending}
                  className="w-full bg-transparent"
                >
                  📍 Detect My Location
                </Button>
                {selectedLocation && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-foreground">
                      Latitude: {selectedLocation.lat.toFixed(6)}
                    </p>
                    <p className="text-sm text-foreground">
                      Longitude: {selectedLocation.lon.toFixed(6)}
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Manual Input Tab */}
              <TabsContent value="manual" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="currentLat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="-90 to 90"
                            step="0.0001"
                            disabled={isPending}
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const lat = isNaN(e.target.valueAsNumber)
                                ? undefined
                                : e.target.valueAsNumber;
                              field.onChange(lat);
                              setSelectedLocation({
                                lat: lat ?? 0,
                                lon: form.getValues("currentLon") ?? 0,
                              });
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currentLon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="-180 to 180"
                            step="0.0001"
                            disabled={isPending}
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const lon = isNaN(e.target.valueAsNumber)
                                ? undefined
                                : e.target.valueAsNumber;
                              field.onChange(lon);
                              setSelectedLocation({
                                lat: form.getValues("currentLat") ?? 0,
                                lon: lon ?? 0,
                              });
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Map Preview */}
            {showMap && (
              <div className="space-y-2">
                <FormLabel>Node Spawn Location Preview</FormLabel>
                <LocationMap location={selectedLocation} />
              </div>
            )}

            {/* Pi Amount Input */}
            <FormField
              control={form.control}
              name="piContributed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pi Amount</FormLabel>
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
                        field.onChange(e.target.valueAsNumber);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Required funding: {phase.requiredPiFunding} Pi
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Processing..." : "Initiate Staking"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
