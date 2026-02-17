"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Play, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamically import ReactPlayer to reduce initial bundle size
const ReactPlayer = dynamic(() => import("react-player"), {
  ssr: false,
  loading: () => (
    <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted flex items-center justify-center">
      <Skeleton className="w-full h-full" />
    </div>
  ),
});

export function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const videoUrl = "https://youtu.be/rlLLAfXdWhk";

  return (
    <section
      id="video"
      className="py-12 md:py-20 lg:py-32 relative overflow-hidden scroll-mt-16"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-linear-to-b from-muted/30 via-background to-muted/30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
          {/* Section header */}
          <div className="text-center space-y-3 md:space-y-4">
            <Badge
              variant="outline"
              className="text-secondary border-secondary/50 bg-secondary/5 text-sm md:text-base"
            >
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
              Enter the Lattice
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
              Experience the{" "}
              <span className="bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Cosmic Journey
              </span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
              Witness the harmonic resonance between Pioneers and Echo Guardians
              across the infinite Lattice.
            </p>
          </div>

          {/* Video player */}
          <Card className="overflow-hidden border-primary/20 bg-card/50 backdrop-blur-sm shadow-2xl">
            <div className="relative aspect-video w-full group">
              {!hasStarted && (
                <div className="absolute inset-0 z-10 bg-linear-to-br from-primary/20 to-secondary/20 backdrop-blur-sm flex items-center justify-center cursor-pointer transition-opacity hover:opacity-90">
                  <button
                    onClick={() => {
                      setHasStarted(true);
                      setIsPlaying(true);
                    }}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/90 hover:bg-primary flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg hover:shadow-2xl"
                    aria-label="Play video"
                  >
                    <Play className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" />
                  </button>
                </div>
              )}

              <ReactPlayer
                src={videoUrl}
                width="100%"
                height="100%"
                playing={isPlaying}
                controls={hasStarted}
                light={!hasStarted}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                config={{
                  youtube: {
                    rel: 0,
                  },
                }}
              />
            </div>
          </Card>

          {/* Video caption */}
          <p className="text-xs md:text-sm text-muted-foreground text-center max-w-3xl mx-auto">
            Discover how Pioneers around the world are exploring the Lattice,
            resonating with Echo Guardians, and unlocking the mysteries hidden
            within Pi&apos;s infinite digits.
          </p>
        </div>
      </div>
    </section>
  );
}
