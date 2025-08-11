"use client";

import { AlertCircle } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import useCurrentLocation from "../../_components/location-provider";

const LocationError = () => {
  const {
    state: { error: locationError },
  } = useCurrentLocation();

  if (!locationError) {
    return null;
  }

  return (
    <>
      <Separator />
      <div className="flex items-center gap-2 text-destructive text-sm">
        <AlertCircle className="h-4 w-4" />
        <span>{locationError.message}</span>
      </div>
    </>
  );
};

export default LocationError;
