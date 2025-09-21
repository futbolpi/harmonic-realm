import { Skeleton } from "@/components/ui/skeleton";

export default function MapLoading() {
  return (
    <div className="h-screen w-full relative bg-muted animate-pulse">
      {/* Mobile-first loading for full-screen map */}

      {/* Top Controls Skeleton */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
        <Skeleton className="h-9 w-9 rounded-md" /> {/* Location button */}
        <Skeleton className="h-6 w-20 rounded-full" /> {/* Node count badge */}
      </div>

      {/* Map Loading Area - takes most of screen */}
      <div className="absolute inset-0 bg-muted/50">
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <Skeleton className="h-16 w-16 rounded-full mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-3 w-24 mx-auto" />
          </div>
        </div>
      </div>

      {/* Bottom Controls Skeleton - Mobile */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex gap-2 md:hidden">
        <Skeleton className="flex-1 h-12 rounded-md" /> {/* Filters button */}
        <Skeleton className="flex-1 h-12 rounded-md" />{" "}
        {/* Nodes list button */}
      </div>

      {/* Desktop Controls Skeleton */}
      <div className="hidden md:flex absolute bottom-4 right-4 z-10 gap-2">
        <Skeleton className="h-10 w-24 rounded-md" /> {/* Controls button */}
        <Skeleton className="h-10 w-32 rounded-md" /> {/* Nodes button */}
      </div>

      {/* Floating node markers simulation */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton
            key={i}
            className="absolute w-8 h-8 md:w-10 md:h-10 rounded-full"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${10 + Math.random() * 80}%`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
