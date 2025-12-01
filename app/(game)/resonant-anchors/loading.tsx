import { Skeleton } from "@/components/ui/skeleton";

export default function ResonantAnchorsLoading() {
  return (
    <main className="min-h-screen w-full bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 md:px-6 md:py-6 border-b border-border">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      {/* Map container - takes up most of screen */}
      <div className="flex-1 relative w-full">
        <Skeleton className="w-full h-full min-h-96 md:min-h-[500px] lg:min-h-[600px] rounded-none" />
      </div>

      {/* Bottom panel with form - fixed positioning on mobile */}
      <div className="border-t border-border bg-background/95 backdrop-blur-sm w-full">
        <div className="px-4 py-6 md:px-6 space-y-6">
          {/* Cost breakdown section */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          </div>

          {/* Discount showcase section */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>

          {/* Submit button */}
          <Skeleton className="h-11 w-full rounded-md" />
        </div>
      </div>
    </main>
  );
}
