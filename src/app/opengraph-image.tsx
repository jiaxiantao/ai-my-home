import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background:
            "linear-gradient(135deg, #020617 0%, #0f172a 55%, #082f49 100%)",
          color: "white",
          padding: 64,
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#94a3b8",
          }}
        >
          XJ / FRONTEND SYSTEMS
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700, lineHeight: 1.12 }}>
            Senior Frontend Engineer
          </div>
          <div style={{ display: "flex", fontSize: 32, lineHeight: 1.5, color: "#cbd5e1", maxWidth: 900 }}>
            Turning architecture, engineering quality and product thinking into reusable systems.
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, color: "#67e8f9", fontSize: 26 }}>
          <div>Architecture</div>
          <div>Engineering</div>
          <div>Performance</div>
          <div>AI Workflow</div>
        </div>
      </div>
    ),
    size,
  );
}
