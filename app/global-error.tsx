"use client";

import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error("[Global Error]", error);
  }, [error]);

  const handleRefresh = () => {
    window.location.href = "/dashboard";
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Harmonic Resonance Disrupted</title>
        <style>{`
          :root {
            --background: oklch(0.2673 0.0486 219.8169);
            --foreground: oklch(0.6979 0.0159 196.794);
            --card: oklch(0.3092 0.0518 219.6516);
            --primary: oklch(0.5924 0.2025 355.8943);
            --primary-foreground: oklch(1 0 0);
            --secondary: oklch(0.6437 0.1019 187.384);
            --accent: oklch(0.5808 0.1732 39.5003);
            --destructive: oklch(0.5863 0.2064 27.1172);
            --border: oklch(0.523 0.0283 219.1365);
            --font-sans: Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          html, body {
            width: 100%;
            height: 100%;
            font-family: var(--font-sans);
          }

          body {
            background: linear-gradient(135deg, color-mix(in srgb, var(--background) 90%, #000) 0%, color-mix(in srgb, var(--card) 80%, #000) 50%, color-mix(in srgb, var(--background) 95%, #000) 100%);
            color: var(--foreground);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            position: relative;
          }

          /* Animated background stars */
          .stars {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
          }

          .star {
            position: absolute;
            width: 1px;
            height: 1px;
            background: var(--foreground);
            border-radius: 50%;
            animation: twinkle 3s infinite;
          }

          @keyframes twinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }

          /* Main content container */
          .error-container {
            position: relative;
            z-index: 2;
            max-width: 600px;
            text-align: center;
            padding: 2rem;
          }

          .error-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 2rem;
            color: var(--destructive);
            animation: pulse 2s ease-in-out infinite;
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.05); }
          }

          .error-title {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, var(--destructive) 0%, var(--accent) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .error-subtitle {
            font-size: 1.1rem;
            color: color-mix(in srgb, var(--foreground) 80%, transparent);
            margin-bottom: 1.5rem;
            line-height: 1.6;
          }

          .error-lore {
            background: color-mix(in srgb, var(--destructive) 5%, transparent);
            border: 1px solid color-mix(in srgb, var(--destructive) 20%, transparent);
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            font-size: 0.95rem;
            line-height: 1.7;
            color: color-mix(in srgb, var(--foreground) 90%, transparent);
            font-style: italic;
          }

          .error-code {
            font-family: "Courier New", monospace;
            font-size: 0.85rem;
            color: color-mix(in srgb, var(--foreground) 60%, transparent);
            margin-top: 1rem;
            word-break: break-all;
          }

          .button-group {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 2rem;
          }

          .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
            text-decoration: none;
          }

          .btn-primary {
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
            color: var(--primary-foreground);
            box-shadow: 0 0 20px color-mix(in srgb, var(--primary) 30%, transparent);
          }

          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px color-mix(in srgb, var(--primary) 50%, transparent);
          }

          .btn-secondary {
            background: color-mix(in srgb, var(--destructive) 10%, transparent);
            color: var(--destructive);
            border: 1px solid color-mix(in srgb, var(--destructive) 30%, transparent);
          }

          .btn-secondary:hover {
            background: color-mix(in srgb, var(--destructive) 20%, transparent);
            transform: translateY(-2px);
          }

          @media (max-width: 640px) {
            .error-title {
              font-size: 1.8rem;
            }

            .error-subtitle {
              font-size: 1rem;
            }

            .error-container {
              padding: 1.5rem;
            }

            .button-group {
              gap: 0.75rem;
            }

            .btn {
              padding: 0.65rem 1.25rem;
              font-size: 0.9rem;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="stars" id="stars"></div>

        <div className="error-container">
          <div className="error-icon">
            <AlertTriangle size={80} strokeWidth={1.5} />
          </div>

          <h1 className="error-title">Harmonic Resonance Disrupted</h1>
          <p className="error-subtitle">
            The Lattice has encountered a dimensional anomaly. Your signal has
            been temporarily lost.
          </p>

          <div className="error-lore">
            &quot;The Lattice trembles with discord. An unexpected frequency
            cascade has rippled through the resonance network. Fear not,
            Pioneer—the Harmonic Council works to restore equilibrium. Return to
            the Resonance Hub to recalibrate your position in the cosmos.&quot;
          </div>

          {error?.digest && (
            <div className="error-code">Diagnostic ID: {error.digest}</div>
          )}

          <div className="button-group">
            <button className="btn btn-primary" onClick={handleRefresh}>
              <Home size={18} />
              Return to Hub
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={18} />
              Recalibrate
            </button>
          </div>
        </div>

        <script>{`
          // Generate random stars
          const starsContainer = document.getElementById('stars');
          for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 3 + 's';
            starsContainer.appendChild(star);
          }
        `}</script>
      </body>
    </html>
  );
}
