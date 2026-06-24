export const EXTERNAL_PROJECTS = {
  cosDesign: {
    label: "cos-design",
    previewUrl: "https://jiaxiantao.github.io/cos-design/",
    repoUrl: "https://github.com/jiaxiantao/cos-design",
  },
  teamDocs: {
    label: "team-docs",
    previewUrl: "https://jiaxiantao.github.io/team-docs/",
    repoUrl: "https://github.com/jiaxiantao/team-docs",
  },
  expressWarehouse: {
    label: "3D 快递仓储",
    previewUrl: "https://jiaxiantao.github.io/3d-express-warehouse/warehouse/",
    repoUrl: "https://github.com/jiaxiantao/3d-express-warehouse",
  },
  carShowroom: {
    label: "3D看车",
    previewUrl: "https://jiaxiantao.github.io/3d-car-viewing/",
    repoUrl: "https://github.com/jiaxiantao/3d-car-viewing",
  },
  homeAgent: {
    label: "Home Agent",
    previewUrl: "https://jiaxiantao.github.io/home-agent/",
    repoUrl: "https://github.com/jiaxiantao/home-agent",
  },
  aiMyHome: {
    label: "ai-my-home",
    previewUrl: "https://jiaxiantao.github.io/ai-my-home/",
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
] as const;

/** 导航「Agents」入口：GitHub Pages 根地址 */
export const HOME_AGENT_AGENTS_URL = EXTERNAL_PROJECTS.homeAgent.previewUrl;

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
