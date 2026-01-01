import { notFound } from "next/navigation";
import type { SearchParams } from "nuqs/server";

import { loadSearchParams } from "./search-params";
import { getGuildJoinData } from "./services";
import JoinCard from "./_components/join-card";

type Props = {
  searchParams: Promise<SearchParams>;
};

export async function generateMetadata({ searchParams }: Props) {
  const { guildId } = await loadSearchParams(searchParams, { strict: true });

  if (!guildId) return { title: "Join Guild" };

  const guild = await getGuildJoinData(guildId);

  if (!guild) return { title: "Join Guild" };

  const slotsLeft = guild.maxMembers - guild._count.members;
  return {
    title: `Join ${guild.name} — Guild`,
    description: `Join ${guild.name}. ${slotsLeft} slot${slotsLeft === 1 ? "" : "s"} left • ${guild.requireApproval ? "Approval required" : "Open to join"} • Min RF ${guild.minRF}`,
  };
}

export default async function GuildPage({ searchParams }: Props) {
  const { guildId } = await loadSearchParams(searchParams, { strict: true });

  if (!guildId) notFound();

  const guild = await getGuildJoinData(guildId);

  if (!guild) notFound();

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <JoinCard guild={guild} />
      </div>
    </main>
  );
}
