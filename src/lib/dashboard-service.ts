import { getHomepageContent } from "@/lib/content-service";
import { insightArticles } from "@/lib/editorial-content";
import { currentTracks, workLogs } from "@/lib/ongoing-content";
import { getNoteAnalytics, type NoteAnalytics } from "@/lib/note-analytics";
import { listPublishedNotes } from "@/lib/notes-service";

export type DashboardFlowNode = {
  id: string;
  label: string;
  description: string;
  status: "live" | "curated" | "interactive";
};

export type DashboardData = {
  generatedAt: string;
  overview: {
    notesCount: number;
    domainsCount: number;
    caseStudiesCount: number;
    tracksCount: number;
    publishedNotesCount: number;
    demoCapabilitiesCount: number;
  };
  knowledge: {
    recentNotes: Array<{
      id: string;
      title: string;
      slug: string;
      summary: string | null;
      tags: string[];
      updatedAt: string;
    }>;
    tagCounts: Array<{ tag: string; count: number }>;
    latestUpdate: string | null;
  };
  flow: DashboardFlowNode[];
  featured: {
    caseSlug: string | null;
    insightSlug: string | null;
  };
  currentTracks: Array<{
    slug: string;
    title: string;
    status: string;
  }>;
  recentLogs: Array<{
    date: string;
    title: string;
    summary: string;
  }>;
  analytics: NoteAnalytics;
};

type HomepageContent = Awaited<ReturnType<typeof getHomepageContent>>;

export async function getDashboardData(
  preloaded?: HomepageContent,
): Promise<DashboardData> {
  const [{ domains, caseStudies }, notes, analytics] = await Promise.all([
    preloaded ? Promise.resolve(preloaded) : getHomepageContent(),
    listPublishedNotes(),
    getNoteAnalytics(),
  ]);
  const featuredInsight = insightArticles.find((a) => a.featured);
  const featuredCase = caseStudies[0];

  const tagMap = new Map<string, number>();
  for (const note of notes) {
    for (const tag of note.tags) {
      tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
    }
  }

  const tagCounts = [...tagMap.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const latestNote = notes[0];
  const latestUpdate = latestNote?.updatedAt ?? null;

  const flow: DashboardFlowNode[] = [
    {
      id: "profile",
      label: "Profile & BFF",
      description: "结构化 profile、metrics、domains 经 /api/profile 聚合输出",
      status: "live",
    },
    {
      id: "notes",
      label: "PostgreSQL Notes",
      description: `${notes.length} 条笔记，支持 CRUD 与检索`,
      status: "live",
    },
    {
      id: "chat",
      label: "Grounded Chat",
      description: "笔记检索 + OpenAI 兼容接口生成回答",
      status: "interactive",
    },
    {
      id: "cases",
      label: "Case Studies",
      description: `${caseStudies.length} 个案例，问题 / 约束 / 结果结构`,
      status: "curated",
    },
    {
      id: "insights",
      label: "Insights",
      description: "文章与观点沉淀，偏长期复用",
      status: "curated",
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    overview: {
      notesCount: notes.length,
      domainsCount: domains.length,
      caseStudiesCount: caseStudies.length,
      tracksCount: currentTracks.length,
      publishedNotesCount: notes.filter((n) => n.isPublished).length,
      demoCapabilitiesCount: 4,
    },
    knowledge: {
      recentNotes: notes.slice(0, 5).map((n) => ({
        id: n.id,
        title: n.title,
        slug: n.slug,
        summary: n.summary,
        tags: n.tags,
        updatedAt: n.updatedAt,
      })),
      tagCounts,
      latestUpdate,
    },
    flow,
    featured: {
      caseSlug: featuredCase?.slug ?? null,
      insightSlug: featuredInsight?.slug ?? null,
    },
    currentTracks: currentTracks.slice(0, 2).map((t) => ({
      slug: t.slug,
      title: t.title,
      status: t.status,
    })),
    recentLogs: workLogs.slice(0, 3),
    analytics,
  };
}
