import { getSiteStats } from "@/lib/api-helpers/server/site";
import { formatNumber } from "@/lib/utils";

const Stats = async () => {
  const { pioneersAggregate, noOfNodes } = await getSiteStats();

  return (
    <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
      <div className="text-center group">
        <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
          {formatNumber(pioneersAggregate._count.id)}+
        </div>
        <p className="text-sm text-muted-foreground">Active Pioneers</p>
      </div>
      <div className="text-center group">
        <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
          {formatNumber(noOfNodes)}+
        </div>
        <p className="text-sm text-muted-foreground">Echo Guardians</p>
      </div>
      <div className="text-center group">
        <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
          {formatNumber(pioneersAggregate._sum.sharePoints || 0)}+
        </div>
        <p className="text-sm text-muted-foreground">Shares Earned</p>
      </div>
    </div>
  );
};

export default Stats;
