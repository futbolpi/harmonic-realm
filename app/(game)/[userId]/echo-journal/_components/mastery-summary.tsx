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
    <Card className="bg-gradient-to-br from-violet-500/10 via-blue-500/10 to-purple-500/10 border-violet-200/20 animate-in slide-in-from-top-4 duration-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-violet-100">
          <Zap className="h-6 w-6 text-yellow-400 animate-pulse" />
          Harmonic Resonance Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center space-y-2 p-3 rounded-lg bg-blue-500/20 animate-in zoom-in-95 duration-500 delay-100">
            <Target className="h-5 w-5 text-blue-400" />
            <span className="text-2xl font-bold text-blue-100">
              {summary.totalMasteries}
            </span>
            <span className="text-xs text-blue-200 text-center">
              Node Types
              <br />
              Mastered
            </span>
          </div>

          <div className="flex flex-col items-center space-y-2 p-3 rounded-lg bg-purple-500/20 animate-in zoom-in-95 duration-500 delay-200">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            <span className="text-2xl font-bold text-purple-100">
              {summary.averageLevel}
            </span>
            <span className="text-xs text-purple-200 text-center">
              Average
              <br />
              Resonance
            </span>
          </div>

          <div className="flex flex-col items-center space-y-2 p-3 rounded-lg bg-yellow-500/20 animate-in zoom-in-95 duration-500 delay-300">
            <Award className="h-5 w-5 text-yellow-400" />
            <span className="text-2xl font-bold text-yellow-100">
              {summary.highestLevel}
            </span>
            <span className="text-xs text-yellow-200 text-center">
              Peak
              <br />
              Mastery
            </span>
          </div>

          <div className="flex flex-col items-center space-y-2 p-3 rounded-lg bg-green-500/20 animate-in zoom-in-95 duration-500 delay-400">
            <Zap className="h-5 w-5 text-green-400" />
            <span className="text-2xl font-bold text-green-100">
              {summary.totalBonusValue}%
            </span>
            <span className="text-xs text-green-200 text-center">
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
