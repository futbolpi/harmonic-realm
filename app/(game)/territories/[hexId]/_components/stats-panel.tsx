import { Users, Zap, Crown, Calendar, LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

import { Card } from "@/components/ui/card";
import { getTerritoryCategory } from "../utils";

interface Props {
  territory: {
    trafficScore: number;
    noOfNodes: number;
    currentStake: number;
    guild: { name: string; tag: string } | null;
    controlledAt: Date | null;
    daysRemaining: number;
  };
}

const StatItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  label: string;
  value: string | number;
}) => (
  <div className="flex items-start gap-3">
    <Icon className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
    <div>
      <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
      <p className="text-lg font-bold text-foreground">{value}</p>
    </div>
  </div>
);

export default function TerritoryStatsPanel({ territory }: Props) {
  const category = getTerritoryCategory(territory.trafficScore);
  const categoryLabels = {
    low: "Low-Value",
    medium: "Medium-Value",
    high: "High-Value",
  };

  return (
    <div className="space-y-4">
      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-muted/30 border-border/50">
          <StatItem
            icon={Users}
            label="Nodes in Territory"
            value={territory.noOfNodes}
          />
        </Card>
        <Card className="p-4 bg-muted/30 border-border/50">
          <StatItem
            icon={Zap}
            label="Traffic Score"
            value={Math.round(territory.trafficScore)}
          />
        </Card>
      </div>

      {/* Territory Value */}
      <Card className="p-4 bg-amber-500/5 border border-amber-500/20">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">
            Territory Value
          </p>
          <p className="text-lg font-bold text-amber-600">
            {categoryLabels[category]}
          </p>
        </div>
      </Card>

      {/* Control Info */}
      {territory.guild && territory.controlledAt && (
        <Card className="p-4 bg-emerald-500/5 border border-emerald-500/20 space-y-3">
          <StatItem
            icon={Crown}
            label="Controlled By"
            value={territory.guild.name + ` [${territory.guild.tag}]`}
          />
          <StatItem
            icon={Calendar}
            label="Control Duration Remaining"
            value={
              territory.daysRemaining > 0
                ? `${territory.daysRemaining} days`
                : "Expired"
            }
          />
          <StatItem
            icon={Zap}
            label="Current Stake"
            value={`${Math.round(territory.currentStake)} RESONANCE`}
          />
        </Card>
      )}

      {/* Lore Box */}
      <Card className="p-4 bg-blue-500/5 border border-blue-500/20">
        <p className="text-sm text-foreground/80 leading-relaxed">
          {territory.guild
            ? "This territory vibrates with the harmony of the controlling guild. The resonance bonds all members, granting them power in these lands. Challenge to prove your guild's mastery."
            : "This territory lies dormant, waiting for a guild to stake their collective RESONANCE and awaken its power."}
        </p>
      </Card>
    </div>
  );
}
