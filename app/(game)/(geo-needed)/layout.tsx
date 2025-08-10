import { ReactNode } from "react";

import { LocationProvider } from "./_components/location-provider";

type GeoNeededLayoutProps = { children: ReactNode };

const GeoNeededLayout = ({ children }: GeoNeededLayoutProps) => {
  return <LocationProvider>{children}</LocationProvider>;
};

export default GeoNeededLayout;
