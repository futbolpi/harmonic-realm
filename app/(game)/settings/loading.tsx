export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Skeleton */}
        <div className="text-center space-y-4 py-8">
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/30 to-blue-500/30 animate-pulse" />
          </div>
          <div className="h-10 bg-slate-700/50 rounded-lg w-80 mx-auto animate-pulse" />
          <div className="h-6 bg-slate-700/30 rounded w-96 mx-auto animate-pulse" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Theme Settings Skeleton */}
          <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-6 space-y-4">
            <div className="h-6 bg-slate-700/50 rounded w-48 animate-pulse" />
            <div className="h-4 bg-slate-700/30 rounded w-64 animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-slate-700/30 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Interface Settings Skeleton */}
          <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-6 space-y-4">
            <div className="h-6 bg-slate-700/50 rounded w-40 animate-pulse" />
            <div className="h-4 bg-slate-700/30 rounded w-56 animate-pulse" />
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-slate-700/50 rounded animate-pulse" />
                    <div className="space-y-1">
                      <div className="h-4 bg-slate-700/50 rounded w-24 animate-pulse" />
                      <div className="h-3 bg-slate-700/30 rounded w-32 animate-pulse" />
                    </div>
                  </div>
                  <div className="w-11 h-6 bg-slate-700/50 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Profile Settings Skeleton */}
          <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-6 space-y-4 md:col-span-2">
            <div className="h-6 bg-slate-700/50 rounded w-56 animate-pulse" />
            <div className="h-4 bg-slate-700/30 rounded w-72 animate-pulse" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="h-4 bg-slate-700/50 rounded w-32 animate-pulse" />
                <div className="h-10 bg-slate-700/30 rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-700/50 rounded w-28 animate-pulse" />
                <div className="h-10 bg-slate-700/30 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Skeleton */}
        <div className="flex justify-center pt-8">
          <div className="h-12 bg-slate-700/50 rounded w-48 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
