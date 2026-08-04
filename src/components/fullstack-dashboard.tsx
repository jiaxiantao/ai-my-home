"use client";

import dynamic from "next/dynamic";
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
  LazySystemRadarChart,
} from "@/components/charts/lazy-dashboard-charts";
import { ExternalProjectLink } from "@/components/external-project-link";
import { DashboardPanelMount } from "@/components/dashboard-panel-mount";
import { DashboardReleasePanel } from "@/components/dashboard-release-panel";
import { rememberHomeScrollForReturn } from "@/components/home-scroll-restoration";
import { BorderGlow } from "@/components/reactbits/border-glow";
import { CountUp } from "@/components/reactbits/count-up";
import { GlareHover } from "@/components/reactbits/glare-hover";
import { StarBorder } from "@/components/reactbits/star-border";
import type { DashboardData } from "@/lib/dashboard-service";
import { buildKnowledgeStudioUrl } from "@/lib/external-projects";
import { formatReleaseStoreMode } from "@/lib/release-store-labels";

function PanelLoading() {
  return (
    <div className="grid gap-3">
      <div className="h-10 animate-pulse rounded-xl bg-white/5" />
      <div className="h-48 animate-pulse rounded-2xl bg-white/5" />
    </div>
  );
}

const DashboardDecisionWidget = dynamic(
  () =>
    import("@/components/dashboard-decision-widget").then(
      (mod) => mod.DashboardDecisionWidget,
    ),
  { ssr: false, loading: PanelLoading },
);

