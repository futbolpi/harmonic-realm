"use client";

import { ZoomOut } from "lucide-react";

import { Button } from "@/components/ui/button";

const ResetButton = ({
  handleClearSelection,
}: {
  handleClearSelection: () => void;
}) => {
  return (
    <div className="absolute top-4 right-4 z-40">
      <Button onClick={handleClearSelection} size="icon" variant="outline">
        <ZoomOut className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default ResetButton;
