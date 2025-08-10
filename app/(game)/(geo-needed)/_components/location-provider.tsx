"use client";

import { createContext, ReactNode, useContext } from "react";
import { type GeolocationState, useGeolocation } from "@uidotdev/usehooks";

// A "provider" is used to encapsulate only the
// components that needs the state in this context

type LocationContextType = {
  state: GeolocationState;
};

type LocationProviderProps = {
  children: ReactNode;
  locationTimeout?: number;
};

const defaultTimeout = 10 * 1000; // defaults to a 10s tiemout

export const LocationContext = createContext<LocationContextType | null>(null);

export function LocationProvider({
  children,
  locationTimeout,
}: LocationProviderProps) {
  const state = useGeolocation({
    timeout: locationTimeout || defaultTimeout,
    enableHighAccuracy: true,
    maximumAge: 300000, // 5 minutes
  });

  return (
    <LocationContext.Provider value={{ state }}>
      {children}
    </LocationContext.Provider>
  );
}

const useCurrentLocation = () => {
  const locationContext = useContext(LocationContext);

  if (!locationContext) {
    throw new Error(
      "useClient has to be used within <LocationContext.Provider>"
    );
  }

  return locationContext;
};

export default useCurrentLocation;
