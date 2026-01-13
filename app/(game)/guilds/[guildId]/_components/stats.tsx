import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

type Props = {
  vaultBalance: number;
  totalSharePoints: number;
  totalTerritories: number;
};

const Stats = ({ totalSharePoints, vaultBalance, totalTerritories }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Guild Stats</CardTitle>
        <CardDescription>
          Overview of economic and social health
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 overflow-x-auto py-2">
          <div className="min-w-[180px] p-3 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground">Vault</p>
            <p className="text-xl font-bold">
              {vaultBalance.toLocaleString()}{" "}
              <span className="text-sm">SP</span>
            </p>
          </div>
          <div className="min-w-[180px] p-3 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground">Prestige</p>
            <p className="text-xl font-bold">
              {totalSharePoints.toLocaleString()}{" "}
              <span className="text-sm">Points</span>
            </p>
          </div>
          <div className="min-w-[180px] p-3 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground">Territories</p>
            <p className="text-xl font-bold">{totalTerritories}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Stats;
