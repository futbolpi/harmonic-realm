import { ImageResponse } from "@vercel/og";

// Generate cosmic symbols based on type
export const getCosmicSymbol = (type: string) => {
  switch (type) {
    case "node":
      return "🌟";
    case "journal":
      return "📜";
    case "map":
      return "🗺️";
    case "dashboard":
      return "⚡";
    case "leaderboard":
      return "🥇";
    case "login":
      return "🔮";
    default:
      return "✨";
  }
};

type ImageResponseParams = {
  cosmicSymbol: "🌟" | "📜" | "🗺️" | "⚡" | "🔮" | "✨" | "🥇";
  nodeType: string | null;
  username: string | null;
  title: string;
  description: string;
};

// Define cosmic color palette
const colors = {
  primary: "#7c3aed",
  secondary: "#06b6d4",
  accent: "#f59e0b",
  background: "#0f0f23",
  text: "#e2e8f0",
  glow: "#8b5cf6",
};

export const getImageResponse = ({
  cosmicSymbol,
  nodeType,
  title,
  username,
  description,
}: ImageResponseParams) => {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${colors.background} 0%, #1a1a3a 50%, ${colors.primary}20 100%)`,
          position: "relative",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Cosmic background pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 20% 20%, ${colors.glow}30 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${colors.secondary}20 0%, transparent 50%), radial-gradient(circle at 40% 60%, ${colors.accent}15 0%, transparent 50%)`,
          }}
        />

        {/* Lattice grid overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `linear-gradient(${colors.primary}40 1px, transparent 1px), linear-gradient(90deg, ${colors.primary}40 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
            opacity: 0.3,
          }}
        />

        {/* Main content container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            zIndex: 10,
            padding: "60px",
            maxWidth: "900px",
          }}
        >
          {/* Cosmic symbol */}
          <div
            style={{
              fontSize: "120px",
              marginBottom: "30px",
              filter: `drop-shadow(0 0 20px ${colors.glow})`,
            }}
          >
            {cosmicSymbol}
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: nodeType ? "48px" : "64px",
              fontWeight: "bold",
              color: colors.text,
              marginBottom: "20px",
              textShadow: `0 0 30px ${colors.glow}`,
              background: `linear-gradient(135deg, ${colors.text} 0%, ${colors.glow} 50%, ${colors.secondary} 100%)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1.1,
            }}
          >
            {title}
          </h1>

          {/* Node type badge */}
          {nodeType && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: `${colors.primary}40`,
                border: `2px solid ${colors.primary}`,
                borderRadius: "25px",
                padding: "8px 20px",
                marginBottom: "20px",
                color: colors.text,
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              Echo Guardian Node • {nodeType}
            </div>
          )}

          {/* Username badge */}
          {username && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: `${colors.secondary}40`,
                border: `2px solid ${colors.secondary}`,
                borderRadius: "25px",
                padding: "8px 20px",
                marginBottom: "20px",
                color: colors.text,
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              Pioneer: {username}
            </div>
          )}

          {/* Description */}
          <p
            style={{
              fontSize: "28px",
              color: colors.text,
              opacity: 0.9,
              marginBottom: "40px",
              lineHeight: 1.4,
              maxWidth: "700px",
            }}
          >
            {description}
          </p>

          {/* HarmonicRealm branding */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              marginTop: "20px",
            }}
          >
            <div
              style={{
                fontSize: "40px",
              }}
            >
              🧭
            </div>
            <div
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: colors.text,
                textShadow: `0 0 20px ${colors.glow}`,
              }}
            >
              HarmonicRealm
            </div>
          </div>

          {/* Cosmic tagline */}
          <div
            style={{
              fontSize: "16px",
              color: colors.text,
              opacity: 0.7,
              marginTop: "10px",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            Resonate • Discover • Transcend
          </div>
        </div>

        {/* Floating cosmic elements */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "10%",
            fontSize: "24px",
            opacity: 0.6,
            transform: "rotate(-15deg)",
          }}
        >
          ⭐
        </div>
        <div
          style={{
            position: "absolute",
            top: "15%",
            right: "15%",
            fontSize: "20px",
            opacity: 0.5,
            transform: "rotate(25deg)",
          }}
        >
          🌙
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            left: "20%",
            fontSize: "18px",
            opacity: 0.4,
            transform: "rotate(45deg)",
          }}
        >
          💫
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "25%",
            right: "10%",
            fontSize: "22px",
            opacity: 0.6,
            transform: "rotate(-30deg)",
          }}
        >
          🔮
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
};
