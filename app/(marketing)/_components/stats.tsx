import { TrendingUp, Users, Zap, Compass } from "lucide-react";

import { getSiteStats } from "@/lib/api-helpers/server/site";
import { formatNumber } from "@/lib/utils";
import { Card } from "@/components/ui/card";

const Stats = async () => {
  const { pioneersAggregate, noOfNodes } = await getSiteStats();

  const stats = [
    {
      label: "Active Pioneers",
      value: formatNumber(pioneersAggregate._count.id),
      icon: Users,
      color: "text-primary",
      borderColor: "border-primary/30",
      bgColor: "bg-primary/10",
      gradColor: "from-primary to-primary/70",
      suffix: "+",
    },
    {
      label: "Echo Guardians",
      value: formatNumber(noOfNodes),
      icon: Zap,
      color: "text-secondary",
      borderColor: "border-secondary/30",
      bgColor: "bg-secondary/10",
      gradColor: "from-secondary to-secondary/70",
      suffix: "+",
    },
    {
      label: "Shares Mined",
      value: formatNumber(pioneersAggregate._sum.sharePoints || 0),
      icon: Compass,
      color: "text-accent",
      borderColor: "border-accent/30",
      bgColor: "bg-accent/10",
      gradColor: "from-accent to-accent/70",
      suffix: "+",
    },
    {
      label: "Growth Rate",
      value: "127%",
      icon: TrendingUp,
      color: "text-chart-1",
      borderColor: "border-chart-1/30",
      gradColor: "from-chart-1 to-chart-1/70",
      bgColor: "bg-chart-1/10",
      suffix: "",
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto pt-8 md:pt-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="border-border/40 bg-card/50 backdrop-blur-sm hover:scale-105 transition-all duration-300 group"
          >
            <div className="p-3 md:p-4 lg:p-6 text-center space-y-2 md:space-y-3">
              {/* Icon */}
              <div
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${stat.bgColor} ${stat.borderColor} flex items-center justify-center mx-auto group-hover:scale-110 transition-transform`}
              >
                <stat.icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
              </div>

              {/* Value */}
              <div
                className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r ${stat.gradColor} bg-clip-text text-transparent`}
              >
                {stat.value}
                {stat.suffix}
              </div>

              {/* Label */}
              <p className="text-xs md:text-sm text-muted-foreground font-medium">
                {stat.label}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Additional context */}
      <div className="text-center pt-4 md:pt-6">
        <p className="text-xs md:text-sm text-muted-foreground">
          Real-time statistics • Updated every hour
        </p>
      </div>
    </div>
  );
};

export default Stats;
