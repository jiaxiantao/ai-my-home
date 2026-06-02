"use client";

import dynamic from "next/dynamic";

import {
  LazyNotesTimelineChart,
  LazyTagDistributionChart,
} from "@/components/charts/lazy-viz-charts";
import type { NoteAnalytics } from "@/lib/note-analytics";
import type { DomainDetail } from "@/lib/site-content";

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
  analytics,
  domains,
}: {
  analytics: NoteAnalytics;
  domains: DomainDetail[];
}) {
  const sceneNodes = domains.slice(0, 6).map((domain, index) => ({
    id: domain.slug,
    label: domain.title.slice(0, 4),
    color: sceneColors[index % sceneColors.length],
  }));

  const timelineData =
    analytics.notesByMonth.length > 0
      ? analytics.notesByMonth
      : [{ month: new Date().toISOString().slice(0, 7), count: 0 }];

  const tagData =
    analytics.tagDistribution.length > 0
      ? analytics.tagDistribution
      : [{ tag: "empty", count: 0 }];

  return (
    <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <SystemsScene nodes={sceneNodes.length ? sceneNodes : undefined} />

      <div className="grid gap-4">
        <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/90 p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/75">
              PostgreSQL · unnest(tags)
            </p>
            <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] text-slate-400">
              {analytics.source}
            </span>
          </div>
          <LazyTagDistributionChart data={tagData} />
        </article>

        <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/90 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/75">
            PostgreSQL · date_trunc(month)
          </p>
          <LazyNotesTimelineChart data={timelineData} />
        </article>

        <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-slate-400">
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            notes {analytics.stats.totalNotes}
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            avg len {analytics.stats.avgContentLength}
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            domains {analytics.stats.domainCount}
          </div>
        </div>

        <a
          href="/api/analytics/notes"
          className="font-mono text-xs text-cyan-200/80 transition hover:text-cyan-100"
        >
          GET /api/analytics/notes →
        </a>
      </div>
    </div>
  );
}
