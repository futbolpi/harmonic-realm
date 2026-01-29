import Link from "next/link";
import { Trophy, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function EmptyLeaderboard() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Trophy className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Guilds Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          The cosmic leaderboard awaits its first contenders. Be a pioneer and
          establish your guild to claim your place in history.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/guilds/create">
              <Users className="h-4 w-4 mr-2" />
              Create Guild
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/guilds">Browse Guilds</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
