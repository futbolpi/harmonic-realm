import { Clock, Sparkles, TimerIcon } from "lucide-react";

import {
  Credenza,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaContent,
  CredenzaDescription,
  CredenzaTrigger,
} from "@/components/credenza";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DetailedViewDrawerProps = {
  tierColor: string;
  loreNarrative: string | null;
  tierName: string;
  mastery: {
    level: number;
    bonusPercent: number;
    sessionsCompleted: number;
    nodeType: {
      name: string;
      extendedLore: string | null;
      baseYieldPerMinute: number;
    };
  };
};

const DetailedViewDrawer = ({
  tierColor,
  tierName,
  mastery,
  loreNarrative,
}: DetailedViewDrawerProps) => {
  return (
    <Credenza>
      <CredenzaTrigger asChild>
        <Button variant="outline" className="w-full">
          View Harmonic Details
        </Button>
      </CredenzaTrigger>
      <CredenzaContent className="max-h-[80vh]">
        <CredenzaHeader>
          <CredenzaTitle className="flex items-center gap-2">
            <TimerIcon className={`h-5 w-5 ${tierColor}`} />
            {mastery.nodeType.name} Mastery
          </CredenzaTitle>
          <CredenzaDescription>
            {tierName} • Level {mastery.level} • {mastery.bonusPercent}%
            Resonance Bonus
          </CredenzaDescription>
        </CredenzaHeader>
        <div className="px-4 pb-4 space-y-6">
          {/* Lore Narrative */}
          {loreNarrative && (
            <Card className="bg-gradient-to-br from-violet-500/10 to-blue-500/10">
              <CardHeader>
                <CardTitle className="text-sm text-violet-100">
                  Lattice Whispers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground italic leading-relaxed">
                  &quot;{loreNarrative}&quot;
                </p>
              </CardContent>
            </Card>
          )}

          {/* Extended Node Lore */}
          {mastery.nodeType.extendedLore && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Node Type Secrets</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {mastery.nodeType.extendedLore}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Detailed Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <div>
                    <div className="text-lg font-bold">
                      {mastery.sessionsCompleted}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Mining Sessions
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                  <div>
                    <div className="text-lg font-bold">
                      {mastery.nodeType.baseYieldPerMinute.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Base Yield/Min
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CredenzaContent>
    </Credenza>
  );
};

export default DetailedViewDrawer;
