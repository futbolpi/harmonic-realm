"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Loader2, Navigation } from "lucide-react";

import { LocationSchema } from "@/lib/schema/drift";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getUserLocation } from "@/lib/utils/location";

interface CoordinateControlsProps {
  onFlyTo: (lat: number, lng: number) => void;
}

export function CoordinateControls({ onFlyTo }: CoordinateControlsProps) {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  // Get user location
  const handleGetLocation = useCallback(async () => {
    setIsLocating(true);

    try {
      const position = await getUserLocation();
      onFlyTo(position.coords.latitude, position.coords.longitude);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to get location, please refresh browser";
      toast.error(errorMessage);
    } finally {
      setIsLocating(false);
    }
  }, [onFlyTo]);

  const handleGo = () => {
    const { success, data } = LocationSchema.safeParse({
      latitude: lat,
      longitude: lng,
    });
    if (success) {
      const { latitude, longitude } = data;
      onFlyTo(latitude, longitude);
    } else {
      toast.error("Invalid location set");
    }
  };

  return (
    <div className="w-64 flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          placeholder="Lat"
          className="w-1/2"
          type="number"
        />
        <Input
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          placeholder="Lng"
          className="w-1/2"
          type="number"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={handleGo}>Go to Coords</Button>
        <Button onClick={handleGetLocation} variant="secondary">
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4 mr-2" />
          )}
          My Location
        </Button>
      </div>
    </div>
  );
}
