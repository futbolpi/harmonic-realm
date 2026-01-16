import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import ChallengesClient from "./_components/challenges-client";
import { getGuildChallengesData } from "./services";

type Props = { params: Promise<{ guildId: string }> };

export async function generateMetadata() {
  return {
    title: "Guild — Challenges",
    description: "Guild challenges and co-op goals for your guild",
  };
}

export default async function GuildChallengesPage({ params }: Props) {
  const { guildId } = await params;
  const data = await getGuildChallengesData(guildId);

  if (!data) notFound();

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href={`/guilds/${guildId}`}>
            <button className="rounded p-2 hover:bg-muted transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Guild Challenges</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Weekly co-op goals where members collaborate to earn rewards
            </p>
          </div>
        </div>

        {/* Client Component */}
        <ChallengesClient data={data} guildId={guildId} />
      </div>
    </main>
  );
}
