import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { GamePhase } from "@/lib/generated/prisma/browser";

interface PhaseOverviewProps {
  phase: GamePhase;
}

export function PhaseOverview({ phase }: PhaseOverviewProps) {
  const progressPercent = phase.currentProgress
    .dividedBy(phase.requiredPiFunding)
    .times(100)
    .toNumber();

  const phaseDescription = `Stake Pi to calibrate the lattice and generate local nodes. Your contribution shapes the harmonic realm—higher stakes unlock rare nodes and amplify your resonance.`;

  return (
    <div className="space-y-6">
      {/* Main Phase Card */}
      <Card>
        <CardHeader>
          <CardTitle>Phase {phase.phaseNumber}</CardTitle>
          <CardDescription>{phaseDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pi Funding Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">
                Pi Funding Progress
              </span>
              <span className="text-sm text-muted-foreground">
                {phase.currentProgress.toString()} /{" "}
                {phase.requiredPiFunding.toString()} Pi
              </span>
            </div>
            <Progress value={Math.min(progressPercent, 100)} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {progressPercent.toFixed(1)}% complete
            </p>
          </div>

          {/* Phase Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard
              label="Total Nodes"
              value={phase.totalNodes.toString()}
              description="Spawned this phase"
            />
            <StatCard
              label="Pi Index"
              value={phase.piDigitsIndex.toString()}
              description="Digit precision"
            />
            <StatCard
              label="Halving Factor"
              value={`${(phase.halvingFactor * 100).toFixed(0)}%`}
              description="Node reduction"
            />
          </div>

          {/* Phase Details */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Trigger Type</span>
              <span className="font-medium">{phase.triggerType}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Started</span>
              <span className="font-medium">
                {phase.startTime.toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="p-3 rounded-lg border border-border bg-card">
      <p className="text-xs font-medium text-primary mb-1">{label}</p>
      <p className="text-lg font-bold text-foreground mb-1">{value}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
