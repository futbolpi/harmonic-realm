import { Sparkles, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProgressInfo } from "@/lib/schema/mastery";

type MasteryProgressInfoProps = { progressInfo: ProgressInfo };

const MasteryProgressInfo = ({ progressInfo }: MasteryProgressInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4 text-chart-2" />
          Resonance Progression
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Progress to Level {progressInfo.nextLevel}</span>
          <span className="font-medium">{progressInfo.progressPercent}%</span>
        </div>
        <Progress
          value={progressInfo.progressPercent}
          className="h-3 bg-muted"
        />
        <div className="text-xs text-muted-foreground text-center">
          {progressInfo.sessionsNeeded} more mining sessions needed
        </div>

        {progressInfo.sessionsNeeded !== null &&
          progressInfo.sessionsNeeded <= 3 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-accent/20 to-chart-4/20 border border-accent/30 animate-pulse">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-foreground">
                Resonance Approaching - Level up imminent!
              </span>
            </div>
          )}
      </CardContent>
    </Card>
  );
};

export default MasteryProgressInfo;
