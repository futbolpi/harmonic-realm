"use client";

import { Zap, Award, TrendingUp } from "lucide-react";
import Decimal from "decimal.js";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  calculateMaxDiscountLevels,
  calculateDiscountedCost,
  getNextDiscountTier,
  calculatePointsBurned,
} from "@/lib/anchors/discount-calculator";

interface DiscountShowcaseProps {
  baseCost: Decimal | string | number;
  userReferralPoints: number;
  userFidelity: number;
  onDiscountLevelsChange: (levels: number) => void;
  selectedDiscountLevels: number;
}

export default function DiscountShowcase({
  baseCost,
  userReferralPoints,
  userFidelity,
  onDiscountLevelsChange,
  selectedDiscountLevels,
}: DiscountShowcaseProps) {
  const maxLevels = calculateMaxDiscountLevels(
    userReferralPoints,
    userFidelity
  );
  const nextTier = getNextDiscountTier(userFidelity);
  const pointsBurned = calculatePointsBurned(
    userFidelity,
    selectedDiscountLevels
  );

  // Calculate costs for each discount level
  const discountResults = [];

  for (let i = 0; i <= maxLevels; i++) {
    const result = calculateDiscountedCost(baseCost, i);
    if (result) {
      discountResults.push({
        level: i,
        cost: result.cost,
        savings: new Decimal(baseCost).minus(result.cost),
        pointsRequired: calculatePointsBurned(userFidelity, i),
      });
    }
  }

  const progressPercentage =
    (userReferralPoints / nextTier.cumulativePoints) * 100;

  return (
    <div className="space-y-4">
      {/* Social Capital Status Card */}
      <Card className="border-primary/50 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                <Award className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Your Social Capital</CardTitle>
                <CardDescription className="text-xs">
                  Resonance Fidelity
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {userReferralPoints}
              </p>
              <p className="text-xs text-muted-foreground">points</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Fidelity Level */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Fidelity Level</span>
              <Badge variant="secondary">{userFidelity}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              You&apos;ve used {userFidelity} discount
              {userFidelity !== 1 ? "s" : ""} in the Lattice
            </p>
          </div>

          {/* Progress to Next Discount */}
          {maxLevels < 1 ? (
            <div className="space-y-2 rounded-lg bg-destructive/10 p-2.5">
              <p className="text-xs font-medium text-destructive">
                Need {nextTier.pointsCost} more points for next discount tier
              </p>
              <Progress value={progressPercentage} className="h-1" />
              <p className="text-xs text-muted-foreground">
                {userReferralPoints} / {nextTier.cumulativePoints} points
              </p>
            </div>
          ) : (
            <div className="space-y-2 rounded-lg bg-accent/10 p-2.5">
              <p className="text-xs font-medium text-accent">
                ✨ You can unlock {maxLevels} discount tier
                {maxLevels !== 1 ? "s" : ""}!
              </p>
              <p className="text-xs text-muted-foreground">
                Slide below to apply and see your savings
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discount Slider & Preview */}
      {maxLevels > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Apply Resonance Discount
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Discount Depth</label>
                <Badge variant="outline">
                  {selectedDiscountLevels} tier
                  {selectedDiscountLevels !== 1 ? "s" : ""}
                </Badge>
              </div>

              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max={maxLevels}
                  value={selectedDiscountLevels}
                  onChange={(e) =>
                    onDiscountLevelsChange(Number.parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>No Discount</span>
                  <span>Max Discount</span>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            {selectedDiscountLevels > 0 &&
              discountResults[selectedDiscountLevels] && (
                <div className="space-y-3 rounded-lg bg-muted/50 p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Original Cost
                      </span>
                      <span className="text-sm line-through text-muted-foreground">
                        {baseCost.toString()} π
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        Discounted Cost
                      </span>
                      <span className="text-lg font-bold text-primary">
                        {discountResults[
                          selectedDiscountLevels
                        ].cost.toString()}{" "}
                        π
                      </span>
                    </div>
                    <div className="border-t border-border pt-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-green-600">
                        You Save
                      </span>
                      <span className="text-sm font-bold text-green-600">
                        {discountResults[
                          selectedDiscountLevels
                        ].savings.toString()}{" "}
                        π
                      </span>
                    </div>
                  </div>

                  {/* Points Cost */}
                  <div className="rounded-lg bg-primary/10 p-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium">
                        Points to Spend
                      </span>
                    </div>
                    <span className="font-semibold text-primary">
                      {pointsBurned}
                    </span>
                  </div>
                </div>
              )}

            {/* Next Tier Info */}
            <div className="rounded-lg bg-secondary/50 p-2.5 text-xs">
              <p className="text-muted-foreground">
                Next tier requires{" "}
                <span className="font-semibold text-foreground">
                  {nextTier.pointsCost}
                </span>{" "}
                points (total:{" "}
                <span className="font-semibold">
                  {nextTier.cumulativePoints}
                </span>
                )
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Discount Available */}
      {maxLevels === 0 && userReferralPoints > 0 && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="pt-6">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              💡 Earn more referral points to unlock discount tiers. First tier
              needs {nextTier.pointsCost} points total.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
