export default function EchoJournalLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-game-primary/5">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-8 bg-muted rounded animate-pulse" />
              <div className="w-32 h-8 bg-muted rounded animate-pulse" />
            </div>
            <div className="w-24 h-6 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Stats Panel Skeleton */}
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Level Progress Card */}
          <div className="h-32 bg-muted rounded-lg animate-pulse" />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container mx-auto px-4 pb-8">
        <div className="space-y-6">
          {/* Tabs */}
          <div className="h-12 bg-muted rounded-lg animate-pulse" />

          {/* Content Area */}
          <div className="h-96 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}
