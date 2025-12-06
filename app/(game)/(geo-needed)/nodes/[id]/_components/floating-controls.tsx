"use client";

import { Crosshair, MapPin, Video } from "lucide-react";
import { RefObject, useCallback } from "react";
import { MapRef } from "react-map-gl/maplibre";

import { Button } from "@/components/ui/button";
import { useLocation } from "@/hooks/use-location";
import { videoLinks } from "@/config/site";
import VideoModal from "@/components/shared/video-modal";

type FloatingControlsProps = {
  mapRef: RefObject<MapRef | null>;
  node: { latitude: number; longitude: number };
};

const FloatingControls = ({ mapRef, node }: FloatingControlsProps) => {
  const userLocation = useLocation();

  const flyToNode = useCallback(() => {
    mapRef.current?.flyTo({
      center: [node.longitude, node.latitude],
      zoom: 17,
      duration: 1000,
    });
  }, [node, mapRef]);

  const flyToUser = useCallback(() => {
    if (userLocation) {
      mapRef.current?.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 17,
        duration: 1000,
      });
    }
  }, [userLocation, mapRef]);

  return (
    <div className="absolute top-12 right-4 flex flex-col gap-2">
      <Button
        size="sm"
        variant="secondary"
        className="h-10 w-10 p-0 shadow-lg"
        onClick={flyToNode}
      >
        <MapPin className="h-4 w-4" />
      </Button>
      {userLocation && (
        <Button
          size="sm"
          variant="secondary"
          className="h-10 w-10 p-0 shadow-lg"
          onClick={flyToUser}
        >
          <Crosshair className="h-4 w-4" />
        </Button>
      )}
      {/* Node details Video Button */}
      <VideoModal
        src={videoLinks.nodeDetailsHelper.url}
        title={videoLinks.nodeDetailsHelper.title}
        trigger={
          <Button
            size="sm"
            variant="secondary"
            className="h-10 w-10 p-0 shadow-lg"
          >
            <Video className="h-4 w-4" />
          </Button>
        }
      />
    </div>
  );
};

export default FloatingControls;
