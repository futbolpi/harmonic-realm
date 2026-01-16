import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChallengeInfoCard() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base">💡 How Challenges Work</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span>•</span>
            <span>New challenges refresh every Monday</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Guilds can have max 4 active challenges at once</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>All guild members contribute towards shared goals</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Rewards are distributed to the vault upon completion</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Individual contributions are tracked for leaderboards</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
