import { Globe } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

type GlobalPhaseCardProps = {
  currentPhase: number;
  sessionsCompleted: number;
  nextPhaseThreshold: number;
};

const GlobalPhaseCard = ({
  currentPhase,
  sessionsCompleted,
  nextPhaseThreshold,
}: GlobalPhaseCardProps) => {
  const nextPhase = currentPhase + 1;
  const description =
    "The Next Harmonic Awakening approaches as Pioneers across the Lattice contribute their resonance...";

  const phaseProgress = (sessionsCompleted / nextPhaseThreshold) * 100;

  return (
    <Card className="game-card relative overflow-hidden" id="phase-progress">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-neon-purple/5 to-neon-orange/5 animate-pulse" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary animate-spin-slow" />
          Global Phase Progress
          <Badge
            variant="outline"
            className="ml-auto text-neon-purple border-neon-purple/50"
          >
            Phase {currentPhase}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Sessions toward Phase {nextPhase}
            </span>
            <span className="text-primary font-medium">
              {formatNumber(sessionsCompleted)} /{" "}
              {formatNumber(nextPhaseThreshold)}
            </span>
          </div>
          <Progress value={phaseProgress} className="h-3 bg-muted/20">
            <div
              className="h-full bg-gradient-to-r from-primary via-neon-purple to-neon-orange rounded-full transition-all duration-500"
              style={{ width: `${phaseProgress}%` }}
            />
          </Progress>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{phaseProgress.toFixed(1)}% complete</span>
            {/* <span>{timeRemaining} remaining</span> */}
          </div>
        </div>
        <p className="text-sm text-muted-foreground italic">{description}</p>
      </CardContent>
    </Card>
  );
};

export default GlobalPhaseCard;
