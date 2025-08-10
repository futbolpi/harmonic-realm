import { MapPin, Zap, Coins, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: MapPin,
      title: "Discover Nodes",
      description:
        "Use your mobile device to find nearby mining nodes on the interactive map. Each node has unique properties and rewards.",
      color: "text-primary",
      bgColor: "bg-primary/20",
      borderColor: "border-primary/50",
    },
    {
      step: "02",
      icon: Zap,
      title: "Start Mining",
      description:
        "Visit the physical location and start a mining session. Complete mini-tasks and challenges to boost your rewards.",
      color: "text-neon-green",
      bgColor: "bg-neon-green/20",
      borderColor: "border-neon-green/50",
    },
    {
      step: "03",
      icon: Coins,
      title: "Earn Rewards",
      description:
        "Collect Miner Shares and Pi cryptocurrency. Your earnings depend on node rarity, session duration, and performance.",
      color: "text-neon-orange",
      bgColor: "bg-neon-orange/20",
      borderColor: "border-neon-orange/50",
    },
    {
      step: "04",
      icon: Trophy,
      title: "Level Up",
      description:
        "Gain experience, unlock achievements, and climb the leaderboards. Higher levels unlock better nodes and bonuses.",
      color: "text-neon-purple",
      bgColor: "bg-neon-purple/20",
      borderColor: "border-neon-purple/50",
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6 mb-16">
          <Badge variant="outline" className="text-primary border-primary/50">
            How It Works
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold">
            Start Mining in <span className="neon-text">4 Simple Steps</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started with Pi Mining Nodes and begin earning Pi cryptocurrency
            through real-world exploration.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent z-0" />
              )}

              <Card className="game-card relative z-10 hover:scale-105 transition-transform duration-300">
                <CardContent className="p-6 text-center space-y-4">
                  {/* Step Number */}
                  <div className="text-4xl font-bold text-muted-foreground/30 mb-2">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-full ${step.bgColor} border ${step.borderColor} flex items-center justify-center mx-auto glow-border`}
                  >
                    <step.icon className={`h-8 w-8 ${step.color}`} />
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {step.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
