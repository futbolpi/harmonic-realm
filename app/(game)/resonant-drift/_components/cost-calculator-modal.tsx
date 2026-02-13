"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";

import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/credenza";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { NodeTypeRarity } from "@/lib/generated/prisma/enums";
import { getDriftCost, formatCostBreakdown } from "@/lib/drift/drift-cost";
import { getRemainingDiscounts } from "@/config/drift";

interface CostCalculatorModalProps {
  driftCount: number;
  nodeCountWithin10km: number;
}

export default function CostCalculatorModal({
  driftCount,
  nodeCountWithin10km,
}: CostCalculatorModalProps) {
  const [calcRarity, setCalcRarity] = useState<NodeTypeRarity>("Rare");
  const [calcDistance, setCalcDistance] = useState(50);

  const costResult = getDriftCost({
    driftCount,
    distance: calcDistance,
    rarity: calcRarity,
    nodeCountWithin10km,
  });

  const breakdown = formatCostBreakdown(costResult.breakdown);
  const remainingDiscounts = getRemainingDiscounts(driftCount);

  return (
    <Credenza>
      <CredenzaTrigger asChild>
        <Button
          size="icon"
          variant="secondary"
          className="rounded-full shadow-lg"
          title="Cost Calculator"
        >
          <Calculator className="h-4 w-4" />
        </Button>
      </CredenzaTrigger>

      <CredenzaContent className="max-w-md">
        <CredenzaHeader>
          <CredenzaTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Drift Cost Calculator
          </CredenzaTitle>
          <CredenzaDescription>
            Estimate costs for different scenarios
          </CredenzaDescription>
        </CredenzaHeader>

        <CredenzaBody className="space-y-6 max-h-[80vh] p-2 overflow-y-auto">
          {/* Current status */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Your drift count:</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{driftCount} drifts</Badge>
              {remainingDiscounts > 0 && (
                <Badge variant="secondary">
                  {remainingDiscounts} discount
                  {remainingDiscounts > 1 ? "s" : ""} left
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Rarity selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Node Rarity</label>
            <Select
              value={calcRarity}
              onValueChange={(v) => setCalcRarity(v as NodeTypeRarity)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Common">Common (1.0×)</SelectItem>
                <SelectItem value="Uncommon">Uncommon (1.5×)</SelectItem>
                <SelectItem value="Rare">Rare (2.0×)</SelectItem>
                <SelectItem value="Epic">Epic (3.0×)</SelectItem>
                <SelectItem value="Legendary">Legendary (5.0×)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Distance slider */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Distance: {calcDistance}km
            </label>
            <Slider
              value={[calcDistance]}
              onValueChange={(v) => setCalcDistance(v[0])}
              min={10}
              max={100}
              step={5}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10km (min)</span>
              <span>100km (max)</span>
            </div>
          </div>

          {/* Cost breakdown */}
          <Card className="p-4 bg-muted/50">
            <h4 className="font-semibold text-sm mb-3">Cost Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Cost:</span>
                <span>{breakdown.baseCost}</span>
              </div>
              {costResult.breakdown.firstTimeDiscount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Discount Applied:</span>
                  <span className="font-semibold">
                    {breakdown.firstTimeDiscount}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rarity:</span>
                <span>{breakdown.rarityMultiplier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distance:</span>
                <span>{breakdown.distanceFactor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Usage Penalty:</span>
                <span>{breakdown.usagePenalty}</span>
              </div>
              {(costResult.breakdown.densityMultiplier ?? 0) > 1 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Density Premium:
                  </span>
                  <span>{breakdown.densityMultiplier}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between font-bold text-base">
                <span>Estimated Cost:</span>
                <span className="text-primary">
                  {costResult.cost.toLocaleString()} SP
                </span>
              </div>
            </div>
          </Card>

          {/* Density tier info */}
          {nodeCountWithin10km > 0 && (
            <div className="p-3 bg-muted/30 rounded-lg text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-muted-foreground">Current Zone:</span>
                <Badge variant="outline">{breakdown.densityTier}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {nodeCountWithin10km} node{nodeCountWithin10km > 1 ? "s" : ""}{" "}
                within 10km
              </p>
            </div>
          )}

          {/* Formula reminder */}
          <div className="text-xs text-muted-foreground">
            <p className="font-mono bg-muted/30 p-2 rounded">
              Cost = Base × (1 - Discount) × Rarity × Distance × Usage × Density
            </p>
          </div>
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  );
}
