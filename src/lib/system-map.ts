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
      summary: "首页看板聚合 overview / knowledge / analytics",
    },
    {
      label: "Notes 检索",
      href: "/api/notes/search?q=架构",
      kind: "api",
      summary: "pg_trgm 或 memory 引擎可切换",
    },
    {
      label: "Sitemap",
      file: "src/app/sitemap.ts",
      kind: "file",
      summary: "静态页 + 领域 + 案例 + 笔记动态条目",
    },
    {
      label: "Notes 详情",
      href: "/notes",
      kind: "route",
      summary: "Markdown 渲染 + Assistant 深链",
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
      label: "Chat SSE",
      href: "/api/chat",
      kind: "api",
      summary: "references → chunk → done，含 meta 遥测",
    },
    {
      label: "Assistant",
      href: "/assistant",
      kind: "route",
      summary: "RAG 对话 + 可观测面板",
    },
    {
      label: "Health",
      href: "/api/health",
      kind: "api",
      summary: "DB / LLM / pg_trgm 就绪探测",
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
  ],
};
