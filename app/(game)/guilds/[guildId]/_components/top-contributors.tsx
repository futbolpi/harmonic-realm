import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TopContributorsProps = {
  topContributors: {
    username: string;
    weeklySharePoints: number;
  }[];
  guildId: string;
};

const TopContributors = ({
  topContributors,
  guildId,
}: TopContributorsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Contributors (This Week)</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal pl-5 space-y-1">
          {topContributors.map((c) => (
            <li key={c.username} className="text-sm">
              {c.username} — {c.weeklySharePoints} SP
            </li>
          ))}
        </ol>
        <div className="mt-3">
          <Link
            href={`/guilds/${guildId}/members`}
            className="text-sm text-primary"
          >
            View All Members →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopContributors;
