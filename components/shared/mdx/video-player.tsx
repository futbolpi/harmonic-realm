"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Play, Clock, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const ReactPlayer = dynamic(() => import("react-player"), {
  ssr: false,
  loading: () => (
    <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted flex items-center justify-center">
      <Skeleton className="w-full h-full" />
    </div>
  ),
});

interface VideoPlayerProps {
  url: string;
  title?: string;
  description?: string;
  duration?: string;
  className?: string;
}

export function VideoPlayer({
  url,
  title,
  description,
  duration,
  className,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  return (
    <div className={cn("my-8 space-y-4", className)}>
      {(title || duration) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            {title && (
              <p className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                {title}
              </p>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {duration && (
            <Badge
              variant="outline"
              className="border-primary/40 text-primary self-start sm:self-auto shrink-0 flex items-center gap-1.5"
            >
              <Clock className="h-3 w-3" />
              {duration}
            </Badge>
          )}
        </div>
      )}

      <Card className="overflow-hidden border-primary/20 bg-card/50 backdrop-blur-sm shadow-xl shadow-primary/10">
        <div className="relative aspect-video w-full group">
          {!hasStarted && (
            <div
              className="absolute inset-0 z-10 flex flex-col items-center justify-center cursor-pointer bg-linear-to-br from-primary/20 via-background/60 to-secondary/20 backdrop-blur-sm transition-opacity hover:opacity-90 gap-4"
              onClick={() => {
                setHasStarted(true);
                setIsPlaying(true);
              }}
            >
              <button
                className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/90 hover:bg-primary flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg hover:shadow-2xl hover:shadow-primary/40"
                aria-label="Play video"
              >
                <Play className="w-7 h-7 md:w-9 md:h-9 text-primary-foreground ml-1" />
              </button>
              <p className="text-sm text-muted-foreground font-medium">
                Click to begin your journey
              </p>
            </div>
          )}

          <ReactPlayer
            src={url}
            width="100%"
            height="100%"
            playing={isPlaying}
            controls={hasStarted}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            config={{
              youtube: { rel: 0 },
            }}
          />
        </div>
      </Card>
    </div>
  );
}
