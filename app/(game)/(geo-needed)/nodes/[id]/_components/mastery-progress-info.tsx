import { Sparkles, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ProgressInfo } from "@/lib/schema/mastery";

type MasteryProgressInfoProps = { progressInfo: ProgressInfo };

const MasteryProgressInfo = ({ progressInfo }: MasteryProgressInfoProps) => {
  return (
    <Card className="game-card">
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-chart-2" />
          <span className="text-sm font-medium">
            Progress to Level {progressInfo.nextLevel}
          </span>
          <span className="text-sm text-muted-foreground ml-auto">
            {progressInfo.progressPercent}%
          </span>
        </div>
        <Progress value={progressInfo.progressPercent} className="h-2 mb-2" />
        <div className="text-xs text-muted-foreground text-center">
          {progressInfo.sessionsNeeded} more sessions needed
        </div>

        {progressInfo.sessionsNeeded !== null &&
          progressInfo.sessionsNeeded <= 3 && (
            <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-xs font-medium">
                Resonance approaching - Level up imminent!
              </span>
            </div>
          )}
      </CardContent>
    </Card>
  );
};

export default MasteryProgressInfo;
