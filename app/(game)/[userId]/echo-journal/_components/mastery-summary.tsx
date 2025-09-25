"use client";

import { Zap, Target, TrendingUp, Award } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MasterySummaryProps {
  summary: {
    totalMasteries: number;
    averageLevel: number;
    highestLevel: number;
    totalBonusValue: number;
    masteredNodeTypes: number;
  };
}

export function MasterySummary({ summary }: MasterySummaryProps) {
  return (
    <Card className="game-card animate-in slide-in-from-top-4 duration-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Zap className="h-6 w-6 animate-pulse text-[color:var(--color-neon-blue)]" />
          Harmonic Resonance Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center space-y-2 p-3 rounded-lg animate-in zoom-in-95 duration-500 delay-100 bg-[color:var(--color-neon-green)]/10 border border-[color:var(--color-neon-green)]/20">
            <Target className="h-5 w-5 text-[color:var(--color-neon-green)]" />
            <span className="text-2xl font-bold text-foreground">
              {summary.totalMasteries}
            </span>
            <span className="text-xs text-muted-foreground text-center">
              Node Types
              <br />
              Mastered
            </span>
          </div>

          <div className="flex flex-col items-center space-y-2 p-3 rounded-lg animate-in zoom-in-95 duration-500 delay-200 bg-[color:var(--color-neon-purple)]/10 border border-[color:var(--color-neon-purple)]/20">
            <TrendingUp className="h-5 w-5 text-[color:var(--color-neon-purple)]" />
            <span className="text-2xl font-bold text-foreground">
              {summary.averageLevel}
            </span>
            <span className="text-xs text-muted-foreground text-center">
              Average
              <br />
              Resonance
            </span>
          </div>

          <div className="flex flex-col items-center space-y-2 p-3 rounded-lg animate-in zoom-in-95 duration-500 delay-300 bg-[color:var(--color-neon-blue)]/10 border border-[color:var(--color-neon-blue)]/20">
            <Award className="h-5 w-5 text-[color:var(--color-neon-blue)]" />
            <span className="text-2xl font-bold text-foreground">
              {summary.highestLevel}
            </span>
            <span className="text-xs text-muted-foreground text-center">
              Peak
              <br />
              Mastery
            </span>
          </div>

          <div className="flex flex-col items-center space-y-2 p-3 rounded-lg animate-in zoom-in-95 duration-500 delay-400 bg-[color:var(--color-neon-pink)]/10 border border-[color:var(--color-neon-pink)]/20">
            <Zap className="h-5 w-5 text-[color:var(--color-neon-pink)]" />
            <span className="text-2xl font-bold text-foreground">
              {summary.totalBonusValue}%
            </span>
            <span className="text-xs text-muted-foreground text-center">
              Combined
              <br />
              Resonance
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
