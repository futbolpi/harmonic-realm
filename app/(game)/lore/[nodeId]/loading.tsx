export default function Loading() {
  return (
    <div className="min-h-screen bg-[--background]">
      <div className="h-64 animate-pulse bg-[--muted]" /> {/* Hero skeleton */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="h-96 animate-pulse bg-[--muted]" />{" "}
        {/* Lore skeleton */}
        <div className="h-48 animate-pulse bg-[--muted]" />{" "}
        {/* Staking skeleton */}
      </div>
    </div>
  );
}
