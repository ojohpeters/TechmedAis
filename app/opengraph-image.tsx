import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "TECHMED AIS Brainstorming — Think Smart. Perform Elite.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Branded 1200×630 link-share card, generated on the edge (no binary asset needed).
export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#0A1628",
          backgroundImage:
            "radial-gradient(circle at 88% 6%, rgba(0,212,255,0.22), transparent 45%), radial-gradient(circle at 4% 100%, rgba(0,102,204,0.32), transparent 50%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 84,
              height: 84,
              borderRadius: 20,
              background: "linear-gradient(135deg, #0066CC, #00D4FF)",
              fontSize: 38,
              fontWeight: 800,
              letterSpacing: 1,
            }}
          >
            TMS
          </div>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 800, letterSpacing: 6 }}>TECHMED</div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>
            Ace your Post-UTME.
          </div>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 800, color: "#00D4FF", lineHeight: 1.05 }}>
            Think Smart. Perform Elite.
          </div>
          <div style={{ display: "flex", marginTop: 12, fontSize: 30, color: "#94A3B8" }}>
            Real past questions · Timed CBT · Streaks · Leaderboards
          </div>
        </div>

        {/* Footer pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {["📚 Past questions", "🔥 Daily streaks", "🏆 Ranks", "📶 Works offline"].map((p) => (
            <div
              key={p}
              style={{
                display: "flex",
                padding: "12px 22px",
                borderRadius: 999,
                fontSize: 26,
                color: "#CBD5E1",
                border: "1px solid rgba(255,255,255,0.14)",
                backgroundColor: "rgba(255,255,255,0.05)",
              }}
            >
              {p}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
