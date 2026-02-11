import Link from "next/link";
import { Clock, TrendingUp, Users, Zap, Award, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function FOMOSection() {
  return (
    <section className="py-12 md:py-20 lg:py-32 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-1/4 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">
          {/* Section header */}
          <div className="text-center space-y-3 md:space-y-4">
            <Badge
              variant="outline"
              className="text-primary border-primary/50 bg-primary/5 animate-pulse text-sm md:text-base"
            >
              <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
              Limited Time Opportunity
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
              Why Pioneer{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Right Now
              </span>
              ?
            </h2>
          </div>

          {/* Benefits grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Early adopter rewards */}
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 group">
              <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Award className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <h3 className="text-base md:text-lg font-bold">
                  Early Pioneer Bonus
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Phase 1 pioneers earn <strong>max Shares</strong> on all
                  mining sessions. This bonus decreases with each subsequent
                  phase.
                </p>
                <div className="flex items-center gap-2 text-xs text-primary">
                  <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="font-medium">Active now</span>
                </div>
              </CardContent>
            </Card>

            {/* Unclaimed nodes */}
            <Card className="border-secondary/20 bg-card/50 backdrop-blur-sm hover:border-secondary/40 transition-all duration-300 group">
              <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-secondary/20 border border-secondary/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-secondary" />
                </div>
                <h3 className="text-base md:text-lg font-bold">
                  Unclaimed Guardians
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  <strong>90% of Echo Guardians</strong> are still awaiting
                  their first Pioneer. Be among the first to claim rare
                  Legendary nodes.
                </p>
                <div className="flex items-center gap-2 text-xs text-secondary">
                  <Users className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="font-medium">Thousands available</span>
                </div>
              </CardContent>
            </Card>

            {/* Phase halving */}
            <Card className="border-accent/20 bg-card/50 backdrop-blur-sm hover:border-accent/40 transition-all duration-300 group sm:col-span-2 lg:col-span-1">
              <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-accent/20 border border-accent/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5 md:w-6 md:h-6 text-accent" />
                </div>
                <h3 className="text-base md:text-lg font-bold">
                  Halving Mechanics
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Share rewards halve with each Harmonic Awakening phase. Mining
                  now yields <strong>2x more</strong> than the next Phase offer.
                </p>
                <div className="flex items-center gap-2 text-xs text-accent">
                  <Clock className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="font-medium">Next halving approaching</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress indicator */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <h3 className="text-base md:text-lg font-bold">
                    Phase 1: The Lattice Awakens
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Community progress toward Phase 2 activation
                  </p>
                  {/* Progress bar */}
                  <div className="w-full bg-muted rounded-full h-2 md:h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000"
                      style={{ width: "1%" }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    1% complete • Estimated 2-3 months remaining
                  </p>
                </div>

                <Button
                  asChild
                  size="lg"
                  className="w-full md:w-auto bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                >
                  <Link href="/login">Join Now</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Final urgency message */}
          <div className="text-center space-y-3 md:space-y-4">
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              The Lattice rewards those who resonate early. Each day you wait,
              the opportunity diminishes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-xs md:text-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-muted-foreground">
                  32 pioneers joined today
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="text-muted-foreground">
                  18 nodes claimed this week
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
