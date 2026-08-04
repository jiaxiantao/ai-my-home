const SITE = "https://jiaxiantao.xyz";

export const EXTERNAL_PROJECTS = {
  cosDesign: {
    label: "cos-design",
    previewUrl: `${SITE}/cos-design/`,
    repoUrl: "https://github.com/jiaxiantao/cos-design",
  },
  teamDocs: {
    label: "team-docs",
    previewUrl: `${SITE}/team-docs/`,
    repoUrl: "https://github.com/jiaxiantao/team-docs",
  },
  expressWarehouse: {
    label: "3D 快递仓储",
    previewUrl: `${SITE}/3d-express-warehouse/warehouse/`,
    repoUrl: "https://github.com/jiaxiantao/3d-express-warehouse",
  },
  carShowroom: {
    label: "3D看车",
    previewUrl: `${SITE}/3d-car-viewing/`,
    repoUrl: "https://github.com/jiaxiantao/3d-car-viewing",
  },
  homeAgent: {
    label: "Home Agent",
    previewUrl: `${SITE}/home-agent/`,
    repoUrl: "https://github.com/jiaxiantao/home-agent",
  },
  blogs: {
    label: "博客",
    previewUrl: `${SITE}/blogs/`,
    repoUrl: "https://github.com/jiaxiantao/blogs",
  },
  knowledgeStudio: {
    label: "Knowledge Studio",
    previewUrl: `${SITE}/knowledge-studio/`,
    repoUrl: "https://github.com/jiaxiantao/knowledge-studio",
  },
  aiMyHome: {
    label: "ai-my-home",
    previewUrl: `${SITE}/ai-my-home/`,
    repoUrl: "https://github.com/jiaxiantao/ai-my-home",
  },
} as const;

/** 导航「平台体验」下拉：外部在线演示 */
export const PLATFORM_EXPERIENCE_NAV = [
  EXTERNAL_PROJECTS.cosDesign,
  EXTERNAL_PROJECTS.teamDocs,
  EXTERNAL_PROJECTS.expressWarehouse,
  EXTERNAL_PROJECTS.carShowroom,
  EXTERNAL_PROJECTS.homeAgent,
  EXTERNAL_PROJECTS.blogs,
] as const;

/** 导航「Agents」入口 */
export const HOME_AGENT_AGENTS_URL = EXTERNAL_PROJECTS.homeAgent.previewUrl;

/** 导航「Notes / Assistant」入口（独立知识库项目） */
export const KNOWLEDGE_STUDIO_URL = EXTERNAL_PROJECTS.knowledgeStudio.previewUrl;

export function buildKnowledgeStudioUrl(path = "", query?: string) {
  const trimmedPath = path.replace(/^\//, "");
  const base = EXTERNAL_PROJECTS.knowledgeStudio.previewUrl;
  const url = new URL(
    trimmedPath,
    base.endsWith("/") ? base : `${base}/`,
  );

  const trimmedQuery = query?.trim();
  if (trimmedQuery) {
    url.searchParams.set("q", trimmedQuery);
  }

  return url.toString();
}

export function buildExternalAgentUrl(query?: string) {
  const trimmed = query?.trim();
  const base = EXTERNAL_PROJECTS.homeAgent.previewUrl;

  if (!trimmed) {
    return base;
  }

  const url = new URL(base.endsWith("/") ? base : `${base}/`);
  url.searchParams.set("q", trimmed);
  return url.toString();
}
