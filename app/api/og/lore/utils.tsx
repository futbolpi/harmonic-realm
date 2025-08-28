import { ImageResponse } from "next/og";
// App router includes @vercel/og.
// No need to install it.

async function loadGoogleFont(font: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}&:${encodeURIComponent(
    text
  )}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/
  );

  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status == 200) {
      return await response.arrayBuffer();
    }
  }

  throw new Error("failed to load font data");
}

type ImageResponseParams = {
  nodeId: string | null;
  city: string | null;
  teaser: string | null;
  primaryColor: string | null;
  rarity: string | null;
};

export const getImageResponse = async ({
  city,
  nodeId,
  primaryColor,
  rarity,
  teaser,
}: ImageResponseParams) => {
  // Fallback for non-existent node
  if (!nodeId || !city || !teaser || !primaryColor || !rarity) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "1200px",
            height: "630px",
            background: "linear-gradient(to bottom, #000022, #2A2A72)",
            color: "#F5F5DC",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)",
              opacity: 0.3,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "20px",
              fontSize: "100px",
              fontFamily: "Orbitron",
              opacity: 0.2,
            }}
          >
            π
          </div>
          <h1
            style={{
              fontFamily: "Orbitron",
              fontSize: "48px",
              fontWeight: 700,
              textAlign: "center",
              maxWidth: "80%",
              marginBottom: "20px",
              textShadow: "0 0 10px rgba(255,215,0,0.5)",
            }}
          >
            Uncharted Echo Node
          </h1>
          <p
            style={{
              fontFamily: "Merriweather",
              fontSize: "24px",
              fontStyle: "italic",
              textAlign: "center",
              maxWidth: "70%",
              marginBottom: "40px",
              color: "#E6E6FA",
            }}
          >
            A cosmic anchor awaits resonance in the Lattice. Join HarmonicRealm
            to awaken its secrets!
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              position: "absolute",
              bottom: "20px",
              right: "20px",
            }}
          >
            <span style={{ fontFamily: "Orbitron", fontSize: "24px" }}>
              HarmonicRealm
            </span>
            <span
              style={{
                fontFamily: "Merriweather",
                fontSize: "16px",
                opacity: 0.7,
              }}
            >
              Powered by Pi Network
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Orbitron",
            data: await loadGoogleFont("Orbitron", "wght@700&display=swap"),
            style: "normal",
            weight: 700,
          },
          {
            name: "Merriweather",
            data: await loadGoogleFont("Merriweather", "ital@1&display=swap"),
            style: "italic",
            weight: 400,
          },
        ],
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      }
    );
  }

  // Existing node logic
  const title = `Echo Node #π-${nodeId}: ${city}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "1200px",
          height: "630px",
          background: `linear-gradient(to bottom, #000022, ${primaryColor})`,
          color: "#F5F5DC",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)",
            opacity: 0.3,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            fontSize: "100px",
            fontFamily: "Orbitron",
            opacity: 0.2,
          }}
        >
          π
        </div>
        <h1
          style={{
            fontFamily: "Orbitron",
            fontSize: "48px",
            fontWeight: 700,
            textAlign: "center",
            maxWidth: "80%",
            marginBottom: "20px",
            textShadow: "0 0 10px rgba(255,215,0,0.5)",
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontFamily: "Merriweather",
            fontSize: "24px",
            fontStyle: "italic",
            textAlign: "center",
            maxWidth: "70%",
            marginBottom: "40px",
            color: "#E6E6FA",
          }}
        >
          {teaser}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            position: "absolute",
            bottom: "20px",
            right: "20px",
          }}
        >
          <span style={{ fontFamily: "Orbitron", fontSize: "24px" }}>
            HarmonicRealm
          </span>
          <span
            style={{
              fontFamily: "Merriweather",
              fontSize: "16px",
              opacity: 0.7,
            }}
          >
            Powered by Pi Network
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "#FFD700",
            color: "#000022",
            padding: "8px 16px",
            borderRadius: "12px",
            fontFamily: "Orbitron",
            fontSize: "18px",
          }}
        >
          {rarity}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Orbitron",
          data: await loadGoogleFont("Orbitron", "wght@700&display=swap"),
          style: "normal",
          weight: 700,
        },
        {
          name: "Merriweather",
          data: await loadGoogleFont("Merriweather", "ital@1&display=swap"),
          style: "italic",
          weight: 400,
        },
      ],
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    }
  );
};
