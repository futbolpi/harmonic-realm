import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { getPrestigeTier } from "@/lib/utils/prestige";
import PrestigeButton from "./prestige-button";

type Props = {
  vaultBalance: number;
  prestigeLevel: number;
  prestigePoints: number;
  prestigeMultiplier: number;
  totalTerritories: number;
  guildName: string;
};

const Stats = ({
  prestigeLevel,
  prestigePoints,
  prestigeMultiplier,
  vaultBalance,
  totalTerritories,
  guildName,
}: Props) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Guild Stats</CardTitle>
            <CardDescription>
              Overview of economic and social health
            </CardDescription>
          </div>
          <PrestigeButton
            prestigePoints={prestigePoints}
            prestigeLevel={prestigeLevel}
            prestigeMultiplier={prestigeMultiplier}
            guildName={guildName}
          />
        </div>
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
              {getPrestigeTier(prestigeLevel)}{" "}
              <span className="text-sm">Tier</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Level {prestigeLevel}
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
