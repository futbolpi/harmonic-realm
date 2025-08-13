import { Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import type { UserProfileAchievement } from "@/lib/schema/user";

type RecentAchievementsProps = { achievements: UserProfileAchievement[] };

const RecentAchievements = ({ achievements }: RecentAchievementsProps) => {
  return (
    <Card className="game-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-neon-orange" />
          Recent Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/20"
            >
              <div className="w-10 h-10 rounded-full bg-neon-orange/20 flex items-center justify-center">
                <span className="text-lg">
                  {achievement.achievement.icon || "🏆"}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {achievement.achievement.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {achievement.achievement.description}
                </p>
              </div>
              <Badge
                variant="outline"
                className="text-neon-green border-neon-green/50"
              >
                Unlocked
              </Badge>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-4 bg-transparent">
          View All Achievements
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecentAchievements;
