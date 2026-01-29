"use client";

import Link from "next/link";
import { Crown, Users, MapPin } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMetricValue, getMetricLabel } from "../utils";
import type { LeaderboardGuild, LeaderboardType } from "../services";

interface TopThreePodsProps {
  guilds: LeaderboardGuild[];
  type: LeaderboardType;
}

export function TopThreePods({ guilds, type }: TopThreePodsProps) {
  if (guilds.length === 0) return null;

  const [first, second, third] = guilds.slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
      {/* Second Place */}
      {second && (
        <Link
          href={`/guilds/${second.id}`}
          prefetch={false}
          className="block order-2 md:order-1"
        >
          <Card className="relative overflow-hidden hover:shadow-lg transition-shadow border-2 border-gray-300 dark:border-gray-700">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-400 to-gray-300" />
            <CardContent className="pt-8 pb-6 text-center">
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="text-lg">
                  🥈
                </Badge>
              </div>
              <div className="text-5xl mb-3">{second.emblem}</div>
              <h3 className="font-bold text-lg mb-1">{second.name}</h3>
              <Badge variant="outline" className="mb-3">
                {second.tag}
              </Badge>
              <div className="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                {getMetricValue(second, type).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {getMetricLabel(type)}
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {second._count.members}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {second._count.territories}
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* First Place */}
      <Link
        href={`/guilds/${first.id}`}
        className="block order-1 md:order-2"
        prefetch={false}
      >
        <Card className="relative overflow-hidden hover:shadow-2xl transition-shadow border-2 border-yellow-400 dark:border-yellow-600 md:scale-110">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 animate-pulse" />
          <CardContent className="pt-8 pb-6 text-center">
            <div className="absolute top-2 right-2 animate-bounce">
              <Crown className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="text-6xl mb-3 animate-pulse">{first.emblem}</div>
            <h3 className="font-bold text-xl mb-1">{first.name}</h3>
            <Badge className="mb-3 bg-yellow-500 hover:bg-yellow-600">
              {first.tag}
            </Badge>
            <div className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent mb-2">
              {getMetricValue(first, type).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {getMetricLabel(type)}
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {first._count.members}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {first._count.territories}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Third Place */}
      {third && (
        <Link
          href={`/guilds/${third.id}`}
          className="block order-3"
          prefetch={false}
        >
          <Card className="relative overflow-hidden hover:shadow-lg transition-shadow border-2 border-amber-600 dark:border-amber-800">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-700 to-amber-500" />
            <CardContent className="pt-8 pb-6 text-center">
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="text-lg">
                  🥉
                </Badge>
              </div>
              <div className="text-5xl mb-3">{third.emblem}</div>
              <h3 className="font-bold text-lg mb-1">{third.name}</h3>
              <Badge variant="outline" className="mb-3">
                {third.tag}
              </Badge>
              <div className="text-3xl font-bold text-amber-700 dark:text-amber-500 mb-2">
                {getMetricValue(third, type).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {getMetricLabel(type)}
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {third._count.members}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {third._count.territories}
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}
    </div>
  );
}
