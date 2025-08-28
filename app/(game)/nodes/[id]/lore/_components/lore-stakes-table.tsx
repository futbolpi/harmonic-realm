"use client";

import { Users, Coins, Clock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import UserAvatar from "@/components/shared/user-avatar";

// Mock data - replace with actual data fetching
const mockStakes = [
  {
    id: "1",
    user: { name: "Pioneer Alpha", id: "user_1" },
    piAmount: 2.5,
    targetLevel: 2,
    contributionTier: "RESONANCE_PATRON",
    createdAt: new Date("2024-01-15"),
    paymentStatus: "COMPLETED",
  },
  {
    id: "2",
    user: { name: "Cosmic Explorer", id: "user_2" },
    piAmount: 1.0,
    targetLevel: 2,
    contributionTier: "RESONANCE_PATRON",
    createdAt: new Date("2024-01-14"),
    paymentStatus: "COMPLETED",
  },
  {
    id: "3",
    user: { name: "Echo Seeker", id: "user_3" },
    piAmount: 0.5,
    targetLevel: 1,
    contributionTier: "ECHO_SUPPORTER",
    createdAt: new Date("2024-01-13"),
    paymentStatus: "COMPLETED",
  },
];

const TIER_COLORS = {
  ECHO_SUPPORTER: "bg-blue-100 text-blue-800",
  RESONANCE_PATRON: "bg-purple-100 text-purple-800",
  LATTICE_ARCHITECT: "bg-amber-100 text-amber-800",
  COSMIC_FOUNDER: "bg-red-100 text-red-800",
};

const TIER_NAMES = {
  ECHO_SUPPORTER: "Echo Supporter",
  RESONANCE_PATRON: "Resonance Patron",
  LATTICE_ARCHITECT: "Lattice Architect",
  COSMIC_FOUNDER: "Cosmic Founder",
};

export function LoreStakesTable() {
  const stakes = mockStakes;
  const totalContributors = stakes.length;
  const totalPiStaked = stakes.reduce((sum, stake) => sum + stake.piAmount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Contributors
              </span>
            </div>
            <p className="text-2xl font-bold">{totalContributors}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-accent" />
              <span className="text-sm text-muted-foreground">
                Total Staked
              </span>
            </div>
            <p className="text-2xl font-bold">{totalPiStaked} Pi</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-secondary" />
              <span className="text-sm text-muted-foreground">Latest</span>
            </div>
            <p className="text-sm font-medium">
              {stakes[0]?.createdAt.toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stakes List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Community Contributors
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stakes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>
                No contributions yet. Be the first to unlock this
                location&apos;s story!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {stakes.map((stake) => (
                <div
                  key={stake.id}
                  className="p-4 rounded-lg border bg-card/50"
                >
                  <div className="flex items-start gap-3">
                    <UserAvatar size={40} userId={stake.user.id} />
                    <div className="flex-1 min-w-0">
                      {/* User info and date */}
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium truncate">
                          {stake.user.name}
                        </p>
                        <p className="text-sm font-bold text-accent flex-shrink-0">
                          {stake.piAmount} Pi
                        </p>
                      </div>

                      {/* Level, date, and status in mobile-friendly layout */}
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-muted-foreground">
                          Level {stake.targetLevel} •{" "}
                          {stake.createdAt.toLocaleDateString()}
                        </span>
                        <Badge
                          variant={
                            stake.paymentStatus === "COMPLETED"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs flex-shrink-0"
                        >
                          {stake.paymentStatus}
                        </Badge>
                      </div>

                      {/* Contribution tier badge on its own line for mobile */}
                      <div className="mt-2">
                        <Badge
                          variant="secondary"
                          className={`${
                            TIER_COLORS[
                              stake.contributionTier as keyof typeof TIER_COLORS
                            ]
                          } text-xs`}
                        >
                          {
                            TIER_NAMES[
                              stake.contributionTier as keyof typeof TIER_NAMES
                            ]
                          }
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
