import { Crown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { TierName } from "@/lib/schema/mastery";

type MasteryOverviewCardProps = {
  mastery: { level: number; bonusPercent: number; sessionsCompleted: number };
  tierName?: TierName;
};

const MasteryOverviewCard = ({
  mastery,
  tierName = "Unknown",
}: MasteryOverviewCardProps) => {
  return (
    <Card className="game-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Crown className="h-4 w-4 text-primary" />
          Resonance State
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-xl font-bold text-primary">
              {mastery.level}
            </div>
            <div className="text-xs text-muted-foreground">Level</div>
          </div>
          <div>
            <div className="text-xl font-bold text-chart-2">
              {mastery.bonusPercent}%
            </div>
            <div className="text-xs text-muted-foreground">Bonus</div>
          </div>
          <div>
            <div className="text-xl font-bold text-chart-4">
              {mastery.sessionsCompleted}
            </div>
            <div className="text-xs text-muted-foreground">Sessions</div>
          </div>
        </div>
        {tierName && (
          <div className="flex justify-center mt-3">
            <Badge className="px-3 py-1 bg-primary/20 text-primary border-primary/30">
              {tierName} Tier
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MasteryOverviewCard;
