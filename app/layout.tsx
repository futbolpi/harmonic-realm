import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { ThemeProvider } from "@/components/shared/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/shared/auth/auth-context";
import TanstackQueryProvider from "@/components/shared/tanstack-query/provider";
import { PiProvider } from "@/components/shared/pi/pi-provider";

import "./globals.css";
import { env } from "@/env";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export const metadata: Metadata = {
  title: "Pi Mining Nodes - Explore, Mine, Earn",
  description:
    "Turn real-world exploration into a Pi mining adventure. Discover nodes, mine Pi, and earn rewards in this location-based game.",
  keywords: [
    "Pi Network",
    "mining",
    "blockchain",
    "game",
    "location-based",
    "cryptocurrency",
  ],
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  authors: [{ name: "Pi Mining Nodes Team" }],
  openGraph: {
    title: "Pi Mining Nodes - Explore, Mine, Earn",
    description: "Turn real-world exploration into a Pi mining adventure.",
    type: "website",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pi Mining Nodes",
    description: "Turn real-world exploration into a Pi mining adventure.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TanstackQueryProvider>
            <div vaul-drawer-wrapper="" className="bg-background">
              <NuqsAdapter>
                <AuthProvider>{children}</AuthProvider>
              </NuqsAdapter>
            </div>
          </TanstackQueryProvider>
          <Toaster richColors closeButton />
        </ThemeProvider>
        <PiProvider />
      </body>
    </html>
  );
}
