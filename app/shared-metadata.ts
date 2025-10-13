import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { env } from "@/env";

export const TITLE = siteConfig.name;
export const DESCRIPTION = siteConfig.description;

export const defaultMetadata: Metadata = {
  title: {
    template: `%s | ${TITLE}`,
    default: TITLE,
  },
  description: DESCRIPTION,
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  keywords: [
    "Pi Network",
    "mining",
    "blockchain",
    "game",
    "location-based",
    "cryptocurrency",
  ],
  authors: [{ name: "KunJon" }],
};

export const twitterMetadata: Metadata["twitter"] = {
  title: TITLE,
  description: DESCRIPTION,
  card: "summary_large_image",
  images: ["/api/og"],
};

export const ogMetadata: Metadata["openGraph"] = {
  title: TITLE,
  description: DESCRIPTION,
  type: "website",
  images: ["/api/og"],
};
