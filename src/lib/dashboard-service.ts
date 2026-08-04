import {
  buildCapabilityScores,
  type CapabilityProfileScores,
} from "@/lib/capability-scores";
import {
  HOME_AGENT_AGENTS_URL,
  KNOWLEDGE_STUDIO_URL,
} from "@/lib/external-projects";
import { getHomepageContent } from "@/lib/content-service";
import { insightArticles } from "@/lib/editorial-content";
import { currentTracks, workLogs } from "@/lib/ongoing-content";
import { buildIntelligenceSamplePrompts } from "@/lib/intelligence-samples";
import { getLlmLabel, isLlmConfigured } from "@/lib/llm-config";
import { getReleaseSummary, type ReleaseSummary } from "@/lib/release-service";

export type DashboardIntelligence = {
  llmConfigured: boolean;
  llmLabel: string;
  features: Array<{ id: string; label: string; href: string }>;
  samplePrompts: string[];
};

export type DashboardFlowNode = {
  id: string;
  label: string;
  description: string;
  status: "live" | "curated" | "interactive";
};

export type DashboardContentStats = {
  domainCount: number;
  topicCount: number;
  caseStudyCount: number;
};

export type DashboardData = {
  generatedAt: string;
  overview: {
    domainsCount: number;
    caseStudiesCount: number;
    tracksCount: number;
    demoCapabilitiesCount: number;
  };
  knowledge: {
    externalUrl: string;
    repoUrl: string;
    label: string;
    summary: string;
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
  contentStats: DashboardContentStats;
  capabilityProfile: CapabilityProfileScores;
  release: ReleaseSummary;
  intelligence: DashboardIntelligence;
};

type HomepageContent = Awaited<ReturnType<typeof getHomepageContent>>;

function safeDashboardLlmLabel() {
  try {
    return getLlmLabel();
  } catch {
    return "unconfigured";
  }
}

function countTopics(domains: HomepageContent["domains"]) {
  return domains.reduce((sum, domain) => sum + domain.topics.length, 0);
}

export async function getDashboardData(
  preloaded?: HomepageContent,
): Promise<DashboardData> {
  const [{ domains, caseStudies }, release] = await Promise.all([
    preloaded ? Promise.resolve(preloaded) : getHomepageContent(),
    getReleaseSummary(),
  ]);
  const featuredInsight = insightArticles.find((a) => a.featured);
  const featuredCase = caseStudies[0];

  const flow: DashboardFlowNode[] = [
    {
      id: "profile",
      label: "Profile & BFF",
      description: "结构化 profile、metrics、domains 经 /api/profile 聚合输出",
      status: "live",
    },
    {
      id: "notes",
      label: "Knowledge Studio",
      description: "独立项目：PostgreSQL 笔记库 · pg_trgm 检索 · Grounded Assistant",
      status: "live",
    },
    {
      id: "chat",
      label: "Grounded Chat",
      description: "笔记召回 + SSE 流式对话（Knowledge Studio）",
      status: "interactive",
    },
    {
      id: "composer",
      label: "Front Intelligence",
      description: "浏览器内意图识别、Prompt 改写与偏好模板",
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
    {
      id: "release",
      label: "Release Center",
      description: `${release.orderCount} 张发布单 · 构建 · 测试/预发/生产门禁 · 审计与回滚`,
      status: "interactive",
    },
  ];

  const overview = {
    domainsCount: domains.length,
    caseStudiesCount: caseStudies.length,
    tracksCount: currentTracks.length,
    demoCapabilitiesCount: 12,
  };

  return {
    generatedAt: new Date().toISOString(),
    overview,
    knowledge: {
      externalUrl: KNOWLEDGE_STUDIO_URL,
      repoUrl: "https://github.com/jiaxiantao/knowledge-studio",
      label: "Knowledge Studio",
      summary: "笔记 CRUD · pg_trgm 检索 · 双引擎对比 · Grounded Assistant",
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
    contentStats: {
      domainCount: domains.length,
      topicCount: countTopics(domains),
      caseStudyCount: caseStudies.length,
    },
    capabilityProfile: buildCapabilityScores({
      notesCount: 0,
      publishedNotesCount: 0,
      ...overview,
      releaseOrderCount: release.orderCount,
      llmConfigured: isLlmConfigured(),
      releaseStorePostgres: release.storeMode === "postgresql",
    }),
    release,
    intelligence: {
      llmConfigured: isLlmConfigured(),
      llmLabel: safeDashboardLlmLabel(),
      features: [
        { id: "composer", label: "Prompt 编排台", href: "/#front-intelligence" },
        { id: "edge-ai", label: "端侧推理", href: "/#edge-ai" },
        {
          id: "assistant",
          label: "笔记增强对话",
          href: `${KNOWLEDGE_STUDIO_URL}assistant/`,
        },
        { id: "agents", label: "Agent 工具循环", href: HOME_AGENT_AGENTS_URL },
      ],
      samplePrompts: buildIntelligenceSamplePrompts([], caseStudies),
    },
  };
}