type DashboardPanelId =
  | "overview"
  | "knowledge"
  | "flow"
  | "release"
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
    id: "release",
    label: "Release Pipeline",
    summary: "发布单状态与最近变更",
    icon: Activity,
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
  const {
    overview,
    knowledge,
    flow,
    featured,
    currentTracks,
    recentLogs,
    contentStats,
    release,
  } = data;

  const metricCards = [
    { label: "Domains", value: overview.domainsCount, detail: "能力域" },
    { label: "Cases", value: overview.caseStudiesCount, detail: "结构化案例" },
    { label: "Tracks", value: overview.tracksCount, detail: "当前主线" },
    {
      label: "Demo Lab",
      value: overview.demoCapabilitiesCount,
      detail: "交互实验台",
    },
    {
      label: "Release",
      value: release.orderCount,
      detail: `${release.appCount} 应用 · ${formatReleaseStoreMode(release.storeMode)}`,
    },
  ];

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-white/10 bg-slate-950/40 px-6 py-4">
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

      <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {panels.map((panel) => {
          const Icon = panel.icon;
          const isActive = panel.id === activePanel;

          return (
            <GlareHover
              key={panel.id}
              className="h-full min-h-0 w-full rounded-[1.5rem]"
              glareColor={isActive ? "#67e8f9" : "#ffffff"}
            >
              <button
                type="button"
                onClick={() => setActivePanel(panel.id)}
                className={`flex h-full w-full flex-col rounded-[1.5rem] border p-4 text-left transition ${
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
            </GlareHover>
          );
        })}
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-6 md:p-8">
        <DashboardPanelMount id="overview" active={activePanel}>
          <div className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              {metricCards.map((metric) => (
                <article
                  key={metric.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    <CountUp to={metric.value} duration={1.8} separator="," />
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
                    notes: 0,
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
                  <div className="rounded-xl border border-white/10 bg-slate-950/35 px-4 py-3 text-slate-300">
                    Domain
                    <p className="mt-1 text-2xl font-semibold text-white tabular-nums">
                      <CountUp to={contentStats.domainCount} duration={1.6} separator="," />
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-950/35 px-4 py-3 text-slate-300">
                    Topic
                    <p className="mt-1 text-2xl font-semibold text-white tabular-nums">
                      <CountUp to={contentStats.topicCount} duration={1.6} separator="," />
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-950/35 px-4 py-3 text-slate-300">
                    CaseStudy
                    <p className="mt-1 text-2xl font-semibold text-white tabular-nums">
                      <CountUp
                        to={contentStats.caseStudyCount}
                        duration={1.6}
                        separator=","
                      />
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-950/35 px-4 py-3 text-slate-300">
                    Notes
                    <p className="mt-1 text-sm font-semibold text-cyan-200">
                      Knowledge Studio →
                    </p>
                  </div>
                </div>
              </article>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/75">
                  Current Tracks
                </p>
                <div className="mt-4 grid gap-3">
                  {currentTracks.map((track) => (
                    <BorderGlow
                      key={track.slug}
                      className="rounded-xl"
                      glowColor="rgba(103, 232, 249, 0.22)"
                      backgroundColor="rgba(15, 23, 42, 0.35)"
                    >
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/35 px-4 py-3">
                        <span className="text-sm font-medium text-white">
                          {track.title}
                        </span>
                        <span className="text-xs text-slate-500">{track.status}</span>
                      </div>
                    </BorderGlow>
                  ))}
                </div>
                <StarBorder className="mt-4 self-start rounded-full" color="rgba(103, 232, 249, 0.82)">
                  <Link
                    href="/now"
                    className="inline-flex items-center gap-2 rounded-full bg-slate-950/95 px-3.5 py-1.5 text-sm font-semibold text-cyan-200"
                  >
                    Now 页面
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </StarBorder>
              </article>

              <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/75">
                  Recent Logs
                </p>
                <div className="mt-4 grid gap-3">
                  {recentLogs.map((log) => (
                    <BorderGlow
                      key={`${log.date}-${log.title}`}
                      className="rounded-xl"
                      glowColor="rgba(167, 139, 250, 0.2)"
                      backgroundColor="rgba(15, 23, 42, 0.35)"
                    >
                      <div className="rounded-xl border border-white/10 bg-slate-950/35 px-4 py-3">
                        <div className="flex justify-between gap-2 text-xs text-slate-500">
                          <span>{log.date}</span>
                        </div>
                        <p className="mt-1 text-sm font-medium text-white">{log.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-400">
                          {log.summary}
                        </p>
                      </div>
                    </BorderGlow>
                  ))}
                </div>
              </article>
            </div>

            <div className="flex flex-wrap gap-3">
              {featured.caseSlug ? (
                <Link
                  href={`/cases/${featured.caseSlug}`}
                  scroll={false}
                  onClick={rememberHomeScrollForReturn}
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
        </DashboardPanelMount>

        <DashboardPanelMount id="knowledge" active={activePanel}>
          <div className="grid gap-6">
            <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/75">
                {knowledge.label}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-400">{knowledge.summary}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <ExternalProjectLink
                  href={knowledge.externalUrl}
                  label="打开 Knowledge Studio"
                  className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100"
                />
                <a
                  href={buildKnowledgeStudioUrl("assistant")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-white/25"
                >
                  Grounded Assistant →
                </a>
              </div>
            </article>
          </div>
        </DashboardPanelMount>

        <DashboardPanelMount id="flow" active={activePanel}>
          <div className="grid gap-6">
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/75">
                ECharts · Sankey 交付链路
              </p>
              <LazyDeliveryFlowSankey
                notesCount={0}
                domainsCount={overview.domainsCount}
                caseStudiesCount={overview.caseStudiesCount}
              />
            </article>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {flow.map((node, index) => {
                const card = (
                  <>
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
                  </>
                );

                const flowHref =
                  node.id === "release"
                    ? "/release-center"
                    : node.id === "composer"
                      ? "/#front-intelligence"
                      : node.id === "chat"
                        ? buildKnowledgeStudioUrl("assistant")
                        : node.id === "notes"
                          ? buildKnowledgeStudioUrl("notes")
                          : null;

                if (flowHref) {
                  const isExternal =
                    node.id === "chat" || node.id === "notes";
                  return (
                    <BorderGlow
                      key={node.id}
                      className="rounded-2xl"
                      glowColor="rgba(103, 232, 249, 0.24)"
                      backgroundColor="rgba(2, 6, 23, 0.24)"
                    >
                      {isExternal ? (
                        <a
                          href={flowHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-cyan-300/30 hover:bg-cyan-300/5"
                        >
                          {card}
                        </a>
                      ) : (
                        <Link
                          href={flowHref}
                          className="relative block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-cyan-300/30 hover:bg-cyan-300/5"
                        >
                          {card}
                        </Link>
                      )}
                    </BorderGlow>
                  );
                }

                return (
                  <BorderGlow
                    key={node.id}
                    className="rounded-2xl"
                    glowColor="rgba(103, 232, 249, 0.2)"
                    backgroundColor="rgba(2, 6, 23, 0.24)"
                  >
                    <article className="relative rounded-2xl border border-white/10 bg-white/5 p-5">
                      {card}
                    </article>
                  </BorderGlow>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-slate-500">
              <span>profile</span>
              <span>→</span>
              <span>knowledge studio</span>
              <span>→</span>
              <span>chat</span>
              <span>→</span>
              <span>release center</span>
              <span>→</span>
              <span>cases / insights</span>
            </div>
          </div>
        </DashboardPanelMount>

        <DashboardPanelMount id="release" active={activePanel}>
          <DashboardReleasePanel release={release} />
        </DashboardPanelMount>

        <DashboardPanelMount id="assistant" active={activePanel}>
          <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/75">
              Grounded Assistant
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              笔记召回、SSE 流式对话与多会话能力已迁移至 Knowledge Studio。
              {llmLabel ? ` 当前 LLM：${llmLabel}` : ""}
            </p>
            <div className="mt-5">
              <ExternalProjectLink
                href={buildKnowledgeStudioUrl("assistant")}
                label="打开 Assistant"
                className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100"
              />
            </div>
          </article>
        </DashboardPanelMount>

        <DashboardPanelMount id="decision" active={activePanel}>
          <DashboardDecisionWidget />
        </DashboardPanelMount>
      </div>
    </div>
  );
}
