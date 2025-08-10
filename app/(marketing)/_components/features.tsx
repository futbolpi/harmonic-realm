import {
  MapPin,
  Zap,
  Users,
  Trophy,
  Shield,
  Smartphone,
  Globe,
  TrendingUp,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Features() {
  const features = [
    {
      icon: MapPin,
      title: "Location-Based Mining",
      description:
        "Discover and mine at real-world locations using GPS verification",
      color: "text-primary",
      bgColor: "bg-primary/20",
      borderColor: "border-primary/50",
    },
    {
      icon: Zap,
      title: "Real Pi Rewards",
      description:
        "Earn actual Pi cryptocurrency through gameplay and achievements",
      color: "text-neon-green",
      bgColor: "bg-neon-green/20",
      borderColor: "border-neon-green/50",
    },
    {
      icon: Users,
      title: "Community Driven",
      description:
        "Join thousands of pioneers in a collaborative mining ecosystem",
      color: "text-neon-purple",
      bgColor: "bg-neon-purple/20",
      borderColor: "border-neon-purple/50",
    },
    {
      icon: Trophy,
      title: "Achievement System",
      description: "Unlock badges, levels, and special rewards as you progress",
      color: "text-neon-orange",
      bgColor: "bg-neon-orange/20",
      borderColor: "border-neon-orange/50",
    },
    {
      icon: Shield,
      title: "Secure & Verified",
      description:
        "Built with Pi SDK for secure authentication and transactions",
      color: "text-primary",
      bgColor: "bg-primary/20",
      borderColor: "border-primary/50",
    },
    {
      icon: Smartphone,
      title: "Mobile First",
      description:
        "Optimized for mobile gameplay with intuitive touch controls",
      color: "text-neon-green",
      bgColor: "bg-neon-green/20",
      borderColor: "border-neon-green/50",
    },
    {
      icon: Globe,
      title: "Global Network",
      description: "Mining nodes available worldwide with regular expansions",
      color: "text-neon-purple",
      bgColor: "bg-neon-purple/20",
      borderColor: "border-neon-purple/50",
    },
    {
      icon: TrendingUp,
      title: "Progressive Rewards",
      description: "Increasing rewards and bonuses as you level up and improve",
      color: "text-neon-orange",
      bgColor: "bg-neon-orange/20",
      borderColor: "border-neon-orange/50",
    },
  ];

  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6 mb-16">
          <Badge variant="outline" className="text-primary border-primary/50">
            Game Features
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold">
            Why Choose <span className="neon-text">Pi Mining Nodes</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the future of cryptocurrency mining with innovative
            gameplay mechanics and real-world rewards.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="game-card hover:scale-105 transition-transform duration-300"
            >
              <CardHeader className="text-center space-y-4">
                <div
                  className={`w-16 h-16 rounded-full ${feature.bgColor} border ${feature.borderColor} flex items-center justify-center mx-auto glow-border`}
                >
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center text-sm">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
