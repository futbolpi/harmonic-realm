import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MarketingLoading() {
  return (
    <div className="space-y-20">
      {/* Hero Section Skeleton */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <Skeleton className="h-6 w-48 mx-auto" />
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-6 w-3/4 mx-auto" />
            </div>
            <div className="flex justify-center items-center gap-8 py-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="text-center space-y-2">
                  <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-12 w-32" />
            </div>
            <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section Skeleton */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 mb-16">
            <Skeleton className="h-6 w-32 mx-auto" />
            <Skeleton className="h-12 w-96 mx-auto" />
            <Skeleton className="h-6 w-80 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="game-card">
                <CardHeader className="text-center space-y-4">
                  <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                  <Skeleton className="h-5 w-24 mx-auto" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section Skeleton */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 mb-16">
            <Skeleton className="h-6 w-32 mx-auto" />
            <Skeleton className="h-12 w-80 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="game-card">
                <CardContent className="p-6 text-center space-y-4">
                  <Skeleton className="h-8 w-8 mx-auto" />
                  <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24 mx-auto" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section Skeleton */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-8 max-w-3xl mx-auto">
            <Skeleton className="h-6 w-40 mx-auto" />
            <Skeleton className="h-12 w-96 mx-auto" />
            <Skeleton className="h-6 w-80 mx-auto" />
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-12 w-32" />
            </div>
            <div className="pt-8 space-y-4">
              <Skeleton className="h-4 w-96 mx-auto" />
              <Skeleton className="h-3 w-64 mx-auto" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
