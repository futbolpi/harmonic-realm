import { headers as nextHeaders } from "next/headers";

import { MAX_DISTANCE_KM } from "@/config/site";
import { calculateDistance } from "@/lib/utils";
// import { cookies } from "next/headers";

// Interface for stored location (for velocity check)
// interface StoredLocation {
//   lat: number;
//   lng: number;
//   timestamp: number;
// }

export async function validateGeolocation(
  submittedLat: number,
  submittedLng: number
): Promise<boolean> {
  // Bypass in non-production environments
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  // Get Vercel geo headers (IP-derived)
  const headersList = await nextHeaders();
  const ipLatitude = parseFloat(headersList.get("x-vercel-ip-latitude") || "0");
  const ipLongitude = parseFloat(
    headersList.get("x-vercel-ip-longitude") || "0"
  );

  // Edge case: No geo headers (e.g., local dev or rare failures)—bypass
  if (ipLatitude === 0 && ipLongitude === 0) {
    console.warn("No valid geo headers; bypassing validation");
    return true;
  }

  // Distance check (100km threshold for IP inaccuracy/VPN tolerance)
  const distanceKm = calculateDistance(
    submittedLat,
    submittedLng,
    ipLatitude,
    ipLongitude
  );

  if (distanceKm > MAX_DISTANCE_KM) {
    console.warn(
      `Suspicious distance: ${distanceKm.toFixed(
        1
      )}km (IP: ${ipLatitude},${ipLongitude})`
    );
    return false;
  }

  //   // Optional velocity check (to catch rapid impossible jumps)
  //   const cookieStore = cookies();
  //   const sessionCookie = cookieStore.get("location-session")?.value;
  //   const prevLocation: StoredLocation | null = sessionCookie
  //     ? JSON.parse(sessionCookie)
  //     : null;

  //   if (prevLocation) {
  //     const timeDiffHours =
  //       (Date.now() - prevLocation.timestamp) / (1000 * 60 * 60);
  //     if (timeDiffHours > 0) {
  //       const velocityKmh =
  //         haversineDistance(
  //           submittedLat,
  //           submittedLng,
  //           prevLocation.lat,
  //           prevLocation.lng
  //         ) / timeDiffHours;
  //       const MAX_VELOCITY_KMH = 1000; // ~Jet speed; adjust lower if needed
  //       if (velocityKmh > MAX_VELOCITY_KMH) {
  //         console.warn(`Impossible velocity: ${velocityKmh.toFixed(1)} km/h`);
  //         return false;
  //       }
  //     }
  //   }

  //   // Update stored location for next validation
  //   cookieStore.set(
  //     "location-session",
  //     JSON.stringify({
  //       lat: submittedLat,
  //       lng: submittedLng,
  //       timestamp: Date.now(),
  //     } as StoredLocation),
  //     {
  //       httpOnly: true,
  //       secure: true,
  //       sameSite: "strict",
  //       maxAge: 60 * 60 * 24, // 1 day expiration
  //     }
  //   );

  return true;
}
