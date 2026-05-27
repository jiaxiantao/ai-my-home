import { ImageResponse } from "next/og";

import { getPublishedNoteBySlug } from "@/lib/notes-service";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = await getPublishedNoteBySlug(slug);

  const title = note?.title ?? "Notes";
  const subtitle =
    note?.summary ??
    "A public note from my frontend systems workbench and knowledge base.";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background:
            "linear-gradient(135deg, #020617 0%, #0f172a 45%, #164e63 100%)",
          color: "white",
          padding: 64,
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            padding: "10px 18px",
            borderRadius: 999,
            background: "rgba(34, 211, 238, 0.12)",
            color: "#cffafe",
            fontSize: 24,
          }}
        >
          Notes
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 58,
              fontWeight: 700,
              lineHeight: 1.16,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              lineHeight: 1.5,
              color: "#cbd5e1",
              maxWidth: 980,
            }}
          >
            {subtitle}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 26, color: "#94a3b8" }}>
          XJ / FRONTEND SYSTEMS
        </div>
      </div>
    ),
    size,
  );
}

