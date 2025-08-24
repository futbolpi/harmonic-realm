import { Crown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TierName } from "@/lib/schema/mastery";

type MasteryOverviewCardProps = {
  mastery: { level: number; bonusPercent: number; sessionsCompleted: number };
  tierName?: TierName;
};

const MasteryOverviewCard = ({
  mastery,
  tierName = "Unknown",
}: MasteryOverviewCardProps) => {
  return (
    <Card className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Crown className="h-5 w-5 text-accent" />
          Current Resonance State
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-primary">
              {mastery.level}
            </div>
            <div className="text-xs text-muted-foreground">Mastery Level</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-secondary">
              {mastery.bonusPercent}%
            </div>
            <div className="text-xs text-muted-foreground">Yield Bonus</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-chart-2">
              {mastery.sessionsCompleted}
            </div>
            <div className="text-xs text-muted-foreground">Sessions</div>
          </div>
        </div>

        {/* Tier Badge */}
        <div className="flex justify-center">
          <Badge className="px-4 py-2 bg-gradient-to-r from-primary to-secondary">
            {tierName} Tier
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default MasteryOverviewCard;
