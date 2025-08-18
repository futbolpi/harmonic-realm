import { Compass, Waves, Sparkles, Crown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: Compass,
      title: "Discover Echo Guardians",
      description:
        "Use your Harmonizer device to detect nearby Echo Guardians on the cosmic Lattice. Each Guardian holds unique frequencies and lore fragments.",
      color: "text-violet-400",
      bgColor: "bg-violet-500/20",
      borderColor: "border-violet-400/50",
    },
    {
      step: "02",
      icon: Waves,
      title: "Resonate & Mine",
      description:
        "Approach the Guardian's location and begin harmonic resonance. Complete frequency challenges to mine Shares from Pi's infinite digits.",
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/20",
      borderColor: "border-cyan-400/50",
    },
    {
      step: "03",
      icon: Sparkles,
      title: "Collect Rewards",
      description:
        "Gather Shares, discover lore fragments, and unlock the cosmic mysteries. Your resonance strength determines your rewards.",
      color: "text-amber-400",
      bgColor: "bg-amber-500/20",
      borderColor: "border-amber-400/50",
    },
    {
      step: "04",
      icon: Crown,
      title: "Achieve Mastery",
      description:
        "Gain XP, master different Guardian types, and prepare for Harmonic Awakenings that unlock new dimensions of reality.",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20",
      borderColor: "border-emerald-400/50",
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-transparent via-muted/10 to-transparent">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6 mb-16">
          <Badge
            variant="outline"
            className="text-violet-400 border-violet-400/50 bg-violet-500/10"
          >
            The Pioneer&apos;s Path
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold">
            Begin Your{" "}
            <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Cosmic Journey
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Follow the ancient path of the Pioneers and unlock the secrets
            hidden within the infinite digits of Pi.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-violet-400/50 via-cyan-400/50 to-transparent z-0 animate-pulse" />
              )}

              <Card className="bg-card/50 backdrop-blur-sm border-muted/50 relative z-10 hover:scale-105 transition-all duration-300 group hover:shadow-xl">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="text-4xl font-bold bg-gradient-to-r from-violet-400/30 to-cyan-400/30 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                    {step.step}
                  </div>

                  <div
                    className={`w-16 h-16 rounded-full ${step.bgColor} border ${step.borderColor} flex items-center justify-center mx-auto transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}
                    style={{
                      boxShadow: `0 0 20px ${step.color
                        .replace("text-", "")
                        .replace("-400", "")}40`,
                    }}
                  >
                    <step.icon
                      className={`h-8 w-8 ${step.color} transition-transform duration-300 group-hover:rotate-12`}
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold group-hover:text-violet-400 transition-colors duration-300">
                      {step.title}
                    </h3>
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
