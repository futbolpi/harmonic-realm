import { Zap } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

export function EmptyMasteryState() {
  return (
    <Card className="text-center py-12 game-card">
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-violet-500/20 animate-pulse">
            <Zap className="h-8 w-8 text-violet-400" />
          </div>
        </div>
        <CardTitle className="text-xl">
          No Harmonic Resonance Detected
        </CardTitle>
        <CardDescription className="max-w-md mx-auto">
          Your journey through the Lattice has yet to establish resonance
          patterns. Begin mining at Nodes to develop your harmonic mastery and
          unlock the deeper mysteries of Pi&apos;s infinite frequencies.
        </CardDescription>
      </CardContent>
    </Card>
  );
}
