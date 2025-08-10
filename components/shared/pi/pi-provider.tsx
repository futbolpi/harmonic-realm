"use client";

import Script from "next/script";

export function PiProvider() {
  return (
    <Script
      src="https://sdk.minepi.com/pi-sdk.js"
      strategy="afterInteractive"
      onReady={() => {
        window.Pi.init({
          version: "2.0",
          sandbox: process.env.NODE_ENV !== "production",
        });
      }}
    />
  );
}
