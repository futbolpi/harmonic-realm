import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CHAMBER_CONSTANTS, getDurabilityStatus } from "@/lib/utils/chambers";

const DurabilityCard = ({
  currentDurability,
}: {
  currentDurability: number;
}) => {
  const durabilityStatus = getDurabilityStatus(currentDurability);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Durability</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Status</span>
          <Badge
            variant={durabilityStatus.variant}
            className={durabilityStatus.color}
          >
            {durabilityStatus.label}
          </Badge>
        </div>
        <Progress value={currentDurability} className="h-3" />
        <div className="text-xs text-muted-foreground text-center">
          {currentDurability.toFixed(1)}% • Decays{" "}
          {CHAMBER_CONSTANTS.DURABILITY_DECAY_PER_DAY.toFixed(1)}% per day
        </div>
      </CardContent>
    </Card>
  );
};

export default DurabilityCard;
