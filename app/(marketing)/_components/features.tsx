import {
  Compass,
  Zap,
  Users,
  Trophy,
  Map,
  Sparkles,
  Crown,
  Target,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function Features() {
  const features = [
    {
      icon: Compass,
      title: "Explore the Lattice",
      description:
        "Discover geo-anchored Echo Guardians in your city, across continents, or in hidden corners of the world.",
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/30",
    },
    {
      icon: Zap,
      title: "Mine Pi Shares",
      description:
        "Resonate with Guardians to mine Shares derived from Pi's infinite digits. Convert to RESONANCE tokens instantly.",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      borderColor: "border-secondary/30",
    },
    {
      icon: Target,
      title: "Skill-Based Tuning",
      description:
        "Complete harmonic mini-games to accelerate progression. Master frequency patterns, memory challenges, and more.",
      color: "text-accent",
      bgColor: "bg-accent/10",
      borderColor: "border-accent/30",
    },
    {
      icon: Map,
      title: "Node Mastery",
      description:
        "Gain mastery over different Guardian types. Unlock up to 300% bonus multipliers through dedicated exploration.",
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
      borderColor: "border-chart-1/30",
    },
    {
      icon: Users,
      title: "Form Guilds",
      description:
        "Unite with fellow Pioneers. Control territories, complete challenges, and share in guild vault rewards.",
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
      borderColor: "border-chart-2/30",
    },
    {
      icon: Crown,
      title: "Echo Chambers",
      description:
        "Anchor personal chambers at strategic locations. Boost all mining within 5km and strengthen your Lattice presence.",
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
      borderColor: "border-chart-3/30",
    },
    {
      icon: Trophy,
      title: "Compete Globally",
      description:
        "Climb leaderboards across mining, tuning, and guild rankings. Earn achievements and exclusive recognition.",
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
      borderColor: "border-chart-4/30",
    },
    {
      icon: Sparkles,
      title: "Collect Lore",
      description:
        "Uncover the mysteries of the Lattice through Lore Fragments. Each resonance reveals deeper cosmic secrets.",
      color: "text-chart-5",
      bgColor: "bg-chart-5/10",
      borderColor: "border-chart-5/30",
    },
  ];

  return (
    <section className="py-12 md:py-20 lg:py-32 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/5 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="space-y-8 md:space-y-12">
          {/* Section header */}
          <div className="text-center space-y-3 md:space-y-4 max-w-3xl mx-auto">
            <Badge
              variant="outline"
              className="text-primary border-primary/50 bg-primary/5 text-sm md:text-base"
            >
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
              Core Mechanics
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
              A Living{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Mathematical Universe
              </span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
              Harmonic Realm combines real-world exploration, skill-based
              progression, and community dynamics into a seamless experience
              powered by Pi Network.
            </p>
          </div>

          {/* Features grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`${feature.borderColor} border bg-card/50 backdrop-blur-sm hover:scale-105 hover:shadow-lg transition-all duration-300 group`}
              >
                <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4 text-center">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 md:w-16 md:h-16 rounded-full ${feature.bgColor} border ${feature.borderColor} flex items-center justify-center mx-auto group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon
                      className={`w-6 h-6 md:w-8 md:h-8 ${feature.color}`}
                    />
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="text-base md:text-lg font-bold group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Value proposition */}
          <div className="text-center space-y-3 md:space-y-4 pt-4 md:pt-8">
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Every feature is designed to reward exploration, skill, and
              dedication. Your journey through the Lattice is unique, and so are
              your rewards.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
