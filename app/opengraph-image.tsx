import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt     = "Warsha+ — Auto Parts Marketplace Qatar";
export const size    = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,85,0,0.15) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Grid lines decoration */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,85,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,85,0,0.04) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "#ff5500",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 28,
            boxShadow: "0 16px 48px rgba(255,85,0,0.45)",
          }}
        >
          {/* Car icon SVG */}
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 11l1.5-4.5h11L19 11M5 11H3v2h2m14 0h2v-2h-2m-14 0h14M7 15a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Brand name */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: "#ff5500",
            letterSpacing: "-2px",
            lineHeight: 1,
            marginBottom: 16,
          }}
        >
          Warsha+
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 26,
            color: "#e5e7eb",
            fontWeight: 600,
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          Qatar's #1 Auto Parts Marketplace
        </div>

        {/* Sub tagline */}
        <div
          style={{
            fontSize: 18,
            color: "#6b7280",
            marginBottom: 48,
            textAlign: "center",
          }}
        >
          2,000+ verified sellers · Doha &amp; beyond
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 32,
            alignItems: "center",
          }}
        >
          {[
            { label: "Parts Listed", value: "50K+" },
            { label: "Verified Sellers", value: "2K+" },
            { label: "Categories", value: "120+" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,85,0,0.25)",
                borderRadius: 16,
                padding: "16px 28px",
              }}
            >
              <span style={{ fontSize: 30, fontWeight: 900, color: "#ff5500" }}>{stat.value}</span>
              <span style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* URL badge */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,85,0,0.12)",
            border: "1px solid rgba(255,85,0,0.3)",
            borderRadius: 100,
            padding: "8px 20px",
            color: "#ff5500",
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          🌐 warsha.plus
        </div>
      </div>
    ),
    { ...size },
  );
}
