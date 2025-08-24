import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { NodeTypeRarity } from "@/lib/generated/prisma/enums";

type NodeTypeDetailsProps = {
  nodeType: {
    name: string;
    baseYieldPerMinute: number;
    lockInMinutes: number;
    rarity: NodeTypeRarity;
  };
  masteryBonusPercent: number;
};

const NodeTypeDetails = ({
  nodeType,
  masteryBonusPercent,
}: NodeTypeDetailsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Node Frequency Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Rarity Classification:
          </span>
          <Badge
            className={
              nodeType.rarity === "Legendary"
                ? "bg-accent/20 text-accent-foreground"
                : nodeType.rarity === "Epic"
                ? "bg-secondary/20 text-secondary-foreground"
                : nodeType.rarity === "Rare"
                ? "bg-primary/20 text-primary-foreground"
                : nodeType.rarity === "Uncommon"
                ? "bg-chart-2/20 text-foreground"
                : "bg-muted/20 text-muted-foreground"
            }
          >
            {nodeType.rarity}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Base Yield Rate:
          </span>
          <span className="text-sm font-medium">
            {nodeType.baseYieldPerMinute}/min
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Your Enhanced Rate:
          </span>
          <span className="text-sm font-medium text-chart-2">
            {Math.floor(
              nodeType.baseYieldPerMinute * (1 + masteryBonusPercent / 100)
            )}
            /min
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default NodeTypeDetails;
