import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Compass,
  Waves,
  Users,
  Crown,
  Shield,
  Smartphone,
  Globe,
  Sparkles,
} from "lucide-react";

export function Features() {
  const features = [
    {
      icon: Compass,
      title: "Echo Guardian Discovery",
      description:
        "Discover geo-anchored Echo Guardians using harmonic resonance and GPS verification",
      color: "text-violet-400",
      bgColor: "bg-violet-500/20",
      borderColor: "border-violet-400/50",
    },
    {
      icon: Waves,
      title: "Harmonic Resonance",
      description:
        "Mine Shares by resonating with the cosmic Lattice frequencies at each node",
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/20",
      borderColor: "border-cyan-400/50",
    },
    {
      icon: Users,
      title: "Pioneer Community",
      description:
        "Join thousands of Pioneers exploring the infinite mysteries of Pi's digits",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20",
      borderColor: "border-emerald-400/50",
    },
    {
      icon: Crown,
      title: "Mastery & Achievements",
      description:
        "Unlock node mastery, collect lore fragments, and earn your place in history",
      color: "text-amber-400",
      bgColor: "bg-amber-500/20",
      borderColor: "border-amber-400/50",
    },
    {
      icon: Shield,
      title: "Lattice Security",
      description:
        "Protected by Pi SDK authentication and cosmic encryption protocols",
      color: "text-violet-400",
      bgColor: "bg-violet-500/20",
      borderColor: "border-violet-400/50",
    },
    {
      icon: Smartphone,
      title: "Mobile Harmonizer",
      description:
        "Your device becomes a Harmonizer, attuned to detect Echo Guardian frequencies",
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/20",
      borderColor: "border-cyan-400/50",
    },
    {
      icon: Globe,
      title: "Global Lattice Network",
      description:
        "Echo Guardians span the globe, each holding unique fragments of cosmic knowledge",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20",
      borderColor: "border-emerald-400/50",
    },
    {
      icon: Sparkles,
      title: "Harmonic Awakenings",
      description:
        "Experience phase transitions that unlock new realms and double your resonance power",
      color: "text-amber-400",
      bgColor: "bg-amber-500/20",
      borderColor: "border-amber-400/50",
    },
  ];

  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6 mb-16">
          <Badge
            variant="outline"
            className="text-violet-400 border-violet-400/50 bg-violet-500/10"
          >
            Cosmic Features
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold">
            Why Join the{" "}
            <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
              HarmonicRealm
            </span>
            ?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the convergence of reality and cosmic frequencies through
            innovative gameplay that bridges the physical and digital realms.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-card/50 backdrop-blur-sm border-muted/50 hover:scale-105 hover:shadow-xl transition-all duration-300 group"
            >
              <CardHeader className="text-center space-y-4">
                <div
                  className={`w-16 h-16 rounded-full ${feature.bgColor} border ${feature.borderColor} flex items-center justify-center mx-auto transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}
                  style={{
                    boxShadow: `0 0 20px ${feature.color
                      .replace("text-", "")
                      .replace("-400", "")}40`,
                  }}
                >
                  <feature.icon
                    className={`h-8 w-8 ${feature.color} transition-transform duration-300 group-hover:rotate-12`}
                  />
                </div>
                <CardTitle className="text-lg group-hover:text-violet-400 transition-colors duration-300">
                  {feature.title}
                </CardTitle>
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
