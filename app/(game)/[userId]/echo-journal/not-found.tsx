export default function EchoJournalNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-background to-slate-900 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Animated journal pages */}
        <div className="relative mx-auto w-32 h-32 mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg transform rotate-12 animate-pulse" />
          <div className="absolute inset-2 bg-gradient-to-r from-amber-400/30 to-orange-400/30 rounded-lg transform rotate-6 animate-bounce" />
          <div className="absolute inset-4 bg-gradient-to-r from-amber-300/40 to-orange-300/40 rounded-lg transform -rotate-3" />
          <div className="absolute inset-6 bg-gradient-to-r from-amber-200/50 to-orange-200/50 rounded-lg" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            Pioneer&apos;s Echo Uncharted
          </h1>
          <p className="text-slate-300 text-lg">
            This Pioneer&apos;s journey through the Lattice remains unrecorded
            in the cosmic archives.
          </p>
          <p className="text-slate-400">
            Their harmonic resonance may be too faint to detect, or they have
            yet to begin their exploration.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <a
            href="/leaderboard"
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-300 transform hover:scale-105"
          >
            Pioneer Leaderboard
          </a>
          <a
            href="/dashboard"
            className="px-6 py-3 border border-amber-500/50 text-amber-300 rounded-lg hover:bg-amber-500/10 transition-all duration-300"
          >
            Your Resonance Hub
          </a>
        </div>
      </div>
    </div>
  );
}
