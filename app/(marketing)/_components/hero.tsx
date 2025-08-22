import Link from "next/link";
import { Compass, Sparkles, ArrowRight, Waves, Eye } from "lucide-react";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Stats from "./stats";
import StatsLoading from "./stats-loading";

export function Hero() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10">
        <div className="grid grid-cols-12 gap-4 h-full animate-pulse">
          {Array.from({ length: 144 }).map((_, i) => (
            <div
              key={i}
              className="w-1 h-1 bg-primary rounded-full animate-ping"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <Badge
            variant="outline"
            className="text-violet-400 border-violet-400/50 animate-pulse bg-violet-500/10"
          >
            ✨ The Lattice Awakens
          </Badge>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Resonate with the{" "}
              <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent animate-pulse">
                Cosmic Lattice
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Join the Pioneers in discovering Echo Guardians, mining Shares
              from the infinite Pi digits, and awakening the Harmonic
              frequencies.
            </p>
          </div>

          <div className="flex justify-center items-center gap-8 py-8">
            <div className="text-center space-y-2 group">
              <div className="w-16 h-16 rounded-full bg-violet-500/20 border border-violet-400/50 flex items-center justify-center mx-auto transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-violet-400/25">
                <Compass
                  className="h-8 w-8 text-violet-400 animate-spin"
                  style={{ animationDuration: "8s" }}
                />
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                Discover
              </p>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground animate-pulse" />
            <div className="text-center space-y-2 group">
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center mx-auto transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-cyan-400/25">
                <Waves className="h-8 w-8 text-cyan-400 animate-bounce" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                Resonate
              </p>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground animate-pulse" />
            <div className="text-center space-y-2 group">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center mx-auto transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-amber-400/25">
                <Sparkles className="h-8 w-8 text-amber-400 animate-pulse" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                Awaken
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="/login">
                Begin Your Journey
                <Eye className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 border-violet-400/50 text-violet-400 hover:bg-violet-500/10 bg-transparent"
            >
              <Link href="/about">Explore the Lore</Link>
            </Button>
          </div>

          <Suspense fallback={<StatsLoading />}>
            <Stats />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
