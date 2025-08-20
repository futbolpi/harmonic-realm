export default function EchoJournalNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Animated journal pages */}
        <div className="relative mx-auto w-32 h-32 mb-8">
          <div className="absolute inset-0 bg-accent/20 rounded-lg transform rotate-12 animate-pulse" />
          <div className="absolute inset-2 bg-accent/30 rounded-lg transform rotate-6 animate-bounce" />
          <div className="absolute inset-4 bg-accent/40 rounded-lg transform -rotate-3" />
          <div className="absolute inset-6 bg-accent/50 rounded-lg" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
            Pioneer&apos;s Echo Uncharted
          </h1>
          <p className="text-foreground text-lg">
            This Pioneer&apos;s journey through the Lattice remains unrecorded
            in the cosmic archives.
          </p>
          <p className="text-muted-foreground">
            Their harmonic resonance may be too faint to detect, or they have
            yet to begin their exploration.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <a
            href="/leaderboard"
            className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-all duration-300 transform hover:scale-105"
          >
            Pioneer Leaderboard
          </a>
          <a
            href="/dashboard"
            className="px-6 py-3 border border-border rounded-lg hover:bg-accent/10 transition-all duration-300"
          >
            Your Resonance Hub
          </a>
        </div>
      </div>
    </div>
  );
}
