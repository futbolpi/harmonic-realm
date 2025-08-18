import Link from "next/link";
import { ArrowRight, Compass, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function CTA() {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-neon-green/10" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />

      {/* Floating cosmic orbs */}
      <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-neon-purple/30 rounded-full animate-float" />
      <div className="absolute top-3/4 right-1/4 w-6 h-6 bg-neon-green/20 rounded-full animate-float-delayed" />
      <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-primary/40 rounded-full animate-pulse" />

      <div className="container mx-auto px-4 relative">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <Badge
            variant="outline"
            className="text-primary border-primary/50 animate-pulse-neon"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Join the Lattice
          </Badge>

          <h2 className="text-3xl md:text-5xl font-bold">
            Ready to Begin Your{" "}
            <span className="neon-text">Pioneer Journey</span>?
          </h2>

          <p className="text-xl text-muted-foreground">
            Join thousands of Pioneers who are already resonating with the
            cosmic Lattice, discovering Echo Guardians, and earning Shares
            through harmonic exploration.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              asChild
              size="lg"
              className="game-button text-lg px-8 py-6 group"
            >
              <Link href="/login">
                Begin Resonance
                <Compass className="ml-2 h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 bg-transparent"
            >
              <Link href="/about">
                Explore the Lore
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="pt-8 space-y-4">
            <p className="text-sm text-muted-foreground">
              🔮 Cosmic Lattice Integration • 🌍 Global Echo Network • ⚡
              Harmonic Rewards
            </p>
            <p className="text-xs text-muted-foreground">
              Requires Pi Browser or Pi Network mobile app to access the Lattice
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
