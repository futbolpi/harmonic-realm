import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsLoading() {
  return (
    <div className="w-full max-w-5xl mx-auto pt-8 md:pt-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card
            key={index}
            className="border-border/40 bg-card/50 backdrop-blur-sm"
          >
            <div className="p-3 md:p-4 lg:p-6 text-center space-y-2 md:space-y-3">
              {/* Icon skeleton */}
              <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-full mx-auto" />

              {/* Value skeleton */}
              <Skeleton className="h-8 sm:h-10 md:h-12 lg:h-14 w-20 sm:w-24 md:w-28 mx-auto" />

              {/* Label skeleton */}
              <Skeleton className="h-3 md:h-4 w-16 sm:w-20 md:w-24 mx-auto" />
            </div>
          </Card>
        ))}
      </div>

      {/* Additional context skeleton */}
      <div className="text-center pt-4 md:pt-6">
        <Skeleton className="h-3 md:h-4 w-48 md:w-56 mx-auto" />
      </div>
    </div>
  );
}
