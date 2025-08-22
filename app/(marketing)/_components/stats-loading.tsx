const StatsLoading = () => {
  return (
    <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
      <div className="text-center group">
        <div className="text-2xl md:text-3xl font-bold h-8 md:h-9 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 bg-clip-text text-transparent animate-pulse">
          <div className="w-16 h-8 md:h-9 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded mx-auto"></div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Active Pioneers</p>
      </div>
      <div className="text-center group">
        <div className="text-2xl md:text-3xl font-bold h-8 md:h-9 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 bg-clip-text text-transparent animate-pulse">
          <div className="w-16 h-8 md:h-9 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded mx-auto"></div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Echo Guardians</p>
      </div>
      <div className="text-center group">
        <div className="text-2xl md:text-3xl font-bold h-8 md:h-9 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 bg-clip-text text-transparent animate-pulse">
          <div className="w-20 h-8 md:h-9 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded mx-auto"></div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Shares Awakened</p>
      </div>
    </div>
  );
};

export default StatsLoading;
