import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookOpen, Coins, Share2, Zap } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLore } from "./services";
import HeroSection from "./_components/hero-section";
import LoreNarrative from "./_components/lore-narrative";
import StakingSection from "./_components/staking-section";
import SharingSection from "./_components/sharing-section";

interface LorePageProps {
  params: Promise<{ nodeId: string }>;
}

export async function generateMetadata({
  params,
}: LorePageProps): Promise<Metadata> {
  const nodeId = (await params).nodeId;
  const lore = await getLore(nodeId);

  if (!lore) {
    return {
      title: "Uncharted Echo Node | HarmonicRealm",
      description:
        "This node awaits resonance in the Lattice. Explore other cosmic anchors in HarmonicRealm!",
      openGraph: {
        title: "Uncharted Echo Node | HarmonicRealm",
        description:
          "Join the adventure to awaken cosmic mysteries in HarmonicRealm!",
        images: [
          {
            url: "/api/og/lore",
          },
        ],
        type: "article",
      },
    };
  }
  const title = `Echo Node #π-${nodeId}: ${
    lore.epicNarrative ? "The Eternal Whisper" : "Uncharted Resonance"
  }`;
  const description =
    lore.basicHistory ||
    "Unveil the cosmic mysteries tied to this earthly anchor in the Lattice.";
  const city = lore.city || "Unknown Anchor";
  const teaser =
    lore.mysticInterpretation?.slice(0, 80) + "..." ||
    "Unveil cosmic secrets in the Lattice!";
  const primaryColor = lore.cosmeticThemes?.primaryColors?.[0] || "#228B22";
  const rarity = lore.node.type.rarity;
  const url = `/api/og/lore?nodeId=${encodeURIComponent(
    nodeId.slice(0, 5) + "..."
  )}&city=${encodeURIComponent(city)}&teaser=${encodeURIComponent(
    teaser
  )}&primaryColor=${encodeURIComponent(
    primaryColor
  )}&rarity=${encodeURIComponent(rarity)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url,
        },
      ],
      type: "article",
    },
  };
}

export default async function LorePage({ params }: LorePageProps) {
  const nodeId = (await params).nodeId;
  const lore = await getLore(nodeId);

  if (!lore) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[--background] text-[--foreground]">
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="hero" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-card/50 backdrop-blur-sm">
            <TabsTrigger className="flex items-center gap-2" value="hero">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Resonate</span>
            </TabsTrigger>
            <TabsTrigger className="flex items-center gap-2" value="lore">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Chronicle</span>
            </TabsTrigger>
            <TabsTrigger className="flex items-center gap-2" value="stake">
              <Coins className="h-4 w-4" />
              <span className="hidden sm:inline">Patronage</span>
            </TabsTrigger>
            <TabsTrigger className="flex items-center gap-2" value="share">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hero">
            <Suspense
              fallback={<div className="animate-pulse h-64 bg-[--muted]" />}
            >
              <HeroSection
                lore={{
                  city: lore.city,
                  currentLevel: lore.currentLevel,
                  node: lore.node,
                  nodeId: lore.nodeId,
                  numberOfStakes: lore.stakes.length,
                  totalPiStaked: lore.totalPiStaked.toNumber(),
                }}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="lore">
            <Suspense
              fallback={<div className="animate-pulse h-96 bg-[--muted]" />}
            >
              <LoreNarrative
                lore={{
                  basicHistory: lore.basicHistory,
                  culturalSignificance: lore.culturalSignificance,
                  currentLevel: lore.currentLevel,
                  epicNarrative: lore.epicNarrative,
                  legendaryTale: lore.legendaryTale,
                  mysticInterpretation: lore.mysticInterpretation,
                  stakes: lore.stakes.map((stake) => ({
                    contributionTier: stake.contributionTier,
                    user: stake.user,
                  })),
                }}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="stake">
            <Suspense
              fallback={<div className="animate-pulse h-48 bg-[--muted]" />}
            >
              <StakingSection
                nodeId={nodeId}
                currentLevel={lore.currentLevel}
                totalPiStaked={lore.totalPiStaked.toNumber()}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="share">
            <SharingSection loreTitle={"View this Mystic Node on Pi"} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
