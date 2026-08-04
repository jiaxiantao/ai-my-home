import { EXTERNAL_PROJECTS, HOME_AGENT_AGENTS_URL, KNOWLEDGE_STUDIO_URL } from "@/lib/external-projects";

export type SystemArtifact = {
  label: string;
  href?: string;
  file?: string;
  kind: "route" | "api" | "file";
  summary: string;
};

export const architectureSystemMap: Record<string, SystemArtifact[]> = {
  "content-platform": [
    {
      label: "Dashboard BFF",
      href: "/api/dashboard",
      kind: "api",
      summary: "首页看板聚合 overview / release / intelligence",
    },
    {
      label: "Knowledge Studio 检索",
      href: `${KNOWLEDGE_STUDIO_URL}api/notes/search?q=架构`,
      kind: "api",
      summary: "独立项目：pg_trgm 或 memory 引擎可切换",
    },
    {
      label: "Sitemap",
      file: "src/app/sitemap.ts",
      kind: "file",
      summary: "静态页 + 领域 + 案例条目",
    },
    {
      label: "Notes 详情",
      href: `${KNOWLEDGE_STUDIO_URL}notes/`,
      kind: "route",
      summary: "Markdown 渲染 + Assistant 深链（独立项目）",
    },
  ],
  "admin-workbench": [
    {
      label: "Profile BFF",
      href: "/api/profile",
      kind: "api",
      summary: "domains / cases / demo-lab 配置一次拉齐",
    },
    {
      label: "Demo Lab",
      href: "/#demo-lab",
      kind: "route",
      summary: "架构 / 性能 / 工作流判断台",
    },
    {
      label: "Case Studies",
      href: "/cases",
      kind: "route",
      summary: "可核对 proofLines 的交付样例",
    },
  ],
  "ai-ops-system": [
    {
      label: "Knowledge Studio Chat",
      href: `${KNOWLEDGE_STUDIO_URL}api/chat`,
      kind: "api",
      summary: "references → meta → chunk → done（独立项目）",
    },
    {
      label: "Assistant",
      href: "/assistant",
      kind: "route",
      summary: "跳转 Knowledge Studio 对话工作台",
    },
    {
      label: "Home Agent（独立项目）",
      href: HOME_AGENT_AGENTS_URL,
      kind: "route",
      summary: "规划 → 工具调用 → SSE trace（GitHub Pages 在线演示）",
    },
    {
      label: "端侧 AI",
      href: "/#edge-ai",
      kind: "route",
      summary: "Transformers.js · WASM · MediaPipe",
    },
    {
      label: "Health",
      href: "/api/health",
      kind: "api",
      summary: "DB / LLM / Release 就绪探测",
    },
  ],
  "multi-end-product": [
    {
      label: "大前端 Demo",
      href: "/#cross-platform",
      kind: "route",
      summary: "H5 / 小程序 / 桌面可切换面板",
    },
    {
      label: "Cross-Platform 领域",
      href: "/domains/cross-platform-frontend",
      kind: "route",
      summary: "多端能力域完整拆解",
    },
    {
      label: "多端案例",
      href: "/cases/cross-platform-delivery",
      kind: "route",
      summary: "同构与发布治理实践",
    },
    {
      label: "3D 看车（独立项目）",
      href: EXTERNAL_PROJECTS.carShowroom.previewUrl,
      kind: "route",
      summary: "WebGL 展厅与 GLB 部件交互（见 3d-car-viewing 仓库）",
    },
  ],
};
