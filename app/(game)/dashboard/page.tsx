import DashboardClientPage from "./_components/dashboard-client-page";

export const metadata = {
  title: "Pioneer Dashboard - HarmonicRealm Command Center",
  description:
    "Monitor your cosmic journey, track Share earnings, view Echo Guardian encounters, and manage your Pioneer progression through the Lattice.",
  openGraph: {
    title: "Pioneer Dashboard - HarmonicRealm Command Center",
    description:
      "Monitor your cosmic journey, track Share earnings, view Echo Guardian encounters, and manage your Pioneer progression through the Lattice.",
    images: [
      {
        url: "/api/og?title=Pioneer Dashboard&description=Monitor your cosmic journey through the Lattice&type=dashboard",
        width: 1200,
        height: 630,
        alt: "HarmonicRealm Pioneer Dashboard",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pioneer Dashboard - HarmonicRealm Command Center",
    description:
      "Monitor your cosmic journey, track Share earnings, view Echo Guardian encounters, and manage your Pioneer progression through the Lattice.",
    images: [
      "/api/og?title=Pioneer Dashboard&description=Monitor your cosmic journey through the Lattice&type=dashboard",
    ],
  },
};

export default function DashboardPage() {
  return <DashboardClientPage />;
}
