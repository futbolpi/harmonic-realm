"use client";

import { Loader2, Navigation } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useMapSearchParams } from "@/hooks/use-map-search-params";
import useCurrentLocation from "../../_components/location-provider";

const LocationButton = () => {
  // Get user location
  const {
    state: { latitude, loading, longitude, error },
  } = useCurrentLocation();

  const { updateSearchParams, isLoading } = useMapSearchParams();

  const buttonDisabled = isLoading || loading;

  const handleGetLocation = () => {
    if (latitude === null || longitude === null) {
      // toast error
      toast.error(`${error?.message}: Please refresh browser`);
      return;
    }
    updateSearchParams({ latitude, longitude, sortBy: "distance" });
  };

  return (
    <Button
      onClick={handleGetLocation}
      disabled={buttonDisabled}
      size="sm"
      className="game-button cursor-pointer"
    >
      {buttonDisabled ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Navigation className="h-4 w-4 mr-2" />
      )}
      {buttonDisabled ? "Locating..." : "My Location"}
    </Button>
  );
};

export default LocationButton;
