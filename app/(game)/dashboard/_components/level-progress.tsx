import { Progress } from "@/components/ui/progress";
import { xpForLevel } from "@/lib/utils/xp";

type LevelProgressProps = { currentLevel: number; currentXP: number };

const LevelProgress = ({ currentXP, currentLevel }: LevelProgressProps) => {
  const nextLevelXP = xpForLevel(currentLevel + 1);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          Resonance to Level {currentLevel + 1}
        </span>
        <span className="text-primary">
          {currentXP}/{nextLevelXP} XP
        </span>
      </div>
      <Progress value={(currentXP / nextLevelXP) * 100} className="h-2" />
    </div>
  );
};

export default LevelProgress;
