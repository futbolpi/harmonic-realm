import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type DetailCardProps = {
  guild: { vaultBalance: number; vaultLevel: number };
  nextLevel: {
    resonanceCost: number;
  } | null;
  currentLevel: {
    maxMembers: number;
    sharePointsBonus: number;
  } | null;
};

const DetailCard = async ({
  guild,
  nextLevel,
  currentLevel,
}: DetailCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🏛️ Resonance Vault</CardTitle>
        <CardDescription>Economic hub for guild funds</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-start gap-3">
          <div className="text-3xl font-bold">
            {guild.vaultBalance.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}{" "}
            <span className="text-sm">SP</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Level {guild.vaultLevel}
            <span className="text-xs">/10</span> Vault
          </div>

          {currentLevel && (
            <div className="p-4 bg-muted rounded">
              <h3 className="font-semibold mb-2">Current Benefits:</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  ✓ +{currentLevel?.sharePointsBonus}% SharePoints for all
                  members
                </li>
                <li>✓ {currentLevel?.maxMembers} max members</li>
              </ul>
            </div>
          )}

          {nextLevel && (
            <div className="w-full mt-3">
              <Progress
                value={Math.min(
                  (guild.vaultBalance + 1 / nextLevel.resonanceCost) * 100,
                  100
                )}
                className="h-2"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {guild.vaultBalance.toLocaleString()} /{" "}
                {nextLevel.resonanceCost.toLocaleString()} SP
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DetailCard;
