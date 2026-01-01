import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculatePercentage } from "@/lib/utils";

type TopContributorsProps = {
  topContributors: {
    id: string;
    username: string;
    vaultContribution: number;
  }[];
  totalContributed: number;
};

const TopContributors = ({
  topContributors,
  totalContributed,
}: TopContributorsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Contributors</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal pl-5">
          {topContributors.map((c) => (
            <li key={c.id} className="text-sm">
              {c.username} — {c.vaultContribution.toLocaleString()} SP (
              {calculatePercentage(c.vaultContribution, totalContributed)}%)
            </li>
          ))}
        </ol>
        {topContributors.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No contributions yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopContributors;
