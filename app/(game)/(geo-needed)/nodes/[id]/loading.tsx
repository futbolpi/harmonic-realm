export default function NodeDetailLoading() {
  return (
    <div className="h-screen bg-background">
      {/* Back button skeleton */}
      <div className="absolute top-4 left-4 z-10">
        <div className="h-9 w-20 bg-muted rounded-md animate-pulse" />
      </div>

      {/* Map skeleton */}
      <div className="h-full w-full bg-muted animate-pulse" />

      {/* Floating controls skeleton */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <div className="h-10 w-10 bg-muted rounded-md animate-pulse" />
        <div className="h-10 w-10 bg-muted rounded-md animate-pulse" />
      </div>

      {/* Status badge skeleton */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
      </div>

      {/* Node info button skeleton */}
      <div className="absolute bottom-4 left-4">
        <div className="h-9 w-24 bg-muted rounded-md animate-pulse" />
      </div>
    </div>
  );
}
