"use client";

import dynamic from "next/dynamic";

import { KNOWLEDGE_STUDIO_URL } from "@/lib/external-projects";
import type { DomainDetail } from "@/lib/site-content";
import type { DashboardContentStats } from "@/lib/dashboard-service";

const SystemsScene = dynamic(
  () =>
    import("@/components/systems-scene").then((mod) => mod.SystemsScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(420px,50vh)] items-center justify-center rounded-[1.75rem] border border-white/10 bg-slate-950 text-sm text-slate-500">
        加载 Three.js 场景…
      </div>
    ),
  },
);

const sceneColors = [
  "#22d3ee",
  "#34d399",
  "#a78bfa",
  "#fbbf24",
  "#fb7185",
  "#60a5fa",
];

export function SystemsVisualization({
  contentStats,
  domains,
}: {
  contentStats: DashboardContentStats;
  domains: DomainDetail[];
}) {
  const sceneNodes = domains.slice(0, 6).map((domain, index) => ({
    id: domain.slug,
    label: domain.title.slice(0, 4),
    color: sceneColors[index % sceneColors.length],
  }));

  return (
    <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <SystemsScene nodes={sceneNodes.length ? sceneNodes : undefined} />

      <div className="grid gap-4">
        <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/75">
            Knowledge Studio
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            笔记 CRUD、pg_trgm 检索与 Grounded Assistant 已抽离至独立项目。本站保留跳转入口。
          </p>
          <a
            href={KNOWLEDGE_STUDIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/20"
          >
            打开 Knowledge Studio →
          </a>
        </article>

        <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-slate-400">
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            domains {contentStats.domainCount}
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            topics {contentStats.topicCount}
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            cases {contentStats.caseStudyCount}
          </div>
        </div>
      </div>
    </div>
  );
}
