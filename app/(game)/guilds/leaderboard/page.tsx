import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAllPublicGuilds } from "./services";
import { LeaderboardClient } from "./_components/leaderboard-client";
import { LeaderboardInfo } from "./_components/leaderboard-info";

export const metadata = {
  title: "Guild Leaderboard - HarmonicRealm",
  description:
    "Compete for cosmic supremacy. View guild rankings by prestige, activity, vault wealth, and territorial dominance.",
};

export default async function LeaderboardPage() {
  // Fetch all public guilds - filtering/sorting happens client-side
  const guilds = await getAllPublicGuilds();

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
              <Link href="/guilds/discover">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Trophy className="h-8 w-8 text-primary" />
                Guild Leaderboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Compete for cosmic supremacy across the Lattice
              </p>
            </div>
          </div>
          <LeaderboardInfo />
        </div>

        {/* Leaderboard Content */}
        <LeaderboardClient allGuilds={guilds} />
      </div>
    </main>
  );
}
