export default function NodeNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Animated cosmic orb */}
        <div className="relative mx-auto w-32 h-32 mb-8">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
          <div className="absolute inset-2 rounded-full bg-primary/30 animate-ping" />
          <div className="absolute inset-4 rounded-full bg-primary/40 animate-bounce" />
          <div className="absolute inset-6 rounded-full bg-primary/50" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Echo Lost in the Void
          </h1>
          <p className="text-foreground text-lg">
            The cosmic convergence point you seek has drifted beyond the
            Lattice&apos;s reach.
          </p>
          <p className="text-muted-foreground">
            This Echo Guardian node may have been consumed by the cosmic winds
            or never existed in this reality.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <a
            href="/map"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
          >
            Return to Lattice Map
          </a>
          <a
            href="/dashboard"
            className="px-6 py-3 border border-border rounded-lg hover:bg-accent/10 transition-all duration-300"
          >
            Resonance Hub
          </a>
        </div>
      </div>
    </div>
  );
}
