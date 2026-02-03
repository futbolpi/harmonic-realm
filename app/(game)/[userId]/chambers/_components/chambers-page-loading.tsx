import { Skeleton } from "@/components/ui/skeleton";

export function ChambersPageLoading() {
  return (
    <div className="h-full w-full relative bg-muted animate-pulse">
      {/* Top Controls Skeleton */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-full" /> {/* User location */}
          <Skeleton className="h-9 w-9 rounded-full" /> {/* Create chamber */}
          <Skeleton className="h-9 w-9 rounded-full" /> {/* Map link */}
        </div>
        <Skeleton className="h-6 w-16 rounded-full" /> {/* Chamber count */}
      </div>

      {/* Map Loading Area */}
      <div className="absolute inset-0 bg-muted/50">
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <Skeleton className="h-16 w-16 rounded-full mx-auto" />
            <Skeleton className="h-4 w-48 mx-auto" />
            <Skeleton className="h-3 w-32 mx-auto" />
          </div>
        </div>
      </div>

      {/* Bottom Controls Skeleton */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex gap-2">
        <Skeleton className="flex-1 h-10 rounded-md" /> {/* Chambers list */}
      </div>

      {/* Floating chamber markers simulation */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton
            key={i}
            className="absolute w-10 h-10 rounded-full"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${10 + Math.random() * 80}%`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
