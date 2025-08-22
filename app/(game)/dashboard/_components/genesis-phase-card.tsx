import { Globe } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { GENESIS_THRESHOLD } from "@/config/site";

type GenesisPhaseCardProps = {
  harmonizerCount: number;
};

const GenesisPhaseCard: React.FC<GenesisPhaseCardProps> = ({
  harmonizerCount,
}) => {
  const progress = (harmonizerCount / GENESIS_THRESHOLD) * 100;
  const description = `The first Harmonic Awakening – Genesis – ignites once ${GENESIS_THRESHOLD} Harmonizers attune their resonance to the Lattice…`;

  return (
    <Card className="game-card relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-neon-green/5 to-neon-cyan/5 animate-pulse" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-neon-green animate-spin-slow" />
          Genesis Phase Countdown
          <Badge
            variant="outline"
            className="ml-auto text-neon-green border-neon-green/50"
          >
            Pending
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Harmonizers toward Genesis
            </span>
            <span className="text-primary font-medium">
              {formatNumber(harmonizerCount)} /{" "}
              {formatNumber(GENESIS_THRESHOLD)}
            </span>
          </div>
          <Progress value={progress} className="h-3 bg-muted/20">
            <div
              className="h-full bg-gradient-to-r from-neon-green via-neon-cyan to-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </Progress>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progress.toFixed(1)}% complete</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground italic">{description}</p>
      </CardContent>
    </Card>
  );
};

export default GenesisPhaseCard;
