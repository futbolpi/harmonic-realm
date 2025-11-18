import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  /* config options here */
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  async headers() {
    return [
      {
        // Match the path to your TOML file (e.g., /.well-known/pi.toml)
        source: "/.well-known/pi.toml",
        headers: [
          {
            key: "Content-Type",
            value: "text/plain", // Set the content type to plain text
          },
        ],
      },
    ];
  },
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
});

// Merge MDX config with Next.js config
export default withMDX(nextConfig);
