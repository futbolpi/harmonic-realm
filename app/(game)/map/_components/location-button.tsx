"use client";

import { Loader2, Navigation } from "lucide-react";
import { toast } from "sonner";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { useMapSearchParams } from "@/hooks/use-map-search-params";
import { getUserLocation } from "@/lib/utils/location";

const LocationButton = () => {
  const [isLocating, setIsLocating] = useState(false);

  const { updateSearchParams, isLoading } = useMapSearchParams();

  const buttonDisabled = isLoading || isLocating;

  // Get user location
  const handleGetLocation = useCallback(async () => {
    setIsLocating(true);

    try {
      const position = await getUserLocation();

      updateSearchParams({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        sortBy: "distance",
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
  }, [updateSearchParams]);

  return (
    <Button
      onClick={handleGetLocation}
      disabled={buttonDisabled}
      size="sm"
      className="game-button cursor-pointer shadow-lg"
      id="location-button"
    >
      {buttonDisabled ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Navigation className="h-4 w-4" />
      )}
    </Button>
  );
};

export default LocationButton;
