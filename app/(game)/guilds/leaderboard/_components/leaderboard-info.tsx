"use client";

import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Credenza,
  CredenzaTrigger,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaDescription,
  CredenzaBody,
} from "@/components/credenza";

export function LeaderboardInfo() {
  return (
    <Credenza>
      <CredenzaTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Info className="h-4 w-4" />
          Info
        </Button>
      </CredenzaTrigger>
      <CredenzaContent className="max-w-2xl">
        <CredenzaHeader>
          <CredenzaTitle>Guild Leaderboard Guide</CredenzaTitle>
          <CredenzaDescription>
            Understand how guilds compete for cosmic supremacy
          </CredenzaDescription>
        </CredenzaHeader>

        <CredenzaBody className="space-y-6 py-4 max-h-[80vh] overflow-y-auto">
          {/* Prestige */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              ⭐ Prestige Leaderboard
            </h3>
            <p className="text-sm text-muted-foreground">
              Ranks guilds by total Prestige Points earned through challenges,
              territory victories, member milestones, and vault upgrades. This
              measures long-term guild growth and achievement.
            </p>
            <div className="pl-4 space-y-1">
              <p className="text-xs text-muted-foreground">
                • Challenge completions: High prestige
              </p>
              <p className="text-xs text-muted-foreground">
                • Territory victories: Medium prestige
              </p>
              <p className="text-xs text-muted-foreground">
                • Member milestones: Moderate prestige
              </p>
              <p className="text-xs text-muted-foreground">
                • Vault upgrades: Variable prestige
              </p>
            </div>
          </div>

          {/* Activity */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              ⚡ Activity Leaderboard
            </h3>
            <p className="text-sm text-muted-foreground">
              Ranks guilds by weekly SharePoints earned collectively by all
              members. Measures active participation and engagement in mining
              and tuning activities.
            </p>
            <div className="pl-4 space-y-1">
              <p className="text-xs text-muted-foreground">
                • Resets weekly for fresh competition
              </p>
              <p className="text-xs text-muted-foreground">
                • Rewards consistent member engagement
              </p>
              <p className="text-xs text-muted-foreground">
                • Best for guilds focused on daily activity
              </p>
            </div>
          </div>

          {/* Vault */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              💎 Vault Leaderboard
            </h3>
            <p className="text-sm text-muted-foreground">
              Ranks guilds by total RESONANCE ever deposited into their vault.
              Measures economic strength and member contributions over time.
            </p>
            <div className="pl-4 space-y-1">
              <p className="text-xs text-muted-foreground">
                • Reflects cumulative wealth
              </p>
              <p className="text-xs text-muted-foreground">
                • Shows member generosity
              </p>
              <p className="text-xs text-muted-foreground">
                • Indicates financial stability
              </p>
            </div>
          </div>

          {/* Territories */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              🗺️ Territories Leaderboard
            </h3>
            <p className="text-sm text-muted-foreground">
              Ranks guilds by number of controlled territory zones. Measures
              territorial dominance and strategic conquest ability.
            </p>
            <div className="pl-4 space-y-1">
              <p className="text-xs text-muted-foreground">
                • Control expires after 7 days
              </p>
              <p className="text-xs text-muted-foreground">
                • Must defend against challengers
              </p>
              <p className="text-xs text-muted-foreground">
                • Strategic positioning matters
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
            <h4 className="font-semibold text-sm">Pro Tips</h4>
            <ul className="space-y-1">
              <li className="text-xs text-muted-foreground">
                • Rankings update in real-time as guilds complete activities
              </li>
              <li className="text-xs text-muted-foreground">
                • Your guild is highlighted when you&apos;re a member
              </li>
              <li className="text-xs text-muted-foreground">
                • Top 3 guilds receive special recognition and visibility
              </li>
              <li className="text-xs text-muted-foreground">
                • Use filters to focus on different time ranges
              </li>
            </ul>
          </div>
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  );
}
