"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Bot,
  Database,
  GitBranch,
  Gauge,
  Layers,
} from "lucide-react";

import {
  LazyDeliveryFlowSankey,
  LazyNotesTimelineChart,
  LazySystemRadarChart,
  LazyTagDistributionChart,
} from "@/components/charts/lazy-dashboard-charts";
import { DashboardAssistantPreview } from "@/components/dashboard-assistant-preview";
import { DashboardDecisionWidget } from "@/components/dashboard-decision-widget";
import type { DashboardData } from "@/lib/dashboard-service";

type DashboardPanelId =
  | "overview"
  | "knowledge"
  | "flow"
  | "assistant"
  | "decision";

const panels: Array<{
  id: DashboardPanelId;
  label: string;
  summary: string;
  icon: typeof Layers;
}> = [
  {
    id: "overview",
    label: "System Overview",
    summary: "聚合指标与当前主线",
    icon: Layers,
  },
  {
    id: "knowledge",
    label: "Knowledge Base",
    summary: "笔记健康度与标签分布",
    icon: Database,
  },
  {
    id: "flow",
    label: "Live Delivery Flow",
    summary: "Profile → Notes → Chat → Cases",
    icon: GitBranch,
  },
  {
    id: "assistant",
    label: "Grounded Assistant",
    summary: "笔记检索 + 轻量问答",
    icon: Bot,
  },
  {
    id: "decision",
    label: "Decision Engine",
    summary: "性能治理优先级判断",
    icon: Gauge,
  },
];

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function FullstackDashboard({
  data,
  llmLabel,
}: {
  data: DashboardData;
  llmLabel?: string;
}) {
  const [activePanel, setActivePanel] = useState<DashboardPanelId>("overview");
  const { overview, knowledge, flow, featured, currentTracks, recentLogs, analytics } =
    data;

  const timelineData =
    analytics.notesByMonth.length > 0
      ? analytics.notesByMonth
      : [{ month: new Date().toISOString().slice(0, 7), count: 0 }];

  const tagChartData =
    knowledge.tagCounts.length > 0
      ? knowledge.tagCounts
      : [{ tag: "—", count: 0 }];

  const metricCards = [
    { label: "Notes", value: overview.notesCount, detail: "PostgreSQL" },
    { label: "Domains", value: overview.domainsCount, detail: "能力域" },
    { label: "Cases", value: overview.caseStudiesCount, detail: "结构化案例" },
    { label: "Tracks", value: overview.tracksCount, detail: "当前主线" },
    {
      label: "Demo Lab",
      value: overview.demoCapabilitiesCount,
      detail: "交互实验台",
    },
  ];

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-white/10 bg-slate-950/80 px-6 py-4">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-cyan-300" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
              Live System
            </p>
            <p className="text-sm text-slate-400">
              数据来自 /api/dashboard · 更新 {formatDate(data.generatedAt)}
            </p>
          </div>
        </div>
        <a
          href="/api/dashboard"
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-white/25"
        >
          打开 Dashboard JSON
        </a>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        {panels.map((panel) => {
          const Icon = panel.icon;
          const isActive = panel.id === activePanel;

          return (
            <button
              key={panel.id}
              type="button"
              onClick={() => setActivePanel(panel.id)}
              className={`rounded-[1.5rem] border p-4 text-left transition ${
                isActive
                  ? "border-cyan-300/35 bg-cyan-300/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${isActive ? "text-cyan-200" : "text-slate-400"}`}
              />
              <p className="mt-3 text-sm font-semibold text-white">{panel.label}</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">{panel.summary}</p>
            </button>
          );
        })}
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 md:p-8">
        {activePanel === "overview" ? (
          <div className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {metricCards.map((metric) => (
                <article
                  key={metric.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    {metric.value}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">{metric.detail}</p>
                </article>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/75">
                  ECharts · 系统规模
                </p>
                <LazySystemRadarChart
                  values={{
                    notes: overview.notesCount,
                    domains: overview.domainsCount,
                    cases: overview.caseStudiesCount,
                    tracks: overview.tracksCount,
                    demos: overview.demoCapabilitiesCount,
                  }}
                />
              </article>

              <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/75">
                  Prisma · 库表计数
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 font-mono text-sm">
                  <div className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-300">
                    Note
                    <p className="mt-1 text-2xl font-semibold text-white tabular-nums">
                      {analytics.stats.totalNotes}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-300">
                    Domain
                    <p className="mt-1 text-2xl font-semibold text-white tabular-nums">
                      {analytics.stats.domainCount}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-300">
                    Topic
                    <p className="mt-1 text-2xl font-semibold text-white tabular-nums">
                      {analytics.stats.topicCount}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-300">
                    CaseStudy
                    <p className="mt-1 text-2xl font-semibold text-white tabular-nums">
                      {analytics.stats.caseStudyCount}
                    </p>
                  </div>
                </div>
                <p className="mt-3 font-mono text-[10px] text-slate-500">
                  source: {analytics.source} · avg content{" "}
                  {analytics.stats.avgContentLength} chars
                </p>
              </article>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/75">
                  Current Tracks
                </p>
                <div className="mt-4 grid gap-3">
                  {currentTracks.map((track) => (
                    <div
                      key={track.slug}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3"
                    >
                      <span className="text-sm font-medium text-white">
                        {track.title}
                      </span>
                      <span className="text-xs text-slate-500">{track.status}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/now"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200"
                >
                  Now 页面
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>

              <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/75">
                  Recent Logs
                </p>
                <div className="mt-4 grid gap-3">
                  {recentLogs.map((log) => (
                    <div
                      key={`${log.date}-${log.title}`}
                      className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3"
                    >
                      <div className="flex justify-between gap-2 text-xs text-slate-500">
                        <span>{log.date}</span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-white">{log.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        {log.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            <div className="flex flex-wrap gap-3">
              {featured.caseSlug ? (
                <Link
                  href={`/cases/${featured.caseSlug}`}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/30"
                >
                  精选案例 →
                </Link>
              ) : null}
              {featured.insightSlug ? (
                <Link
                  href={`/insights/${featured.insightSlug}`}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/30"
                >
                  精选文章 →
                </Link>
              ) : null}
              <a
                href="/api/profile"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/30"
              >
                Profile BFF JSON →
              </a>
            </div>
          </div>
        ) : null}

        {activePanel === "knowledge" ? (
          <div className="grid gap-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/75">
                  ECharts · 标签分布
                </p>
                <LazyTagDistributionChart data={tagChartData} />
              </article>
              <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/75">
                  ECharts · 按月更新
                </p>
                <LazyNotesTimelineChart data={timelineData} />
              </article>
            </div>

            <div className="grid gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/75">
                Recent Notes
              </p>
              {knowledge.recentNotes.length ? (
                knowledge.recentNotes.map((note) => (
                  <Link
                    key={note.id}
                    href={`/notes/${note.slug}`}
                    className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold text-white">{note.title}</h3>
                      <span className="shrink-0 text-xs text-slate-500">
                        {formatDate(note.updatedAt)}
                      </span>
                    </div>
                    {note.summary ? (
                      <p className="mt-2 text-sm leading-6 text-slate-400 line-clamp-2">
                        {note.summary}
                      </p>
                    ) : null}
                  </Link>
                ))
              ) : (
                <p className="text-sm text-slate-500">暂无笔记，可在 Notes 页创建。</p>
              )}
              <Link
                href="/notes"
                className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200"
              >
                笔记库
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : null}

        {activePanel === "flow" ? (
          <div className="grid gap-6">
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/75">
                ECharts · Sankey 交付链路
              </p>
              <LazyDeliveryFlowSankey
                notesCount={overview.notesCount}
                domainsCount={overview.domainsCount}
                caseStudiesCount={overview.caseStudiesCount}
              />
            </article>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {flow.map((node, index) => (
                <article
                  key={node.id}
                  className="relative rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <span className="text-xs font-semibold text-cyan-300/80">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-white">{node.label}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                        node.status === "live"
                          ? "bg-emerald-400/15 text-emerald-200"
                          : node.status === "interactive"
                            ? "bg-cyan-400/15 text-cyan-200"
                            : "bg-slate-500/20 text-slate-300"
                      }`}
                    >
                      {node.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {node.description}
                  </p>
                </article>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-slate-500">
              <span>profile</span>
              <span>→</span>
              <span>notes</span>
              <span>→</span>
              <span>chat</span>
              <span>→</span>
              <span>cases / insights</span>
            </div>
          </div>
        ) : null}

        {activePanel === "assistant" ? (
          <DashboardAssistantPreview llmLabel={llmLabel} />
        ) : null}

        {activePanel === "decision" ? <DashboardDecisionWidget /> : null}
      </div>
    </div>
  );
}
