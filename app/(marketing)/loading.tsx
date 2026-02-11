import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePageLoading() {
  return (
    <div className="w-full">
      {/* Hero Section Skeleton */}
      <section className="relative min-h-[90vh] flex items-center justify-center py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center space-y-6 md:space-y-8 max-w-5xl mx-auto">
            <Skeleton className="h-6 md:h-8 w-48 md:w-64 mx-auto" />
            <div className="space-y-3 md:space-y-4">
              <Skeleton className="h-12 sm:h-16 md:h-20 lg:h-24 w-full max-w-4xl mx-auto" />
              <Skeleton className="h-6 md:h-8 w-full max-w-3xl mx-auto" />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              <Skeleton className="h-4 md:h-5 w-32 md:w-40" />
              <Skeleton className="h-4 md:h-5 w-32 md:w-40" />
              <Skeleton className="h-4 md:h-5 w-32 md:w-40" />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Skeleton className="h-12 md:h-14 w-full sm:w-48 md:w-56" />
              <Skeleton className="h-12 md:h-14 w-full sm:w-40 md:w-48" />
            </div>

            {/* Stats skeleton */}
            <div className="w-full max-w-5xl mx-auto pt-8 md:pt-12">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Card
                    key={index}
                    className="border-border/40 bg-card/50 backdrop-blur-sm"
                  >
                    <div className="p-3 md:p-4 lg:p-6 text-center space-y-2 md:space-y-3">
                      <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-full mx-auto" />
                      <Skeleton className="h-8 sm:h-10 md:h-12 lg:h-14 w-20 sm:w-24 md:w-28 mx-auto" />
                      <Skeleton className="h-3 md:h-4 w-16 sm:w-20 md:w-24 mx-auto" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Skeleton className="h-4 w-64 md:w-80 mx-auto" />
          </div>
        </div>
      </section>

      {/* Video Section Skeleton */}
      <section className="py-12 md:py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
            <div className="text-center space-y-3 md:space-y-4">
              <Skeleton className="h-6 md:h-8 w-32 md:w-40 mx-auto" />
              <Skeleton className="h-10 md:h-14 w-full max-w-2xl mx-auto" />
              <Skeleton className="h-6 w-full max-w-xl mx-auto" />
            </div>
            <Card className="overflow-hidden">
              <Skeleton className="aspect-video w-full" />
            </Card>
            <Skeleton className="h-4 w-full max-w-3xl mx-auto" />
          </div>
        </div>
      </section>

      {/* Features Section Skeleton */}
      <section className="py-12 md:py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="space-y-8 md:space-y-12">
            <div className="text-center space-y-3 md:space-y-4 max-w-3xl mx-auto">
              <Skeleton className="h-6 md:h-8 w-32 md:w-40 mx-auto" />
              <Skeleton className="h-10 md:h-14 w-full max-w-2xl mx-auto" />
              <Skeleton className="h-6 w-full max-w-xl mx-auto" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="bg-card/50">
                  <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4 text-center">
                    <Skeleton className="w-12 h-12 md:w-16 md:h-16 rounded-full mx-auto" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 md:h-6 w-32 md:w-40 mx-auto" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4 mx-auto" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section Skeleton */}
      <section className="py-12 md:py-20 lg:py-32 bg-gradient-to-b from-transparent via-muted/10 to-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 mb-16">
            <Skeleton className="h-6 md:h-8 w-40 md:w-48 mx-auto" />
            <Skeleton className="h-10 md:h-14 w-full max-w-2xl mx-auto" />
            <Skeleton className="h-6 w-full max-w-xl mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-card/50">
                <CardContent className="p-6 text-center space-y-4">
                  <Skeleton className="h-10 w-20 mx-auto" />
                  <Skeleton className="w-16 h-16 rounded-full mx-auto" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-40 mx-auto" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FOMO Section Skeleton */}
      <section className="py-12 md:py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">
            <div className="text-center space-y-3 md:space-y-4">
              <Skeleton className="h-6 md:h-8 w-48 md:w-56 mx-auto" />
              <Skeleton className="h-10 md:h-14 w-full max-w-2xl mx-auto" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="bg-card/50">
                  <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                    <Skeleton className="w-10 h-10 md:w-12 md:h-12 rounded-full" />
                    <Skeleton className="h-6 w-40 md:w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section Skeleton */}
      <section className="py-12 md:py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-card/80">
              <div className="p-6 md:p-8 lg:p-12 space-y-6 md:space-y-8 text-center">
                <Skeleton className="h-6 md:h-8 w-48 md:w-56 mx-auto" />
                <div className="space-y-3 md:space-y-4">
                  <Skeleton className="h-10 md:h-14 w-full max-w-2xl mx-auto" />
                  <Skeleton className="h-6 w-full max-w-xl mx-auto" />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                  <Skeleton className="h-12 md:h-14 w-full sm:w-48 md:w-56" />
                  <Skeleton className="h-12 md:h-14 w-full sm:w-40 md:w-48" />
                </div>
                <div className="space-y-3 md:space-y-4">
                  <Skeleton className="h-4 w-64 md:w-80 mx-auto" />
                  <Skeleton className="h-4 w-48 md:w-64 mx-auto" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
