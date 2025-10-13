import { Send, Zap, Users, Clock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Contact the Cosmic Council - HarmonicRealm Support",
  description:
    "Connect with the HarmonicRealm Cosmic Council through our social channels. Join fellow Pioneers on Twitter and Telegram for Lattice updates and cosmic guidance.",
  openGraph: {
    title: "Contact the Cosmic Council - HarmonicRealm Support",
    description:
      "Connect with the HarmonicRealm Cosmic Council through our social channels. Join fellow Pioneers on Twitter and Telegram for Lattice updates and cosmic guidance.",
    images: [
      {
        url: "/api/og?title=Contact the Cosmic Council&description=Join the Pioneer community&type=default",
        width: 1200,
        height: 630,
        alt: "Contact HarmonicRealm Cosmic Council",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact the Cosmic Council - HarmonicRealm Support",
    description:
      "Connect with the HarmonicRealm Cosmic Council through our social channels. Join fellow Pioneers on Twitter and Telegram for Lattice updates and cosmic guidance.",
    images: [
      "/api/og?title=Contact the Cosmic Council&description=Join the Pioneer community&type=default",
    ],
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-muted/20"></div>
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-accent rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-primary rounded-full animate-ping"></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-secondary rounded-full animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center space-y-6 mb-12">
          <Badge
            variant="outline"
            className="text-violet-400 border-violet-400/50 animate-pulse bg-violet-500/10"
          >
            <Zap className="w-3 h-3 mr-1" />
            Cosmic Council
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-violet-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
            Connect with the Lattice
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Join fellow Pioneers in our cosmic community. Share discoveries,
            seek guidance from Echo Guardians, and stay attuned to the Lattice
            frequencies.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="bg-card/50 border-border backdrop-blur-sm hover:bg-card/70 transition-all duration-300 group">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                  <Icons.twitter className="h-6 w-6 text-primary" />
                </div>
                Twitter Community
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-card-foreground">
                Follow us for real-time Lattice updates, Pioneer achievements,
                and cosmic discoveries from across the realm.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>Join 10,000+ Pioneers</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4" />
                  <span>Daily Lattice insights</span>
                </div>
              </div>
              <Button
                asChild
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-lg hover:shadow-primary/25 transition-all duration-300"
              >
                <a
                  href={siteConfig.links.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icons.twitter className="w-4 h-4 mr-2" />
                  Follow @HarmonicRealmPi
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border backdrop-blur-sm hover:bg-card/70 transition-all duration-300 group">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-secondary/20 rounded-lg group-hover:bg-secondary/30 transition-colors">
                  <Send className="h-6 w-6 text-secondary" />
                </div>
                Telegram Channel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-card-foreground">
                Connect directly with Echo Guardians and fellow Pioneers. Get
                instant support and share your cosmic journey.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>Active Pioneer community</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>24/7 cosmic support</span>
                </div>
              </div>
              <Button
                asChild
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground border-0 shadow-lg hover:shadow-secondary/25 transition-all duration-300"
              >
                <a
                  href={siteConfig.links.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Join Telegram
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <Card className="bg-card/30 border-border/50 backdrop-blur-sm max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="p-3 bg-accent/20 rounded-full">
                    <Zap className="w-8 h-8 text-accent" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold">The Lattice Awaits</h3>
                <p className="text-card-foreground leading-relaxed">
                  Every Pioneer&apos;s journey begins with a single resonance.
                  Join our cosmic community and discover the infinite
                  possibilities within the HarmonicRealm.
                </p>
                <div className="flex justify-center gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">∞</div>
                    <div className="text-xs text-muted-foreground">
                      Possibilities
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">⚡</div>
                    <div className="text-xs text-muted-foreground">Energy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">🌌</div>
                    <div className="text-xs text-muted-foreground">Cosmos</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
