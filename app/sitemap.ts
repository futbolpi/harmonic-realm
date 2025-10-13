import type { MetadataRoute } from "next";

import { env } from "@/env";

const addPathToBaseURL = (path: string) => `${env.NEXT_PUBLIC_APP_URL}${path}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/", "/about", "/privacy", "/terms", "/contact"].map(
    (route) => ({
      url: addPathToBaseURL(route),
      lastModified: new Date(),
    })
  );

  return [...routes];
}
