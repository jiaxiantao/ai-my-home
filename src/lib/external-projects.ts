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
    agentsPath: "/agents",
  },
} as const;

export function buildExternalAgentUrl(query?: string) {
  const trimmed = query?.trim();
  const base = EXTERNAL_PROJECTS.homeAgent.previewUrl;

  const url = new URL(
    EXTERNAL_PROJECTS.homeAgent.agentsPath,
    base.endsWith("/") ? base : `${base}/`,
  );

  if (trimmed) {
    url.searchParams.set("q", trimmed);
  }

  return url.toString();
}

/** 直达 Agent 编排页（无 query） */
export const HOME_AGENT_AGENTS_URL = buildExternalAgentUrl();
