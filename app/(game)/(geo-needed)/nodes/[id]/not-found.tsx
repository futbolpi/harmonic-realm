export default function NodeNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Animated cosmic orb */}
        <div className="relative mx-auto w-32 h-32 mb-8">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 animate-pulse" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-r from-purple-400/30 to-blue-400/30 animate-ping" />
          <div className="absolute inset-4 rounded-full bg-gradient-to-r from-purple-300/40 to-blue-300/40 animate-bounce" />
          <div className="absolute inset-6 rounded-full bg-gradient-to-r from-purple-200/50 to-blue-200/50" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Echo Lost in the Void
          </h1>
          <p className="text-slate-300 text-lg">
            The cosmic convergence point you seek has drifted beyond the
            Lattice&apos;s reach.
          </p>
          <p className="text-slate-400">
            This Echo Guardian node may have been consumed by the cosmic winds
            or never existed in this reality.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <a
            href="/map"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            Return to Lattice Map
          </a>
          <a
            href="/dashboard"
            className="px-6 py-3 border border-purple-500/50 text-purple-300 rounded-lg hover:bg-purple-500/10 transition-all duration-300"
          >
            Resonance Hub
          </a>
        </div>
      </div>
    </div>
  );
}
