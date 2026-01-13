import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TerritoriesOverviewProps {
  stats: {
    controlledTerritories: number;
    territoriesUnderChallenge: number;
    expiringTerritories: number;
    totalStaked: number;
  };
}

export default function TerritoriesOverview({
  stats,
}: TerritoriesOverviewProps) {
  const statItems = [
    {
      title: "Secured",
      value: stats.controlledTerritories,
      description: "territories",
      variant: "default" as const,
    },
    {
      title: "Under Challenge",
      value: stats.territoriesUnderChallenge,
      description: "active wars",
      variant: "destructive" as const,
    },
    {
      title: "Expiring Soon",
      value: stats.expiringTerritories,
      description: "within 24h",
      variant: "warning" as const,
    },
    {
      title: "Total Staked",
      value: `${stats.totalStaked.toLocaleString()}`,
      description: "RESONANCE",
      variant: "secondary" as const,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item, i) => {
        const bgClasses = {
          default: "bg-gradient-to-br from-primary/10 to-primary/5",
          destructive: "bg-gradient-to-br from-red-500/10 to-red-500/5",
          warning: "bg-gradient-to-br from-amber-500/10 to-amber-500/5",
          secondary: "bg-gradient-to-br from-secondary/10 to-secondary/5",
        };

        return (
          <Card
            key={i}
            className={`border-border/50 ${bgClasses[item.variant]}`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-3xl font-bold tracking-tight">
                  {item.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
