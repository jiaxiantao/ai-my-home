import type { CapabilityProfileScores } from "@/lib/capability-scores";

export type CapabilityDimensionKey = keyof CapabilityProfileScores;

export type CapabilityDimensionMeta = {
  key: CapabilityDimensionKey;
  label: string;
  href: string;
  hint: string;
};

export const CAPABILITY_DIMENSIONS: CapabilityDimensionMeta[] = [
  {
    key: "fullstackApi",
    label: "全栈 API",
    href: "/notes",
    hint: "PostgreSQL 笔记 + CRUD + 检索",
  },
  {
    key: "engineeringDemos",
    label: "工程 Demo",
    href: "/#tech-demos",
    hint: "性能 / 网络 / Worker 等交互样例",
  },
  {
    key: "cicdRelease",
    label: "CI/CD",
    href: "/release-center",
    hint: "发布单 · 门禁 · 分环境",
  },
  {
    key: "edgeAi",
    label: "端侧 AI",
    href: "/#edge-ai",
    hint: "Transformers.js · WASM · Agent",
  },
  {
    key: "visualization",
    label: "3D 可视化",
    href: "/car-showroom",
    hint: "Three.js 看车与 ECharts 看板",
  },
  {
    key: "security",
    label: "安全治理",
    href: "/status",
    hint: "探活 · 限流 · 运行时诊断",
  },
];

export function listCapabilityDimensionScores(scores: CapabilityProfileScores) {
  return CAPABILITY_DIMENSIONS.map((dimension) => ({
    ...dimension,
    score: scores[dimension.key],
  })).sort((left, right) => right.score - left.score);
}
