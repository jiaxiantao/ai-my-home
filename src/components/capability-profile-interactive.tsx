"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

import { CapabilityProfileRadar } from "@/components/charts/capability-profile-radar";
import {
  CAPABILITY_DIMENSIONS,
  listCapabilityDimensionScores,
  type CapabilityDimensionKey,
} from "@/lib/capability-dimensions";
import type { DashboardData } from "@/lib/dashboard-service";
import { formatReleaseStoreMode } from "@/lib/release-store-labels";

const capabilityLinks = [
  { href: "/#front-intelligence", label: "智能编排" },
  { href: "/#demo-lab", label: "判断台" },
  { href: "/#tech-demos", label: "工程 Demo" },
  { href: "/release-center", label: "发布中心" },
  { href: "/#edge-ai", label: "端侧 AI" },
  { href: "/assistant", label: "AI 工作台" },
] as const;

export function CapabilityProfileInteractive({
  dashboard,
}: {
  dashboard: DashboardData;
}) {
  const { capabilityProfile, release, intelligence } = dashboard;
  const dimensions = listCapabilityDimensionScores(capabilityProfile);
  const [highlightKey, setHighlightKey] = useState<CapabilityDimensionKey | null>(
    dimensions[0]?.key ?? null,
  );

  const activeDimension =
    CAPABILITY_DIMENSIONS.find((item) => item.key === highlightKey) ?? null;

  return (
    <div className="grid gap-6 rounded-4xl border border-white/10 bg-slate-950/40 p-6 md:grid-cols-[1fr_1.1fr] md:p-8">
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
          Capability Radar
        </p>
        <h3 className="text-2xl font-semibold text-white">能力雷达总览</h3>
        <p className="text-sm leading-7 text-slate-400">
          分数由 Dashboard 聚合计算，随笔记规模、Demo 数量、发布单、LLM 配置与
          PostgreSQL 持久化动态变化。当前 {release.appCount} 个应用、
          {release.orderCount} 张发布单，存储{" "}
          {formatReleaseStoreMode(release.storeMode)}。
        </p>

        <div className="flex flex-wrap gap-2 text-xs">
          <span
            className={`rounded-full border px-3 py-1 ${
              intelligence.llmConfigured
                ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
                : "border-white/10 bg-white/5 text-slate-400"
            }`}
          >
            LLM {intelligence.llmConfigured ? intelligence.llmLabel : "未配置"}
          </span>
          <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1 text-violet-100">
            智能编排 {intelligence.features.length} 项能力
          </span>
        </div>

        {activeDimension ? (
          <p className="rounded-xl border border-cyan-300/20 bg-cyan-300/5 px-3 py-2 text-xs text-cyan-100">
            当前高亮：<span className="font-semibold">{activeDimension.label}</span>
            {" · "}
            {activeDimension.hint}
          </p>
        ) : null}

        <ul className="grid gap-2">
          {dimensions.map((dimension) => {
            const active = highlightKey === dimension.key;
            return (
              <li key={dimension.key}>
                <div
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition ${
                    active
                      ? "border-cyan-300/35 bg-cyan-300/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setHighlightKey(dimension.key)}
                    className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{dimension.label}</p>
                      <p className="text-[11px] text-slate-500">{dimension.hint}</p>
                    </div>
                    <span className="shrink-0 font-mono text-sm tabular-nums text-cyan-200">
                      {dimension.score}
                    </span>
                  </button>
                  {dimension.href.startsWith("http") ? (
                    <a
                      href={dimension.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`前往 ${dimension.label}`}
                      className="rounded-lg border border-white/10 p-1.5 text-slate-400 transition hover:border-cyan-300/30 hover:text-white"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <Link
                      href={dimension.href}
                      aria-label={`前往 ${dimension.label}`}
                      className="rounded-lg border border-white/10 p-1.5 text-slate-400 transition hover:border-cyan-300/30 hover:text-white"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap gap-2">
          {capabilityLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:border-cyan-300/30 hover:text-white"
            >
              {item.label}
              <ArrowRight className="h-3 w-3" />
            </Link>
          ))}
        </div>
      </div>
      <CapabilityProfileRadar
        scores={capabilityProfile}
        highlightKey={highlightKey}
      />
    </div>
  );
}
