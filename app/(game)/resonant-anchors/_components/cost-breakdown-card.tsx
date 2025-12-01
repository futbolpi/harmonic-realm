import Decimal from "decimal.js";
import { Zap } from "lucide-react";

export function CostBreakdownCard({
  baseCost,
  finalCost,
  selectedLat,
  selectedLon,
  selectedDiscountLevels,
}: {
  baseCost: Decimal;
  finalCost: Decimal;
  selectedLat: number | null;
  selectedLon: number | null;
  selectedDiscountLevels: number;
}) {
  if (selectedLat === null || selectedLon === null) {
    return null;
  }

  return (
    <div className="rounded-lg border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-xs font-medium text-muted-foreground">
              Anchor Cost
            </p>
            <p className="text-sm font-semibold text-foreground">
              {selectedDiscountLevels > 0
                ? `${finalCost.toString()} π`
                : `${baseCost.toString()} π`}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Coordinates</p>
          <p className="font-mono text-xs font-medium text-primary">
            {selectedLat.toFixed(4)}, {selectedLon.toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  );
}
