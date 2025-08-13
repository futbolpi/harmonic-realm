import { Progress } from "@/components/ui/progress";

type LevelProgressProps = { currentLevel: number; currentXp: number };

const LevelProgress = ({ currentXp, currentLevel }: LevelProgressProps) => {
  const nextLevelXP = 2;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          Progress to Level {currentLevel + 1}
        </span>
        <span className="text-primary">
          {currentXp}/{nextLevelXP} XP
        </span>
      </div>
      <Progress value={(currentXp / nextLevelXP) * 100} className="h-2" />
    </div>
  );
};

export default LevelProgress;
