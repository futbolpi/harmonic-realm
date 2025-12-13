"use client";

import type { Dispatch, SetStateAction } from "react";
import { Calculator, List } from "lucide-react";

import { Button } from "@/components/ui/button";

interface BottomPanelProps {
  noOfEligibleNodes: number;
  setShowNodesModal: Dispatch<SetStateAction<boolean>>;
  setShowCalculatorModal: Dispatch<SetStateAction<boolean>>;
}

const BottomPanel = ({
  noOfEligibleNodes,
  setShowCalculatorModal,
  setShowNodesModal,
}: BottomPanelProps) => {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3">
      <Button
        onClick={() => setShowNodesModal(true)}
        size="lg"
        className="gap-2"
      >
        <List className="h-4 w-4" />
        Eligible Nodes ({noOfEligibleNodes})
      </Button>
      <Button
        onClick={() => setShowCalculatorModal(true)}
        size="lg"
        variant="outline"
        className="gap-2"
      >
        <Calculator className="h-4 w-4" />
        Cost Calculator
      </Button>
    </div>
  );
};

export default BottomPanel;
