import type { Metadata, Viewport } from "next";
import { Outfit, Lora, Space_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { ThemeProvider } from "@/components/shared/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/shared/auth/auth-context";
import TanstackQueryProvider from "@/components/shared/tanstack-query/provider";
import { PiProvider } from "@/components/shared/pi/pi-provider";
import { env } from "@/env";
import { siteConfig } from "@/config/site";

import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

const fontSans = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const fontSerif = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
});

const fontMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export const metadata: Metadata = {
  title: `${siteConfig.name} - Explore, Mine, Earn`,
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
  authors: [{ name: `${siteConfig.name} Team` }],
  openGraph: {
    title: `${siteConfig.name} - Explore, Mine, Earn`,
    description: "Turn real-world exploration into a Pi mining adventure.",
    type: "website",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name}`,
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
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}
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
