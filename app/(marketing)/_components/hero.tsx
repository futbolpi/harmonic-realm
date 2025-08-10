import Link from "next/link";
import { MapPin, Zap, Coins, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-neon-purple/5" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-neon-green/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Badge */}
          <Badge
            variant="outline"
            className="text-primary border-primary/50 animate-pulse-neon"
          >
            🚀 Now Live on Pi Network
          </Badge>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Turn <span className="neon-text">Exploration</span> into{" "}
              <span className="neon-text">Pi Mining</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Discover real-world nodes, mine Pi cryptocurrency, and earn
              rewards through location-based gameplay.
            </p>
          </div>

          {/* Feature Icons */}
          <div className="flex justify-center items-center gap-8 py-8">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center mx-auto glow-border">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Explore</p>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-neon-green/20 border border-neon-green/50 flex items-center justify-center mx-auto glow-border">
                <Zap className="h-6 w-6 text-neon-green" />
              </div>
              <p className="text-sm text-muted-foreground">Mine</p>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-neon-orange/20 border border-neon-orange/50 flex items-center justify-center mx-auto glow-border">
                <Coins className="h-6 w-6 text-neon-orange" />
              </div>
              <p className="text-sm text-muted-foreground">Earn</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="game-button text-lg px-8 py-6">
              <Link href="/login">
                Start Mining Now
                <Zap className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6"
            >
              <Link href="/about">Learn More</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">
                1000+
              </div>
              <p className="text-sm text-muted-foreground">Active Miners</p>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-neon-green">
                500+
              </div>
              <p className="text-sm text-muted-foreground">Mining Nodes</p>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-neon-orange">
                π 10K+
              </div>
              <p className="text-sm text-muted-foreground">Pi Distributed</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
