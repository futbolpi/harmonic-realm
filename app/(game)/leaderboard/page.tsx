import type { Metadata } from "next";

import { LeaderboardClient } from "./_components/leaderboard-client";
import { getSiteStats } from "@/lib/api-helpers/server/site";

export const metadata: Metadata = {
  title: "Pioneer Leaderboard | HarmonicRealm",
  description:
    "Discover the most resonant Pioneers in the cosmic Lattice. View rankings, achievements, and harmonic mastery levels across the HarmonicRealm.",
  openGraph: {
    title: "Pioneer Leaderboard - HarmonicRealm",
    description: "Discover the most resonant Pioneers in the cosmic Lattice",
    images: [
      {
        url: "/api/og?title=Pioneer Leaderboard&description=Discover the most resonant Pioneers in the cosmic Lattice&type=leaderboard",
        width: 1200,
        height: 630,
        alt: "HarmonicRealm Pioneer Leaderboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pioneer Leaderboard - HarmonicRealm",
    description: "Discover the most resonant Pioneers in the cosmic Lattice",
    images: [
      "/api/og?title=Pioneer Leaderboard&description=Discover the most resonant Pioneers in the cosmic Lattice&type=leaderboard",
    ],
  },
};

export default async function LeaderboardPage() {
  const {
    leaderboard: pioneers,
    pioneersAggregate,
    sessionsCompleted: totalSessions,
  } = await getSiteStats();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-neon-purple bg-clip-text text-transparent">
          Pioneer Leaderboard
        </h1>
        <p className="text-muted-foreground">
          Discover the most resonant Pioneers across the cosmic Lattice
        </p>
      </div>

      <LeaderboardClient
        data={{
          pioneers,
          globalStats: {
            totalSessions,
            averageLevel: pioneersAggregate._avg.level ?? 0,
            totalSharePoints: pioneersAggregate._sum.sharePoints ?? 0,
          },
          totalPioneers: pioneersAggregate._count.id,
        }}
      />
    </div>
  );
}
