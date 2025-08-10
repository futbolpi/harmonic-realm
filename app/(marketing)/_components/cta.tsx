import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function CTA() {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-neon-green/10" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <Badge
            variant="outline"
            className="text-primary border-primary/50 animate-pulse-neon"
          >
            Join the Revolution
          </Badge>

          <h2 className="text-3xl md:text-5xl font-bold">
            Ready to Start Your{" "}
            <span className="neon-text">Mining Adventure</span>?
          </h2>

          <p className="text-xl text-muted-foreground">
            Join thousands of pioneers who are already exploring, mining, and
            earning Pi through our innovative location-based game.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
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
              <Link href="/about">
                Learn More
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="pt-8 space-y-4">
            <p className="text-sm text-muted-foreground">
              🔒 Secure Pi Network Integration • 🌍 Global Mining Network • 🏆
              Real Rewards
            </p>
            <p className="text-xs text-muted-foreground">
              Requires Pi Browser or Pi Network mobile app
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
