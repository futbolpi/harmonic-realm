"use client";

import { useState } from "react";
import { MapPin, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface NoLocationProps {
  onLocationGranted?: () => void;
}

export function NoLocationComponent({ onLocationGranted }: NoLocationProps) {
  const [status, setStatus] = useState<
    "idle" | "requesting" | "denied" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const requestLocation = async () => {
    setStatus("requesting");
    setErrorMessage("");

    try {
      // Check if geolocation is available
      if (!navigator.geolocation) {
        setStatus("error");
        setErrorMessage(
          "Geolocation is not supported by your browser. Please try a modern browser like Chrome, Firefox, or Safari."
        );
        return;
      }

      navigator.geolocation.getCurrentPosition(
        () => {
          // Success - location granted
          setStatus("idle");
          onLocationGranted?.();
        },
        (error) => {
          // Error handling
          if (error.code === error.PERMISSION_DENIED) {
            setStatus("denied");
            setErrorMessage(
              "Location access denied. Please enable location services in your browser settings and try again."
            );
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            setStatus("error");
            setErrorMessage(
              "Location information is unavailable. Please check your device settings."
            );
          } else if (error.code === error.TIMEOUT) {
            setStatus("error");
            setErrorMessage(
              "Location request timed out. Please check your internet connection and try again."
            );
          } else {
            setStatus("error");
            setErrorMessage(
              "An unexpected error occurred while requesting location. Please try again."
            );
          }
        },
        {
          timeout: 10000,
          enableHighAccuracy: true,
          maximumAge: 0,
        }
      );
    } catch {
      setStatus("error");
      setErrorMessage(
        "Failed to request location. Please try again or check your browser settings."
      );
    }
  };

  const handleOpenSettings = () => {
    if (status === "denied") {
      setErrorMessage(
        "Please open your browser settings and enable location access for this site."
      );
    }
  };

  return (
    <div className="h-full w-full bg-gradient-to-b from-background via-background to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-all",
              status === "requesting"
                ? "bg-blue-500/20 animate-pulse"
                : "bg-slate-800"
            )}
          >
            <MapPin
              className={cn(
                "h-8 w-8",
                status === "requesting"
                  ? "text-blue-400 animate-bounce"
                  : "text-slate-400"
              )}
            />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-center mb-3">
          Location Access Required
        </h2>

        {/* Description */}
        <p className="text-sm text-slate-400 text-center mb-6">
          To experience the Ephemeral Spark tutorial and explore the cosmic
          Lattice of nodes, we need your location. This helps us show you nodes
          near you and validates your mining activity.
        </p>

        {/* Error Alert */}
        {(status === "error" || status === "denied") && (
          <Alert
            variant="destructive"
            className="mb-6 border-red-500/30 bg-red-500/5"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs text-red-400 ml-2">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Primary Action Button */}
        <Button
          onClick={requestLocation}
          disabled={status === "requesting"}
          size="lg"
          className={cn(
            "w-full mb-3 font-semibold transition-all",
            status === "requesting"
              ? "opacity-75"
              : "hover:shadow-lg hover:shadow-blue-500/20"
          )}
        >
          {status === "requesting" ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              Requesting Location...
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4 mr-2" />
              Enable Location Access
            </>
          )}
        </Button>

        {/* Secondary Info */}
        <p className="text-xs text-slate-500 text-center">
          Your location is used only for gameplay and is not stored permanently.
        </p>

        {/* Settings Help */}
        {status === "denied" && (
          <Button
            variant="outline"
            onClick={handleOpenSettings}
            size="sm"
            className="w-full mt-4"
          >
            Show Browser Settings Help
          </Button>
        )}
      </div>
    </div>
  );
}
