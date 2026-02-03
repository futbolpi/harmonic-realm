import { redirect } from "next/navigation";

import { ChambersPageClient } from "./_components/chambers-page-client";
import { getUserChambersForPage } from "./service";

type ChambersPageProps = {
  params: Promise<{ userId: string }>;
};

export async function generateMetadata({ params }: ChambersPageProps) {
  const { userId } = await params;

  return {
    title: `Echo Resonance Chambers - Harmonic Sanctuaries`,
    description: `Manage your personal Echo Resonance Chambers. Create harmonic sanctuaries to boost SharePoint earnings within their 5km sphere of influence.`,
    openGraph: {
      title: `Echo Resonance Chambers - Harmonic Sanctuaries`,
      description: `Manage your personal Echo Resonance Chambers and boost your cosmic resonance`,
      images: [
        {
          url: `/api/og?title=Echo Chambers&description=Manage your harmonic sanctuaries&type=chambers&userId=${userId}`,
          width: 1200,
          height: 630,
          alt: "Echo Resonance Chambers - HarmonicRealm",
        },
      ],
      type: "website",
    },
  };
}

export default async function ChambersPage({ params }: ChambersPageProps) {
  const { userId } = await params;

  // Fetch user chambers
  const { success, data: chambersRaw } = await getUserChambersForPage(userId);

  if (!success) {
    redirect("/dashboard");
  }

  // Serialize Date objects to ISO strings for client-side safety
  const chambers = chambersRaw.map((chamber) => ({
    ...chamber,
    lastMaintenanceAt: chamber.lastMaintenanceAt.toISOString(),
    maintenanceDueAt: chamber.maintenanceDueAt.toISOString(),
    createdAt: chamber.createdAt.toISOString(),
  }));

  return (
    <div className="h-[calc(100vh-8rem)] md:h-screen bg-background">
      <ChambersPageClient userId={userId} initialChambers={chambers} />
    </div>
  );
}
