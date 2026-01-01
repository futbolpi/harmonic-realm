import Link from "next/link";
import { Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-8 pb-6">
          <div className="mb-6">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h1 className="text-2xl font-bold mb-2">Unable to Join Guild</h1>
            <p className="text-muted-foreground">
              The invitation or guild ID you used does not match any guild in
              this realm. The guild may have been disbanded, not completed its
              creation, or its roster is full.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button asChild className="game-button">
              <Link href="/guilds/discover">Discover Guilds</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href="/guilds/create">Create a New Guild</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
