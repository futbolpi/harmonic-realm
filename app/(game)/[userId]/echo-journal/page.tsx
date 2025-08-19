import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getUserProfile } from "@/lib/api-helpers/server/users";
import { EchoJournalClient } from "./_components/echo-journal-client";

interface EchoJournalPageProps {
  params: Promise<{
    userId: string;
  }>;
}

async function EchoJournalData({ params }: EchoJournalPageProps) {
  try {
    const userId = (await params).userId;
    const userProfile = await getUserProfile(userId);

    return <EchoJournalClient userProfile={userProfile} />;
  } catch (error) {
    console.error("Failed to load echo journal data:", error);
    notFound();
  }
}

export async function generateMetadata({ params }: EchoJournalPageProps) {
  try {
    const { userId } = await params;
    const userProfile = await getUserProfile(userId);
    const title = `${userProfile.username}'s Echo Journal - Cosmic Journey`;
    const description = `Explore ${userProfile.username}'s Pioneer journey through the cosmic Lattice, including Echo Guardian encounters, collected Lore Fragments, and harmonic progression.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [
          {
            url: `/api/og?title=${encodeURIComponent(
              title
            )}&description=${encodeURIComponent(
              "Pioneer's cosmic journey through the Lattice"
            )}&type=journal&username=${encodeURIComponent(
              userProfile.username
            )}`,
            width: 1200,
            height: 630,
            alt: `${userProfile.username}'s Echo Journal - HarmonicRealm`,
          },
        ],
        type: "profile",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [
          `/api/og?title=${encodeURIComponent(
            title
          )}&description=${encodeURIComponent(
            "Pioneer's cosmic journey through the Lattice"
          )}&type=journal&username=${encodeURIComponent(userProfile.username)}`,
        ],
      },
    };
  } catch (error) {
    console.log(error);

    return {
      title: "Echo Journal - HarmonicRealm",
      description:
        "Explore a Pioneer's cosmic journey through the Lattice, including Echo Guardian encounters and collected Lore Fragments.",
    };
  }
}

export default function EchoJournalPage({ params }: EchoJournalPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-game-primary/5">
      <Suspense fallback={<EchoJournalLoading />}>
        <EchoJournalData params={params} />
      </Suspense>
    </div>
  );
}

function EchoJournalLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-game-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded-lg w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-muted rounded-lg" />
            <div className="h-32 bg-muted rounded-lg" />
            <div className="h-32 bg-muted rounded-lg" />
          </div>
          <div className="h-96 bg-muted rounded-lg" />
        </div>
      </div>
    </div>
  );
}
