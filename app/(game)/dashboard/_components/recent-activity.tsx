import { Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatPi } from "@/lib/utils";
import type { UserProfileSession } from "@/lib/schema/user";

type RecentActivityProps = { sessions: UserProfileSession[] };

const RecentActivity = ({ sessions }: RecentActivityProps) => {
  return (
    <Card className="game-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Recent Mining Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/20"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    session.status === "COMPLETED"
                      ? "bg-neon-green"
                      : session.status === "ACTIVE"
                      ? "bg-neon-orange animate-pulse"
                      : "bg-muted-foreground"
                  )}
                ></div>
                <div>
                  <p className="font-medium">{session.node.type.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {session.node.type.lockInMinutes}m session
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-neon-green">
                  +{formatPi(session.minerSharesEarned)}
                </p>
                <Badge variant="outline" className="text-xs">
                  {session.status.toLowerCase()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-4 bg-transparent">
          View All Sessions
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
