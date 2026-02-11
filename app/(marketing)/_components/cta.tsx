import Link from "next/link";
import { ArrowRight, Compass, Sparkles, BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function CTA() {
  return (
    <section className="py-12 md:py-20 lg:py-32 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />

      {/* Floating cosmic elements */}
      <div
        className="absolute top-1/4 left-1/4 w-3 h-3 md:w-4 md:h-4 bg-primary/40 rounded-full animate-pulse"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="absolute top-3/4 right-1/4 w-4 h-4 md:w-6 md:h-6 bg-secondary/30 rounded-full animate-pulse"
        style={{ animationDelay: "0.5s" }}
      />
      <div
        className="absolute bottom-1/4 left-1/3 w-2 h-2 md:w-3 md:h-3 bg-accent/50 rounded-full animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <Card className="border-primary/20 bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm shadow-2xl overflow-hidden">
            <div className="p-6 md:p-8 lg:p-12 space-y-6 md:space-y-8 text-center">
              {/* Badge */}
              <Badge
                variant="outline"
                className="text-primary border-primary/50 bg-primary/5 animate-pulse text-sm md:text-base"
              >
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                Join the Cosmic Revolution
              </Badge>

              {/* Headline */}
              <div className="space-y-3 md:space-y-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  Your Journey Through the{" "}
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Infinite Lattice
                  </span>
                  <br />
                  Begins Today
                </h2>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
                  Join thousands of Pioneers who are already discovering Echo
                  Guardians, mining Shares, and unlocking the cosmic mysteries
                  hidden in Pi&apos;s infinite digits.
                </p>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center pt-2 md:pt-4">
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white text-base md:text-lg px-6 md:px-8 py-5 md:py-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <Link href="/login">
                    Begin Resonance Now
                    <Compass className="ml-2 h-4 w-4 md:h-5 md:w-5 group-hover:rotate-180 transition-transform duration-500" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-5 md:py-6 border-primary/50 text-primary hover:bg-primary/5 bg-transparent group"
                >
                  <Link href="/about">
                    <BookOpen className="mr-2 h-4 w-4 md:h-5 md:w-5 group-hover:scale-110 transition-transform" />
                    Explore the Lore
                  </Link>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="pt-4 md:pt-6 space-y-3 md:space-y-4">
                <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-xs md:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span>Free to start</span>
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                    <span>Instant Pi rewards</span>
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span>Global community</span>
                  </div>
                </div>

                <p className="text-xs md:text-sm text-muted-foreground">
                  🌍 Available worldwide • 🔐 Secured by Pi Network • ⚡ Play on
                  any device
                </p>

                <p className="text-xs text-muted-foreground/80 max-w-xl mx-auto">
                  Requires Pi Browser or Pi Network mobile app. New to Pi?{" "}
                  <Link
                    href="https://minepi.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Learn more →
                  </Link>
                </p>
              </div>

              {/* Urgency message */}
              <div className="pt-4 md:pt-6 border-t border-border/40">
                <p className="text-xs md:text-sm text-muted-foreground max-w-2xl mx-auto">
                  <strong className="text-foreground">
                    Limited Phase 1 Bonuses:
                  </strong>{" "}
                  Early pioneers earn 2x Share multipliers. Rewards decrease
                  with each phase transition.
                </p>
              </div>
            </div>
          </Card>

          {/* Secondary CTA links */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 pt-6 md:pt-8 text-xs md:text-sm">
            <Link
              href="/contact"
              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              Contact Support
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
            </Link>
            <span className="text-muted-foreground/50">•</span>
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              Privacy Policy
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
            </Link>
            <span className="text-muted-foreground/50">•</span>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              Terms of Service
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
