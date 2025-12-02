import { getRarityInfo } from "@/app/(game)/map/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import type { NodeTypeRarity } from "@/lib/generated/prisma/enums";
import { formatMastery } from "@/lib/utils";

type NodeTypeDetailsProps = {
  nodeType: {
    baseYieldPerMinute: number;
    rarity: NodeTypeRarity;
  };
  masteryBonusPercent: number;
};

const NodeTypeDetails = ({
  nodeType,
  masteryBonusPercent,
}: NodeTypeDetailsProps) => {
  const rarityColors = getRarityInfo(nodeType.rarity);
  return (
    <Card className="game-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Node Analysis</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Rarity:</span>
          <Badge
            className={`${rarityColors.textColor} bg-transparent border-current`}
          >
            {nodeType.rarity}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Base Rate:</span>
          <span className="text-xs font-medium">
            {nodeType.baseYieldPerMinute.toFixed(1)}⚡︎/min
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Enhanced:</span>
          <span className="text-xs font-medium text-chart-2">
            {Math.floor(
              nodeType.baseYieldPerMinute *
                (1 + formatMastery(masteryBonusPercent) / 100)
            )}
            ⚡︎/min
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default NodeTypeDetails;
