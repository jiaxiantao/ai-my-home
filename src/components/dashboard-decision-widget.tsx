"use client";

import { useMemo, useState } from "react";

import { PerformanceLaneChart } from "@/components/charts/performance-lane-chart";
import {
  performanceContexts,
  performanceLanes,
  performanceSignals,
  type PerformanceLaneId,
} from "@/lib/demo-lab-content";

export function DashboardDecisionWidget() {
  const [selectedSignalIds, setSelectedSignalIds] = useState<string[]>([
    "slow-first-screen",
    "third-party-drag",
  ]);

  const lanePriority = useMemo(() => {
    const context = performanceContexts[0];
    const scoreMap = new Map<PerformanceLaneId, number>(
      performanceLanes.map((lane) => [lane.id, 0]),
    );

    for (const signal of performanceSignals) {
      if (!selectedSignalIds.includes(signal.id)) {
        continue;
      }

      for (const [laneId, value] of Object.entries(signal.weights) as Array<
        [PerformanceLaneId, number]
      >) {
        scoreMap.set(laneId, (scoreMap.get(laneId) ?? 0) + value);
      }
    }

    for (const [laneId, value] of Object.entries(context.modifier) as Array<
      [PerformanceLaneId, number]
    >) {
      scoreMap.set(laneId, (scoreMap.get(laneId) ?? 0) + value);
    }

    return performanceLanes
      .map((lane) => ({
        title: lane.title,
        score: scoreMap.get(lane.id) ?? 0,
        summary: lane.summary,
      }))
      .sort((left, right) => right.score - left.score);
  }, [selectedSignalIds]);

  function toggleSignal(id: string) {
    setSelectedSignalIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
      <div className="grid gap-4 content-start">
        <p className="text-sm text-slate-500">内容站 · 信号权重 → lane 排序</p>

        <div className="flex flex-wrap gap-2">
          {performanceSignals.map((signal) => {
            const isActive = selectedSignalIds.includes(signal.id);

            return (
              <button
                key={signal.id}
                type="button"
                onClick={() => toggleSignal(signal.id)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  isActive
                    ? "border-cyan-300/35 bg-cyan-300/10 text-cyan-100"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20"
                }`}
              >
                {signal.label}
              </button>
            );
          })}
        </div>

        <ul className="grid gap-2">
          {lanePriority.slice(0, 4).map((lane, index) => (
            <li
              key={lane.title}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400"
            >
              <span className="text-cyan-200/80">{index + 1}.</span> {lane.title} ·{" "}
              {lane.score} pts — {lane.summary}
            </li>
          ))}
        </ul>
      </div>

      <article className="rounded-2xl border border-white/10 bg-white/5 p-3">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/75">
          ECharts · 优先级
        </p>
        <PerformanceLaneChart lanes={lanePriority.slice(0, 5)} />
      </article>
    </div>
  );
}
