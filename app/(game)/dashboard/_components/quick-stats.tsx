import { Coins, MapPin, Trophy, Zap } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";

type QuickStatsProps = {
  minerShares: number;
  level: number;
  nodesMined: number;
  xp: number;
};

const QuickStats = ({
  minerShares,
  nodesMined,
  level,
  xp,
}: QuickStatsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="game-card">
        <CardContent className="p-4 text-center">
          <Coins className="h-8 w-8 text-neon-orange mx-auto mb-2" />
          <div className="text-2xl font-bold text-primary">
            {formatNumber(minerShares)}
          </div>
          <p className="text-xs text-muted-foreground">Share Points</p>
        </CardContent>
      </Card>

      <Card className="game-card">
        <CardContent className="p-4 text-center">
          <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-neon-green">{level}</div>
          <p className="text-xs text-muted-foreground">Pioneer Level</p>
        </CardContent>
      </Card>

      <Card className="game-card">
        <CardContent className="p-4 text-center">
          <Trophy className="h-8 w-8 text-neon-purple mx-auto mb-2" />
          <div className="text-2xl font-bold text-primary">
            {formatNumber(xp)}
          </div>
          <p className="text-xs text-muted-foreground">Total XP</p>
        </CardContent>
      </Card>

      <Card className="game-card">
        <CardContent className="p-4 text-center">
          <MapPin className="h-8 w-8 text-neon-green mx-auto mb-2" />
          <div className="text-2xl font-bold text-primary">{nodesMined}</div>
          <p className="text-xs text-muted-foreground">Sessions Completed</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickStats;
