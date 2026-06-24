export const EXTERNAL_PROJECTS = {
  carShowroom: {
    label: "3D看车",
    previewUrl: "https://jiaxiantao.github.io/3d-car-viewing/",
    repoUrl: "https://github.com/jiaxiantao/3d-car-viewing",
  },
  homeAgent: {
    label: "Agents",
    previewUrl: "https://jiaxiantao.github.io/home-agent/",
    repoUrl: "https://github.com/jiaxiantao/home-agent",
  },
} as const;

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
