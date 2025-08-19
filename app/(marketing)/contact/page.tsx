import { Mail, MessageCircle, Bug, HelpCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const metadata = {
  title: "Contact the Cosmic Council - HarmonicRealm Support",
  description:
    "Reach out to the HarmonicRealm Cosmic Council for Pioneer support, Lattice guidance, Echo Guardian assistance, or cosmic partnership inquiries.",
  openGraph: {
    title: "Contact the Cosmic Council - HarmonicRealm Support",
    description:
      "Reach out to the HarmonicRealm Cosmic Council for Pioneer support, Lattice guidance, Echo Guardian assistance, or cosmic partnership inquiries.",
    images: [
      {
        url: "/api/og?title=Contact the Cosmic Council&description=Pioneer support and Lattice guidance&type=default",
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
      "Reach out to the HarmonicRealm Cosmic Council for Pioneer support, Lattice guidance, Echo Guardian assistance, or cosmic partnership inquiries.",
    images: [
      "/api/og?title=Contact the Cosmic Council&description=Pioneer support and Lattice guidance&type=default",
    ],
  },
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center space-y-6 mb-12">
        <Badge variant="outline" className="text-primary border-primary/50">
          Contact Us
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold">Get in Touch</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Have questions, feedback, or need support? We{"'"}d love to hear from
          you!
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* Contact Form */}
        <Card className="game-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Send us a Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="piUsername">Pi Username (Optional)</Label>
                <Input id="piUsername" placeholder="@yourpiusername" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="How can we help you?" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us more about your inquiry..."
                  rows={5}
                />
              </div>

              <Button type="submit" className="w-full game-button">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Options */}
        <div className="space-y-6">
          <Card className="game-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-neon-green" />
                General Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Need help with gameplay, account issues, or have general
                questions?
              </p>
              <Button variant="outline" className="w-full">
                support@pimimingnodes.com
              </Button>
            </CardContent>
          </Card>

          <Card className="game-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5 text-neon-orange" />
                Bug Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Found a bug or technical issue? Help us improve the game!
              </p>
              <Button variant="outline" className="w-full">
                bugs@pimimingnodes.com
              </Button>
            </CardContent>
          </Card>

          <Card className="game-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-neon-purple" />
                Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Join our community for tips, updates, and to connect with other
                miners!
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  Discord Community
                </Button>
                <Button variant="outline" className="w-full">
                  Telegram Group
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="game-card">
            <CardHeader>
              <CardTitle>Response Times</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">General Inquiries</span>
                <span className="text-primary">24-48 hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bug Reports</span>
                <span className="text-neon-orange">12-24 hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Critical Issues</span>
                <span className="text-neon-green">2-6 hours</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
