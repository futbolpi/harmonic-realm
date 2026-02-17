"use client";

import {
  CircleHelp,
  Zap,
  TrendingUp,
  Coins,
  MapPin,
  Clock,
  Target,
  CheckCircle,
  Flame,
  Users,
  Building2,
  BookOpen,
} from "lucide-react";

import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaBody,
  CredenzaTrigger,
} from "@/components/credenza";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function SurgeInfoModal() {
  return (
    <Credenza>
      <CredenzaTrigger asChild>
        <Button variant="outline" size="icon">
          <CircleHelp className="h-4 w-4" />
        </Button>
      </CredenzaTrigger>

      <CredenzaContent className="max-w-2xl">
        <CredenzaHeader>
          <CredenzaTitle className="flex items-center gap-2 text-2xl">
            <Zap className="h-6 w-6 text-amber-500" />
            Resonance Surge
          </CredenzaTitle>
        </CredenzaHeader>

        <CredenzaBody className="space-y-6 py-4 max-h-[85vh] overflow-y-auto">
          {/* Hero Description */}
          <div className="p-4 bg-linear-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-lg font-semibold mb-2">
              The Lattice Remembers Your Actions
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every day at midnight UTC, the cosmic grid analyzes the past
              week&apos;s activity across all locations. High-activity zones
              receive{" "}
              <span className="font-semibold text-amber-500">
                50-200 Surge nodes
              </span>{" "}
              with
              <span className="font-semibold text-amber-500">
                {" "}
                2.0× yield multipliers
              </span>
              . Mine one first to{" "}
              <span className="font-semibold text-green-500">
                anchor it permanently
              </span>
              !
            </p>
          </div>

          {/* Key Benefits */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Why Surge Nodes Matter
            </h3>

            <div className="grid gap-3">
              <BenefitCard
                icon={<Zap className="h-5 w-5 text-amber-500" />}
                title="2.0× Yield Multiplier"
                description="Double sharePoints compared to standard nodes. High-rank nodes in top zones earn even more."
                highlight
              />

              <BenefitCard
                icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                title="Mine to Own Forever"
                description="First miner stabilizes the node into permanent Lattice content. Your name gets immortalized!"
              />

              <BenefitCard
                icon={<Clock className="h-5 w-5 text-primary" />}
                title="24-Hour Window"
                description="Unclaimed nodes expire at midnight. Create urgency without pressure—plan your routes daily."
              />
            </div>
          </div>

          <Separator />

          {/* How Activity is Weighted */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              How Your Actions Attract Surges
            </h3>

            <p className="text-sm text-muted-foreground">
              Not all activities are equal. The Lattice values{" "}
              <span className="font-semibold">permanence and investment</span>:
            </p>

            <div className="space-y-2">
              <ActivityWeight
                activity="Resonant Anchoring"
                weight={1000}
                icon={<MapPin className="h-4 w-4 text-purple-500" />}
                description="Create a node with Pi → Surge spawns near it daily"
              />

              <ActivityWeight
                activity="Lattice Calibration"
                weight={500}
                icon={<Coins className="h-4 w-4 text-blue-500" />}
                description="Fund community events → Your area gets priority spawns"
              />

              <ActivityWeight
                activity="Lore Staking"
                weight={300}
                icon={<BookOpen className="h-4 w-4 text-orange-500" />}
                description="Invest Pi in location stories → Attract cultural nodes"
              />

              <ActivityWeight
                activity="Mining Sessions"
                weight={50}
                icon={<Zap className="h-4 w-4 text-amber-500" />}
                description="Complete full mining sessions → Build local activity score"
              />

              <ActivityWeight
                activity="Chamber Maintenance"
                weight={25}
                icon={<Building2 className="h-4 w-4 text-green-500" />}
                description="Keep chambers active → Consistent weekly spawns"
              />

              <ActivityWeight
                activity="Tuning Sessions"
                weight={10}
                icon={<Flame className="h-4 w-4 text-red-500" />}
                description="Daily tuning → Steady contribution to hex scores"
              />
            </div>
          </div>

          <Separator />

          {/* Strategic Tips */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Pro Strategies
            </h3>

            <div className="space-y-3">
              <StrategyTip
                title="Anchor in Your Home Zone"
                tip="Place a Resonant Anchor near home/work. Its 1000× weight guarantees daily Surges nearby—your personal node farm!"
                tierBadge="Meta Strategy"
                tierColor="purple"
              />

              <StrategyTip
                title="Stack Calibration Contributions"
                tip="Contribute Pi to Calibration events in your area. Each contribution = 500× weight. Stack 5 contributions = 2,500 points!"
                tierBadge="High Impact"
                tierColor="blue"
              />

              <StrategyTip
                title="Maintain Chambers for Consistency"
                tip="Active chambers = guaranteed weekly spawns. Keep 3 chambers at max durability in different zones for coverage."
                tierBadge="Reliable Income"
                tierColor="green"
              />

              <StrategyTip
                title="Early Bird Gets the Legendary"
                tip="Check heatmap at 00:05 UTC daily. Top-rank nodes (Legendary tier) get claimed within 1-2 hours in active cities."
                tierBadge="Competitive Edge"
                tierColor="amber"
              />
            </div>
          </div>

          <Separator />

          {/* FOMO Section */}
          <div className="p-4 bg-linear-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
              <div className="space-y-2">
                <p className="font-semibold text-green-500">
                  Rural Players: This Solves Your Content Problem
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Even a single mining session in a remote area = spawns there
                  next day. The system is designed to{" "}
                  <span className="font-semibold">reward ANY activity</span>.
                  Create your own node ecosystem through consistent
                  engagement—no need to travel to cities!
                </p>
              </div>
            </div>
          </div>

          {/* Daily Cycle Explainer */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Daily Spawn Cycle
            </h3>

            <div className="space-y-2">
              <TimelineStep
                time="00:00 UTC"
                title="Cleanup & Analysis"
                description="Unmined Surges from yesterday are removed. System analyzes last 7 days of activity across all hexes."
              />

              <TimelineStep
                time="00:01 UTC"
                title="Surge Spawn"
                description="50-200 nodes spawn in top activity zones. Heatmap updates instantly with new node locations."
              />

              <TimelineStep
                time="00:05 UTC"
                title="The Race Begins"
                description="Competitive players check heatmap, plan routes to high-rank nodes. First miners stabilize nodes into permanent content."
              />

              <TimelineStep
                time="23:59 UTC"
                title="Final Hour Rush"
                description="Unclaimed nodes expire in 1 hour. Last chance to mine before they vanish forever."
              />
            </div>
          </div>

          <Separator />

          {/* Call to Action */}
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="font-semibold mb-2 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Ready to Shape the Lattice?
            </p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>Check the heatmap daily to find Surges near you</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>
                  Mine consistently to boost your area&apos;s activity score
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>Anchor/Calibrate to guarantee future spawns</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>
                  Be first to stabilize high-rank nodes for bragging rights
                </span>
              </li>
            </ul>
          </div>
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  );
}

// Helper Components

function BenefitCard({
  icon,
  title,
  description,
  highlight = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-3 rounded-lg border ${
        highlight
          ? "bg-amber-500/10 border-amber-500/20"
          : "bg-card border-border"
      }`}
    >
      <div className="flex items-start gap-3">
        {icon}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm mb-1">{title}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function ActivityWeight({
  activity,
  weight,
  icon,
  description,
}: {
  activity: string;
  weight: number;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/50">
      {icon}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="font-medium text-sm">{activity}</p>
          <Badge variant="secondary" className="font-mono text-xs">
            {weight}×
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function StrategyTip({
  title,
  tip,
  tierBadge,
  tierColor,
}: {
  title: string;
  tip: string;
  tierBadge: string;
  tierColor: string;
}) {
  const colorClasses = {
    purple: "bg-purple-500/10 border-purple-500/20 text-purple-500",
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-500",
    green: "bg-green-500/10 border-green-500/20 text-green-500",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-500",
  };

  return (
    <div
      className={`p-3 rounded-lg border ${colorClasses[tierColor as keyof typeof colorClasses]}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-semibold text-sm">{title}</p>
        <Badge variant="outline" className="text-xs border-current">
          {tierBadge}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
    </div>
  );
}

function TimelineStep({
  time,
  title,
  description,
}: {
  time: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 pl-2 border-l-2 border-primary/30 py-2">
      <div className="shrink-0 w-20">
        <Badge variant="outline" className="font-mono text-xs">
          {time}
        </Badge>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm mb-1">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
