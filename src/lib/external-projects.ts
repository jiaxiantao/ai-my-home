export const EXTERNAL_PROJECTS = {
  carShowroom: {
    label: "3D看车",
    previewUrl: "https://jiaxiantao.github.io/3d-car-viewing/",
    repoUrl: "https://github.com/jiaxiantao/3d-car-viewing",
  },
  homeAgent: {
    label: "Agents",
    // 独立仓库暂未部署 GitHub Pages；部署后可将 previewUrl 改为 Pages 根地址
    previewUrl: "https://github.com/jiaxiantao/home-agent",
    repoUrl: "https://github.com/jiaxiantao/home-agent",
    agentsPath: "/agents",
  },
} as const;

export function buildExternalAgentUrl(query?: string) {
  const trimmed = query?.trim();
  const base = EXTERNAL_PROJECTS.homeAgent.previewUrl;

  if (!trimmed || base.startsWith("https://github.com/")) {
    return base;
  }

  const url = new URL(
    EXTERNAL_PROJECTS.homeAgent.agentsPath,
    base.endsWith("/") ? base : `${base}/`,
  );
  url.searchParams.set("q", trimmed);
  return url.toString();
}
