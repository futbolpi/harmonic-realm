"use client";

import useCurrentLocation from "@/app/(game)/(geo-needed)/_components/location-provider";
import { useMemo } from "react";

export const useLocation = () => {
  const {
    state: { latitude, longitude },
  } = useCurrentLocation();

  const userLocation = useMemo(() => {
    return latitude !== null && longitude !== null
      ? { latitude, longitude }
      : null;
  }, [latitude, longitude]);

  return userLocation;
};
