import { Crown, Zap } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  calculateChamberUpgradeCost,
  CHAMBER_CONSTANTS,
  formatBoostPercentage,
} from "@/lib/utils/chambers";

const StatsGridCard = ({ chamberLevel }: { chamberLevel: number }) => {
  const upgradeCost =
    chamberLevel < CHAMBER_CONSTANTS.MAX_LEVEL
      ? calculateChamberUpgradeCost(chamberLevel)
      : 0;

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Boost
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {formatBoostPercentage(chamberLevel)}
          </div>
          <div className="text-xs text-muted-foreground">
            Within {CHAMBER_CONSTANTS.BOOST_RADIUS_KM}km radius
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {chamberLevel} / {CHAMBER_CONSTANTS.MAX_LEVEL}
          </div>
          <div className="text-xs text-muted-foreground">
            {chamberLevel === CHAMBER_CONSTANTS.MAX_LEVEL
              ? "Max level"
              : `Upgrade: ${upgradeCost} RES`}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsGridCard;
