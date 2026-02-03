import { Skeleton } from "@/components/ui/skeleton";

export function ChambersPageLoading() {
  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Map Area Skeleton */}
      <div className="flex-1 relative bg-muted/50 overflow-hidden">
        {/* Top-left Controls */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <Skeleton className="h-10 w-10 rounded-lg" /> {/* Navigate */}
          <Skeleton className="h-10 w-10 rounded-lg" /> {/* Create */}
        </div>

        {/* Top-right Badge */}
        <div className="absolute top-4 right-4 z-10">
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>

        {/* Map gradient background placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/80 to-muted/60" />

        {/* Animated Chamber Markers */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                top: `${25 + (i % 2) * 40}%`,
                left: `${20 + i * 25}%`,
                animationDelay: `${i * 150}ms`,
              }}
            >
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Controls Skeleton */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4 space-y-3">
        <Skeleton className="h-9 w-32 rounded-md" />
        <div className="flex gap-2">
          <Skeleton className="flex-1 h-12 rounded-md" />
          <Skeleton className="h-12 w-12 rounded-md" />
        </div>
      </div>
    </div>
  );
}
