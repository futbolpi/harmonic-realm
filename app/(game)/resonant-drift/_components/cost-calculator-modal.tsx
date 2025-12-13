"use client";

import React, {
  type Dispatch,
  type SetStateAction,
  useMemo,
  useState,
} from "react";

import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
} from "@/components/credenza";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { NodeTypeRarity } from "@/lib/generated/prisma/enums";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { UserLocation } from "@/lib/schema/drift";
import { getDriftCost } from "@/lib/drift/drift-cost";
import { useProfile } from "@/hooks/queries/use-profile";
import { rarityMultipliers } from "@/config/drift";

type Props = {
  showCalculatorModal: boolean;
  setShowCalculatorModal: Dispatch<SetStateAction<boolean>>;
  userLocation: UserLocation | null;
  noOfNodesToRender: number;
};

const CostCalculatorModal = ({
  showCalculatorModal,
  setShowCalculatorModal,
  noOfNodesToRender,
  userLocation,
}: Props) => {
  // Cost calculator state
  const [calcRarity, setCalcRarity] = useState<NodeTypeRarity>("Common");
  const [calcDistance, setCalcDistance] = useState<number>(50);

  const { data } = useProfile();

  const noLocation = !userLocation;
  const noNodes = noOfNodesToRender === 0;
  const firstDrift = data?.driftCount === 0;

  // Calculate cost in real-time
  const calculatedCost = useMemo(() => {
    if (!userLocation || noOfNodesToRender === 0) return 0;
    return getDriftCost({
      driftCount: data?.driftCount || 0,
      distance: calcDistance,
      rarity: calcRarity,
    });
  }, [
    calcDistance,
    calcRarity,
    noOfNodesToRender,
    userLocation,
    data?.driftCount,
  ]);

  return (
    <Credenza open={showCalculatorModal} onOpenChange={setShowCalculatorModal}>
      <CredenzaContent className="p-4">
        <CredenzaHeader>
          <div className="flex items-center justify-between w-full">
            <CredenzaTitle>Drift Cost Calculator</CredenzaTitle>
            <div className="flex items-center gap-2">
              {noLocation ? (
                <Badge variant="destructive">No location</Badge>
              ) : noNodes ? (
                <Badge variant="secondary">No nodes</Badge>
              ) : firstDrift ? (
                <Badge variant="outline">First-drift discount</Badge>
              ) : (
                <Badge variant="default">Standard Pricing</Badge>
              )}
            </div>
          </div>
        </CredenzaHeader>

        <CredenzaBody className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Rarity</label>
            <Select
              value={calcRarity}
              onValueChange={(v) => setCalcRarity(v as NodeTypeRarity)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Common">Common</SelectItem>
                <SelectItem value="Uncommon">Uncommon</SelectItem>
                <SelectItem value="Rare">Rare</SelectItem>
                <SelectItem value="Epic">Epic</SelectItem>
                <SelectItem value="Legendary">Legendary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Distance: {calcDistance}km
            </label>
            <div className={noLocation || noNodes ? "opacity-60 pointer-events-none" : ""}>
              <Slider
                value={[calcDistance]}
                onValueChange={(v) => setCalcDistance(v[0])}
                min={10}
                max={100}
                step={1}
              />
            </div>
            {noLocation ? (
              <p className="text-xs text-muted-foreground mt-1">Enable location to estimate accurate distance-based costs.</p>
            ) : noNodes ? (
              <p className="text-xs text-muted-foreground mt-1">No eligible nodes found to simulate distance cost.</p>
            ) : null}
          </div>

          {/* Cost Breakdown Card */}
          <Card className="p-4 bg-muted/50">
            <div className="text-xs text-muted-foreground mb-2">
              <strong>Pricing:</strong> Base(200 SP) × Rarity × DistanceFactor, then usage penalty. First-drift reduces base to 75 SP.
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Base Cost:</span>
                <span className="font-semibold">200 SP</span>
              </div>
              <div className="flex justify-between">
                <span>Rarity (Multiplier):</span>
                <span className="font-semibold">
                  x{rarityMultipliers[calcRarity]}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Distance (Multiplier):</span>
                <span className="font-semibold">
                  x{(1 + (calcDistance / 100) * 0.5).toFixed(2)}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total Estimated Cost:</span>
                <span className="text-lg">
                  {calculatedCost.toLocaleString()} SP
                </span>
              </div>
            </div>
          </Card>
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  );
};

export default CostCalculatorModal;
