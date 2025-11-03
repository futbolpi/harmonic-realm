import { TrendingUp, Zap } from "lucide-react";
import { Decimal } from "@prisma/client/runtime/client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CostBreakdownProps {
  requiredPiFunding: string;
  globalAnchorIndex: number;
}

export default function CostBreakdown({
  requiredPiFunding,
  globalAnchorIndex,
}: CostBreakdownProps) {
  const cBase = new Decimal(requiredPiFunding)
    .dividedBy(10)
    .toDecimalPlaces(2, Decimal.ROUND_DOWN);

  // Calculate scarcity component = A_G × 0.05
  const scarcityComponent = new Decimal(globalAnchorIndex)
    .times(0.05)
    .toDecimalPlaces(2, Decimal.ROUND_DOWN);

  // Total = C_Base + scarcity
  const totalCost = cBase
    .plus(scarcityComponent)
    .toDecimalPlaces(2, Decimal.ROUND_DOWN);

  return (
    <Card className="bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-amber-500" />
          <CardTitle>Current Anchor Cost</CardTitle>
        </div>
        <CardDescription>
          How your anchor cost is calculated in this phase
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Cost Breakdown */}
        <div className="space-y-3">
          {/* C_Base */}
          <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-3">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-foreground">
                Phase Base Cost (C_Base)
              </span>
              <span className="text-xs text-muted-foreground">
                Phase Required ÷ 10
              </span>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">
                {cBase.toString()} π
              </p>
              <p className="text-xs text-muted-foreground">
                {requiredPiFunding} ÷ 10
              </p>
            </div>
          </div>

          {/* Scarcity Component */}
          <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-3">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-foreground">
                Scarcity Factor (A_G × 0.05)
              </span>
              <span className="text-xs text-muted-foreground">
                {globalAnchorIndex} anchor{globalAnchorIndex !== 1 ? "s" : ""} ×
                0.05 π
              </span>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-amber-500">
                {scarcityComponent.toString()} π
              </p>
              <p className="text-xs text-muted-foreground">
                +{globalAnchorIndex * 0.05}
              </p>
            </div>
          </div>
        </div>

        {/* Formula */}
        <div className="rounded-lg bg-muted/50 p-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">Formula</p>
          <p className="font-mono text-sm font-semibold text-foreground">
            {cBase.toString()} + {scarcityComponent.toString()} ={" "}
            {totalCost.toString()} π
          </p>
        </div>

        {/* Total Cost */}
        <div className="flex items-center justify-between rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">
              Your Anchor Cost
            </span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              {totalCost.toString()} π
            </p>
            <Badge variant="outline" className="mt-1 text-xs">
              Current Phase
            </Badge>
          </div>
        </div>

        {/* Info */}
        <p className="text-xs text-muted-foreground">
          As more players anchor nodes in this phase, the cost rises
          incrementally. Phase transitions will reset the scarcity factor but
          increase the base cost.
        </p>
      </CardContent>
    </Card>
  );
}
