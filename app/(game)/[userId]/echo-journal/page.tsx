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
