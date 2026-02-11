import Link from "next/link";
import { Compass, Play, TrendingUp, Users, Zap } from "lucide-react";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Stats from "./stats";
import StatsLoading from "./stats-loading";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center py-12 md:py-20 overflow-hidden">
      {/* Animated cosmic background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />

      {/* Floating orbs - cosmic ambiance */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-1/4 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl"
        aria-hidden="true"
      >
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center space-y-6 md:space-y-8 max-w-5xl mx-auto">
          {/* Trust badge */}
          <Badge
            variant="outline"
            className="text-primary border-primary/50 animate-pulse bg-primary/5 text-sm md:text-base"
          >
            <TrendingUp className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
            Phase 1: The Lattice Awakens
          </Badge>

          {/* Main headline - conversion focused */}
          <div className="space-y-3 md:space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
              Discover Echo Guardians.
              <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-pulse bg-[length:200%_auto]">
                Earn Real Rewards.
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Join thousands of Pioneers exploring the world, resonating with
              the cosmic Lattice, and mining Shares from Pi&apos;s infinite
              digits. Your journey begins now.
            </p>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 md:gap-2">
              <Users className="w-3 h-3 md:w-4 md:h-4 text-primary" />
              <span>2,000+ Active Pioneers</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <Zap className="w-3 h-3 md:w-4 md:h-4 text-secondary" />
              <span>Powered by Pi Network</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <Compass className="w-3 h-3 md:w-4 md:h-4 text-accent" />
              <span>Global Lattice</span>
            </div>
          </div>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center pt-4 md:pt-6">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white text-base md:text-lg px-6 md:px-8 py-5 md:py-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <Link href="/login">
                Begin Your Journey
                <Compass className="ml-2 h-4 w-4 md:h-5 md:w-5 group-hover:rotate-180 transition-transform duration-500" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-5 md:py-6 border-primary/50 text-primary hover:bg-primary/5 bg-transparent group"
            >
              <Link href="#video">
                <Play className="mr-2 h-4 w-4 md:h-5 md:w-5 group-hover:scale-110 transition-transform" />
                Watch Trailer
              </Link>
            </Button>
          </div>

          {/* Live stats section */}
          <Suspense fallback={<StatsLoading />}>
            <Stats />
          </Suspense>

          {/* Social proof tagline */}
          <p className="text-xs md:text-sm text-muted-foreground pt-4 md:pt-6 max-w-2xl mx-auto">
            🌍 Available worldwide • ⚡ Instant Pi rewards • 🔮 Backed by
            mathematical infinity
          </p>
        </div>
      </div>
    </section>
  );
}
