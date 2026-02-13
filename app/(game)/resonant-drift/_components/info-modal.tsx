"use client";

import { Info, Sparkles, Target, Clock, MapPin } from "lucide-react";

import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/credenza";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// ============================================================================
// DRIFT INFO MODAL V2.0
// ============================================================================

export default function InfoModal() {
  return (
    <Credenza>
      <CredenzaTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full shadow-lg"
        >
          <Info className="h-4 w-4" />
        </Button>
      </CredenzaTrigger>

      <CredenzaContent className="max-w-2xl">
        <CredenzaHeader>
          <CredenzaTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Resonant Drift
          </CredenzaTitle>
          <CredenzaDescription>
            Enhanced for rural/suburban player accessibility
          </CredenzaDescription>
        </CredenzaHeader>

        <CredenzaBody className="space-y-6 max-h-[90vh] p-2 overflow-y-auto">
          {/* What is Drift */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">What is Resonant Drift?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Lattice is fluid. When nodes remain untuned for 7+ days, their
              frequency becomes unmoored. Pioneers in sparse areas can{" "}
              <span className="font-semibold text-foreground">
                summon these dormant nodes
              </span>{" "}
              to stabilize the drifting signals near their location.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To preserve the hunt, summoned nodes don&apos;t land at your exact
              location — they ground themselves randomly within{" "}
              <span className="font-semibold text-foreground">2-8km</span> of
              you, creating a new exploration opportunity.
            </p>
          </div>

          <Separator />

          {/* Eligibility Zones */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Eligibility Zones (Density Tiers)
            </h3>

            <div className="space-y-2">
              <DensityTierCard
                tier="Void Zone"
                nodeCount="0 nodes"
                multiplier="1.0×"
                color="destructive"
                description="True void. Full drift access at base price."
              />

              <DensityTierCard
                tier="Sparse Zone"
                nodeCount="1-2 nodes"
                multiplier="1.0×"
                color="destructive"
                description="Very sparse content. Full drift access at base price."
              />

              <DensityTierCard
                tier="Low Density"
                nodeCount="3-5 nodes"
                multiplier="1.5×"
                color="secondary"
                description="Some content nearby. Drift available with 50% cost premium."
              />

              <DensityTierCard
                tier="Medium Density"
                nodeCount="6-10 nodes"
                multiplier="❌ Blocked"
                color="outline"
                description="Adequate content. Drift not needed."
              />

              <DensityTierCard
                tier="Dense Zone"
                nodeCount="11+ nodes"
                multiplier="❌ Blocked"
                color="outline"
                description="Rich content area. Drift blocked."
              />
            </div>
          </div>

          <Separator />

          {/* First-Time Discounts */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              First-Time Discounts (New Players)
            </h3>

            <p className="text-sm text-muted-foreground">
              Your first 5 drifts receive graduated discounts to help you
              establish your presence in the Lattice:
            </p>

            <div className="grid grid-cols-1 gap-2">
              <DiscountTierCard drift={1} discount="85%" example="~15 SP" />
              <DiscountTierCard drift={2} discount="70%" example="~30 SP" />
              <DiscountTierCard drift={3} discount="50%" example="~50 SP" />
              <DiscountTierCard drift={4} discount="30%" example="~70 SP" />
              <DiscountTierCard drift={5} discount="15%" example="~85 SP" />
            </div>

            <p className="text-xs text-muted-foreground italic">
              After 5 drifts, standard pricing applies (100 SP base cost).
            </p>
          </div>

          <Separator />

          {/* Cost Formula */}
          <div className="space-y-3">
            <h3 className="font-semibold">Cost Calculation</h3>

            <Card className="p-3 bg-muted/50">
              <code className="text-xs font-mono block whitespace-pre-wrap">
                {`Cost = Base × (1 - Discount) × Rarity × Distance × Usage × Density

Where:
• Base = 100 SP (v1.0: 200 SP)
• Discount = 85% → 0% over 5 drifts
• Rarity = 1.0× → 5.0× (linear scaling)
• Distance = +0-30% (per 100km)
• Usage = +0-75% (capped after 5 drifts)
• Density = 1.0× or 1.5×`}
              </code>
            </Card>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <span className="font-medium">Example 1:</span> First drift,
                Rare node @ 50km, Void Zone
              </p>
              <p className="text-xs pl-4">
                = 100 × 0.15 × 2.0 × 1.15 × 1.0 × 1.0 ={" "}
                <span className="font-semibold text-foreground">~35 SP</span>
              </p>

              <p className="mt-2">
                <span className="font-medium">Example 2:</span> 10th drift,
                Legendary @ 100km, Sparse Zone
              </p>
              <p className="text-xs pl-4">
                = 100 × 1.0 × 5.0 × 1.3 × 1.75 × 1.0 ={" "}
                <span className="font-semibold text-foreground">~1,138 SP</span>
              </p>
            </div>
          </div>

          <Separator />

          {/* Cooldown & Grace Period */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Cooldown & Grace Period
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="p-3 space-y-1">
                <p className="text-sm font-medium">Drift Cooldown</p>
                <p className="text-2xl font-bold text-primary">48 hours</p>
                <p className="text-xs text-muted-foreground">
                  You can drift 3 times per week (was 2× in v1.0)
                </p>
              </Card>

              <Card className="p-3 space-y-1">
                <p className="text-sm font-medium">Grace Period</p>
                <p className="text-2xl font-bold text-primary">7 days</p>
                <p className="text-xs text-muted-foreground">
                  Time to tune your drifted node before others can re-drift it
                </p>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Strategy Tips */}
          <div className="space-y-3">
            <h3 className="font-semibold">Strategy Tips</h3>

            <div className="space-y-2">
              <StrategyTip
                tip="Use your 5 discounted drifts wisely — target Rare+ nodes for maximum value"
                emoji="💡"
              />

              <StrategyTip
                tip="Drifted nodes land 2-8km away — be prepared to travel to reach them"
                emoji="🗺️"
              />

              <StrategyTip
                tip="Stabilize nodes permanently by mining them — this creates content in your area"
                emoji="⚡"
              />

              <StrategyTip
                tip="Check the drift page daily for new opportunities as nodes become inactive"
                emoji="📅"
              />
            </div>
          </div>
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function DensityTierCard({
  tier,
  nodeCount,
  multiplier,
  color,
  description,
}: {
  tier: string;
  nodeCount: string;
  multiplier: string;
  color: "default" | "secondary" | "destructive" | "outline";
  description: string;
}) {
  return (
    <Card className="p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={color}>{tier}</Badge>
            <span className="text-xs text-muted-foreground">
              {nodeCount} within 10km
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold">{multiplier}</p>
          <p className="text-xs text-muted-foreground">cost</p>
        </div>
      </div>
    </Card>
  );
}

function DiscountTierCard({
  drift,
  discount,
  example,
}: {
  drift: number;
  discount: string;
  example: string;
}) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="w-16">
          Drift #{drift}
        </Badge>
        <span className="text-sm font-medium">{discount} off</span>
      </div>
      <span className="text-sm text-muted-foreground">{example} base cost</span>
    </div>
  );
}

function StrategyTip({ tip, emoji }: { tip: string; emoji: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-lg">{emoji}</span>
      <p className="text-muted-foreground leading-relaxed">{tip}</p>
    </div>
  );
}
