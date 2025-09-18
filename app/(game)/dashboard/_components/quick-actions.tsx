"use client";

import Link from "next/link";
import { BookOpen, MapPin, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface QuickActionsProps {
  userId: string;
}

export function QuickActions({ userId }: QuickActionsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Navigation Hub</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/map" id="map-link">
          <Card className="game-card hover:scale-105 transition-transform cursor-pointer group">
            <CardContent className="p-6 text-center">
              <MapPin className="h-12 w-12 text-neon-orange mx-auto mb-3 group-hover:animate-pulse" />
              <h3 className="font-semibold mb-2">Lattice Map</h3>
              <p className="text-sm text-muted-foreground">
                Explore cosmic convergence points
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/${userId}/echo-journal`} id="journal-link">
          <Card className="game-card hover:scale-105 transition-transform cursor-pointer group">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 text-neon-purple mx-auto mb-3 group-hover:animate-pulse" />
              <h3 className="font-semibold mb-2">Echo Journal</h3>
              <p className="text-sm text-muted-foreground">
                Your mining journey chronicle
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/leaderboard" id="leaderboard-link">
          <Card className="game-card hover:scale-105 transition-transform cursor-pointer group">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-neon-green mx-auto mb-3 group-hover:animate-pulse" />
              <h3 className="font-semibold mb-2">Leaderboard</h3>
              <p className="text-sm text-muted-foreground">
                Pioneer rankings & achievements
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
