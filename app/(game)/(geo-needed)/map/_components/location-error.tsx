"use client";

import { AlertCircle } from "lucide-react";
import useCurrentLocation from "../../_components/location-provider";

const LocationError = () => {
  const {
    state: { error: locationError },
  } = useCurrentLocation();

  if (!locationError) {
    return null;
  }

  return (
    <div className="mt-3 flex items-center gap-2 text-destructive text-sm">
      <AlertCircle className="h-4 w-4" />
      {locationError.message}
    </div>
  );
};

export default LocationError;
