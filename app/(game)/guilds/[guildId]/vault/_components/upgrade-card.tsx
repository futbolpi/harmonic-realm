import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UpgradeButton from "./upgrade-button";

type UpgradeCardProps = {
  guild: { vaultLevel: number; vaultBalance: number; id: string };
  vaultUpgrade: { resonanceCost: number; description: string; name: string };
};

const UpgradeCard = ({ guild, vaultUpgrade }: UpgradeCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{vaultUpgrade.name}</CardTitle>
        <CardDescription>
          🔓 Next Level: Level {guild.vaultLevel + 1}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm">
            Cost:{" "}
            <span className="font-semibold">
              {vaultUpgrade.resonanceCost.toLocaleString()} Points
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {vaultUpgrade.description}
          </div>
          <UpgradeButton
            guild={guild}
            upgradeCost={vaultUpgrade.resonanceCost}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default UpgradeCard;
