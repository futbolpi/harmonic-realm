"use client";

import { useNextStep } from "nextstepjs";
import { CircleQuestionMark } from "lucide-react";

import { Button } from "@/components/ui/button";

const MapHelp = () => {
  const { startNextStep } = useNextStep();

  const handleMapTour = () => {
    startNextStep("map");
  };

  return (
    <Button
      onClick={handleMapTour}
      size="sm"
      className="game-button cursor-pointer shadow-lg"
    >
      <CircleQuestionMark className="h-4 w-4" />
    </Button>
  );
};

export default MapHelp;
