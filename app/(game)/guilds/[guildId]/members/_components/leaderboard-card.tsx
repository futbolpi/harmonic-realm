import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LeaderboardCardProps = {
  members: { weeklySharePoints: number; username: string }[];
};

const LeaderboardCard = ({ members }: LeaderboardCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 This Week&apos;s Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal pl-5">
          {members
            .slice()
            .sort(
              (a, b) => (b.weeklySharePoints ?? 0) - (a.weeklySharePoints ?? 0)
            )
            .slice(0, 10)
            .map((m) => (
              <li key={m.username} className="text-sm">
                {m.username} — {m.weeklySharePoints ?? 0} SP
              </li>
            ))}
        </ol>
        {/* <div className="mt-3">
          <a className="text-sm text-primary" href="#">
            View Full Leaderboard →
          </a>
        </div> */}
      </CardContent>
    </Card>
  );
};

export default LeaderboardCard;
