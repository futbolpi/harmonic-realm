"use client";

import { Loader2, Navigation, Navigation2Off } from "lucide-react";
import React, { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { ViewState } from "react-map-gl/maplibre";

import { Button } from "@/components/ui/button";
import { useMapSearchParams } from "@/hooks/use-map-search-params";
import useCurrentLocation from "../../_components/location-provider";

type LocationButtonProps = {
  setViewState: Dispatch<SetStateAction<ViewState>>;
};

const LocationButton = ({ setViewState }: LocationButtonProps) => {
  // Get user location
  const {
    state: { latitude, loading, longitude, error },
  } = useCurrentLocation();

  const {
    updateSearchParams,
    isLoading,
    searchParams: { latitude: latParam, longitude: lngParam },
  } = useMapSearchParams();

  const buttonDisabled = isLoading || loading;

  const handleClearLocation = () => {
    updateSearchParams({ latitude: null, longitude: null });
  };

  const handleGetLocation = () => {
    if (latitude === null || longitude === null) {
      // toast error
      toast.error(`${error?.message}: Please refresh browser`);
      return;
    }
    updateSearchParams({ latitude, longitude });
    setViewState((prev) => ({
      ...prev,
      longitude,
      latitude,
      zoom: 14,
    }));
  };

  if (latParam !== null && lngParam !== null) {
    return (
      <Button
        onClick={handleClearLocation}
        size="sm"
        className="game-button cursor-pointer"
      >
        <Navigation2Off className="h-4 w-4 mr-2" />
        Clear Location
      </Button>
    );
  }

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
