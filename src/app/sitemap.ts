import type { MetadataRoute } from "next";

import { insightArticles } from "@/lib/editorial-content";
import { listPublishedNotes } from "@/lib/notes-service";
import { caseStudies, domainDetails } from "@/lib/site-content";

const staticPaths = [
  "",
  "/notes",
  "/assistant",
  "/cases",
  "/experience",
  "/insights",
  "/now",
  "/playbooks",
  "/resume",
  "/status",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const now = new Date();

  const staticEntries = staticPaths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const domainEntries = domainDetails.map((domain) => ({
    url: `${base}/domains/${domain.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const caseEntries = caseStudies.map((item) => ({
    url: `${base}/cases/${item.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  const insightEntries = insightArticles.map((item) => ({
    url: `${base}/insights/${item.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  const publishedNotes = await listPublishedNotes();
  const noteEntries = publishedNotes.map((note) => ({
    url: `${base}/notes/${note.slug}`,
    lastModified: new Date(note.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.55,
  }));

  return [
    ...staticEntries,
    ...domainEntries,
    ...caseEntries,
    ...insightEntries,
    ...noteEntries,
  ];
}
