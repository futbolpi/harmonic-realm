import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#fff",
    theme_color: "#fff",
    icons: [
      { src: "/icon3.png", type: "image/png", sizes: "192x192" },
      { src: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
  };
}
