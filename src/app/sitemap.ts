import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const base =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://jiaxiantao.xyz/ai-my-home";

const staticRoutes = [
  "",
  "/cases",
  "/insights",
  "/now",
  "/experience",
  "/playbooks",
  "/release-center",
  "/status",
  "/notes",
  "/assistant",
  "/agents",
  "/car-showroom",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return staticRoutes.map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
