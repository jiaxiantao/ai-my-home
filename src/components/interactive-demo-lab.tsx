/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Binary,
  Bot,
  Boxes,
  Gauge,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

import {
  architectureScenarios,
  blueprintConstraints,
  blueprintModes,
  blueprintRecommendations,
  performanceContexts,
  performanceLanes,
  performanceSignals,
  workflowCapabilities,
  workflowStages,
  type BlueprintAxisId,
  type PerformanceLaneId,
} from "@/lib/demo-lab-content";
import { SystemMapPanel } from "@/components/system-map-panel";
import {
  buildDemoLabShareUrl,
  buildDemoLabQuery,
  parseDemoLabState,
  type DemoLabUrlState,
} from "@/lib/demo-lab-url-state";

type DemoTabId = "architecture" | "performance" | "workflow" | "blueprint";

const demoTabs = [
  {
    id: "architecture" as const,
    title: "架构决策台",
    summary: "选场景 → 渲染 / 状态 / 交付边界",
    icon: Boxes,
  },
  {
    id: "performance" as const,
    title: "性能治理台",
    summary: "勾信号 → 排查 lane 优先级",
    icon: Gauge,
  },
  {
    id: "workflow" as const,
    title: "AI 工作流台",
    summary: "开关能力 → 工作流稳定度",
    icon: Bot,
  },
  {
    id: "blueprint" as const,
    title: "架构沙盘",
    summary: "勾约束 → 方案建议",
    icon: Binary,
  },
];

export function InteractiveDemoLab() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const didInitRef = useRef(false);
  const [copied, setCopied] = useState(false);

  const [activeTab, setActiveTab] = useState<DemoTabId>("architecture");
  const [selectedScenarioId, setSelectedScenarioId] = useState(
    architectureScenarios[0].id,
  );

  const [contextId, setContextId] = useState(performanceContexts[0].id);
  const [selectedSignalIds, setSelectedSignalIds] = useState<string[]>([
    "slow-first-screen",
    "third-party-drag",
  ]);

  const [enabledCapabilities, setEnabledCapabilities] = useState<string[]>([
    "rules",
    "knowledge",
    "validation",
    "review",
  ]);

  const [modeId, setModeId] = useState(blueprintModes[1].id);
  const [selectedConstraintIds, setSelectedConstraintIds] = useState<string[]>([
    "seo",
    "team-collab",
    "content-heavy",
  ]);

  useEffect(() => {
    if (didInitRef.current) return;

    const parsed = parseDemoLabState(searchParams);

    setActiveTab((current) => parsed.tab ?? current);
    setSelectedScenarioId((current) => parsed.scenario ?? current);
    setContextId((current) => parsed.context ?? current);
    setSelectedSignalIds((current) =>
      parsed.signals && parsed.signals.length ? parsed.signals : current,
    );
    setEnabledCapabilities((current) =>
      parsed.capabilities && parsed.capabilities.length
        ? parsed.capabilities
        : current,
    );
    setSelectedConstraintIds((current) =>
      parsed.constraints && parsed.constraints.length
        ? parsed.constraints
        : current,
    );
    setModeId((current) => parsed.mode ?? current);

    didInitRef.current = true;
  }, [searchParams]);

  useEffect(() => {
    const state: DemoLabUrlState = {
      tab: activeTab,
      scenario: selectedScenarioId,
      context: contextId,
      signals: selectedSignalIds,
      capabilities: enabledCapabilities,
      constraints: selectedConstraintIds,
      mode: modeId,
    };

    const query = buildDemoLabQuery(state);
    router.replace(`/?${query}#demo-lab`, { scroll: false });
  }, [
    activeTab,
    selectedScenarioId,
    contextId,
    selectedSignalIds,
    enabledCapabilities,
    selectedConstraintIds,
    modeId,
    router,
  ]);

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 rounded-[2rem] border border-white/10 bg-slate-950/80 p-4 md:grid-cols-3">
        {demoTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-[1.5rem] border p-5 text-left transition ${
                isActive
                  ? "border-cyan-300/35 bg-cyan-300/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-2 text-cyan-100">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-base font-semibold text-white">{tab.title}</p>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-300">{tab.summary}</p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs leading-6 text-slate-400">
          这是可分享的判断台：URL 会同步当前选择。
        </p>
        <button
          type="button"
          onClick={async () => {
            const state: DemoLabUrlState = {
              tab: activeTab,
              scenario: selectedScenarioId,
              context: contextId,
              signals: selectedSignalIds,
              capabilities: enabledCapabilities,
              constraints: selectedConstraintIds,
              mode: modeId,
            };

            await navigator.clipboard.writeText(buildDemoLabShareUrl(state));
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
          }}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
        >
          {copied ? "已复制链接" : "复制本次判断链接"}
        </button>
      </div>

      {activeTab === "architecture" ? (
        <ArchitectureDemo
          scenarioId={selectedScenarioId}
          onChangeScenarioId={setSelectedScenarioId}
        />
      ) : null}
      {activeTab === "performance" ? (
        <PerformanceDemo
          contextId={contextId}
          selectedSignalIds={selectedSignalIds}
          onChangeContextId={setContextId}
          onToggleSignal={(id) =>
            setSelectedSignalIds((current) => {
              if (current.includes(id)) {
                return current.filter((item) => item !== id);
              }
              return [...current, id];
            })
          }
        />
      ) : null}
      {activeTab === "workflow" ? (
        <WorkflowDemo
          enabledCapabilities={enabledCapabilities}
          onToggleCapability={(id) =>
            setEnabledCapabilities((current) => {
              if (current.includes(id)) {
                return current.filter((item) => item !== id);
              }
              return [...current, id];
            })
          }
        />
      ) : null}
      {activeTab === "blueprint" ? (
        <BlueprintDemo
          modeId={modeId}
          selectedConstraintIds={selectedConstraintIds}
          onChangeModeId={setModeId}
          onToggleConstraint={(id) =>
            setSelectedConstraintIds((current) => {
              if (current.includes(id)) {
                return current.filter((item) => item !== id);
              }
              return [...current, id];
            })
          }
        />
      ) : null}
    </div>
  );
}

function ArchitectureDemo({
  scenarioId,
  onChangeScenarioId,
}: {
  scenarioId: string;
  onChangeScenarioId: (id: string) => void;
}) {
  const scenario =
    architectureScenarios.find((item) => item.id === scenarioId) ??
    architectureScenarios[0];

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <article className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
          Scenario Switcher
        </p>
        <div className="mt-5 grid gap-3">
          {architectureScenarios.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeScenarioId(item.id)}
              className={`rounded-[1.5rem] border p-5 text-left transition ${
                item.id === scenario.id
                  ? "border-cyan-300/35 bg-cyan-300/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs text-slate-300">
                  {item.signals.length} signals
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-300">{item.summary}</p>
            </button>
          ))}
        </div>
      </article>

      <div className="grid gap-4">
        <article className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
                Active Decision
              </p>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                {scenario.title}
              </h3>
            </div>
            <Sparkles className="h-5 w-5 text-cyan-200" />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {scenario.signals.map((item) => (
              <span
                key={item}
                className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <DecisionCard title="渲染策略" content={scenario.decisions.rendering} />
            <DecisionCard title="状态边界" content={scenario.decisions.state} />
            <DecisionCard title="数据组织" content={scenario.decisions.data} />
            <DecisionCard title="交付方式" content={scenario.decisions.delivery} />
          </div>
        </article>

        <article className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
            Expected Output
          </p>
          <div className="mt-5 grid gap-3">
            {scenario.outputs.map((item, index) => (
              <div
                key={item}
                className="flex items-start gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
              >
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-xs font-semibold text-cyan-100">
                  {index + 1}
                </span>
                <p className="text-sm leading-7 text-slate-300">{item}</p>
              </div>
            ))}
          </div>
          <a
            href="/cases"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-white"
          >
            去案例里看更完整的判断拆解
            <ArrowRight className="h-4 w-4" />
          </a>
        </article>

        <SystemMapPanel scenarioId={scenarioId} />
      </div>
    </div>
  );
}

function PerformanceDemo({
  contextId,
  selectedSignalIds,
  onChangeContextId,
  onToggleSignal,
}: {
  contextId: string;
  selectedSignalIds: string[];
  onChangeContextId: (id: string) => void;
  onToggleSignal: (id: string) => void;
}) {
  const context =
    performanceContexts.find((item) => item.id === contextId) ??
    performanceContexts[0];

  const lanePriority = useMemo(() => {
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

    const ranked = performanceLanes
      .map((lane) => ({
        ...lane,
        score: scoreMap.get(lane.id) ?? 0,
      }))
      .sort((left, right) => right.score - left.score);

    const topScore = ranked[0]?.score ?? 1;

    return ranked.map((lane) => ({
      ...lane,
      ratio: Math.max(lane.score / topScore, 0.18),
    }));
  }, [context, selectedSignalIds]);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <article className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
          Performance Inputs
        </p>

        <div className="mt-5 grid gap-3">
          {performanceContexts.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeContextId(item.id)}
              className={`rounded-[1.5rem] border p-4 text-left transition ${
                item.id === context.id
                  ? "border-cyan-300/35 bg-cyan-300/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">{item.summary}</p>
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-3">
          {performanceSignals.map((signal) => {
            const isActive = selectedSignalIds.includes(signal.id);

            return (
              <button
                key={signal.id}
                type="button"
                onClick={() => onToggleSignal(signal.id)}
                className={`rounded-[1.5rem] border p-4 text-left transition ${
                  isActive
                    ? "border-cyan-300/35 bg-cyan-300/10"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-white">{signal.label}</p>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isActive ? "bg-cyan-300" : "bg-slate-600"
                    }`}
                  />
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {signal.summary}
                </p>
              </button>
            );
          })}
        </div>
      </article>

      <div className="grid gap-4">
        <article className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
                Triage Order
              </p>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                现在我会优先看这几条链路
              </h3>
            </div>
            <Activity className="h-5 w-5 text-cyan-200" />
          </div>

          <div className="mt-6 grid gap-4">
            {lanePriority.map((lane, index) => (
              <div
                key={lane.id}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-xs font-semibold text-cyan-100">
                      {index + 1}
                    </span>
                    <p className="text-base font-semibold text-white">{lane.title}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {lane.score} pts
                  </span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-cyan-300/80"
                    style={{ width: `${lane.ratio * 100}%` }}
                  />
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-300">{lane.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {lane.actions.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs text-slate-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>

        <a
          href="/playbooks"
          className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-white"
        >
          打开 Playbooks 看完整排查方法
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

function WorkflowDemo({
  enabledCapabilities,
  onToggleCapability,
}: {
  enabledCapabilities: string[];
  onToggleCapability: (id: string) => void;
}) {

  const workflowScore = useMemo(() => {
    return workflowCapabilities.reduce((total, capability) => {
      if (!enabledCapabilities.includes(capability.id)) {
        return total;
      }

      return total + capability.impact;
    }, 0);
  }, [enabledCapabilities]);

  const workflowLabel =
    workflowScore >= 85
      ? "可复用、可追溯、适合长期迭代"
      : workflowScore >= 55
        ? "能跑通，但还不够稳定"
        : "更像一次性生成，不像工程流程";

  const activatedStages = {
    context:
      enabledCapabilities.includes("rules") ||
      enabledCapabilities.includes("knowledge"),
    generation: true,
    validation: enabledCapabilities.includes("validation"),
    asset:
      enabledCapabilities.includes("review") &&
      enabledCapabilities.includes("knowledge"),
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <article className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
          Workflow Switches
        </p>
        <div className="mt-5 grid gap-3">
          {workflowCapabilities.map((capability) => {
            const enabled = enabledCapabilities.includes(capability.id);

            return (
              <button
                key={capability.id}
                type="button"
                onClick={() => onToggleCapability(capability.id)}
                className={`rounded-[1.5rem] border p-4 text-left transition ${
                  enabled
                    ? "border-cyan-300/35 bg-cyan-300/10"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-white">{capability.label}</p>
                  <ShieldCheck
                    className={`h-4 w-4 ${
                      enabled ? "text-cyan-200" : "text-slate-500"
                    }`}
                  />
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {capability.summary}
                </p>
              </button>
            );
          })}
        </div>
      </article>

      <div className="grid gap-4">
        <article className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
                Workflow Stability
              </p>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                {workflowScore} / 100
              </h3>
            </div>
            <Workflow className="h-5 w-5 text-cyan-200" />
          </div>

          <div className="mt-5 h-3 rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-cyan-300/80 transition-all"
              style={{ width: `${workflowScore}%` }}
            />
          </div>

          <p className="mt-4 text-sm leading-7 text-slate-300">{workflowLabel}</p>

          <div className="mt-6 grid gap-3">
            {workflowStages.map((stage) => {
              const active =
                activatedStages[stage.id as keyof typeof activatedStages];

              return (
                <div
                  key={stage.id}
                  className={`rounded-[1.5rem] border p-4 transition ${
                    active
                      ? "border-cyan-300/25 bg-cyan-300/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-white">{stage.title}</p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        active
                          ? "border border-cyan-300/20 bg-cyan-300/10 text-cyan-100"
                          : "border border-white/10 bg-slate-950/70 text-slate-400"
                      }`}
                    >
                      {active ? "active" : "missing"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {stage.summary}
                  </p>
                </div>
              );
            })}
          </div>
        </article>

        <a
          href="/assistant"
          className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-white"
        >
          去 Assistant 看知识库驱动的真实入口
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

function BlueprintDemo({
  modeId,
  selectedConstraintIds,
  onChangeModeId,
  onToggleConstraint,
}: {
  modeId: string;
  selectedConstraintIds: string[];
  onChangeModeId: (id: string) => void;
  onToggleConstraint: (id: string) => void;
}) {
  const activeMode =
    blueprintModes.find((item) => item.id === modeId) ?? blueprintModes[0];

  const rankedRecommendations = useMemo(() => {
    const axisScores = new Map<BlueprintAxisId, number>(
      ([
        "rendering",
        "state",
        "data",
        "quality",
        "delivery",
      ] as BlueprintAxisId[]).map((axis) => [axis, 0]),
    );

    for (const constraint of blueprintConstraints) {
      if (!selectedConstraintIds.includes(constraint.id)) {
        continue;
      }

      for (const [axis, score] of Object.entries(constraint.weights) as Array<
        [BlueprintAxisId, number]
      >) {
        axisScores.set(axis, (axisScores.get(axis) ?? 0) + score);
      }
    }

    for (const [axis, score] of Object.entries(activeMode.modifier) as Array<
      [BlueprintAxisId, number]
    >) {
      axisScores.set(axis, (axisScores.get(axis) ?? 0) + score);
    }

    return blueprintRecommendations
      .map((recommendation) => {
        const boostScore = recommendation.boosts.reduce((total, boostId) => {
          return total + (selectedConstraintIds.includes(boostId) ? 2 : 0);
        }, 0);

        const axisScore = axisScores.get(recommendation.axis) ?? 0;

        return {
          ...recommendation,
          totalScore: recommendation.scoreBase + axisScore + boostScore,
        };
      })
      .sort((left, right) => right.totalScore - left.totalScore)
      .slice(0, 5);
  }, [activeMode, selectedConstraintIds]);

  const blueprintSummary =
    rankedRecommendations.length >= 3
      ? rankedRecommendations
          .slice(0, 3)
          .map((item) => item.title)
          .join(" / ")
      : "当前约束还不够，建议再勾几项再看";

  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <article className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
          Project Constraints
        </p>

        <div className="mt-5 grid gap-3">
          {blueprintModes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => onChangeModeId(mode.id)}
              className={`rounded-[1.5rem] border p-4 text-left transition ${
                mode.id === activeMode.id
                  ? "border-cyan-300/35 bg-cyan-300/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              <p className="text-sm font-semibold text-white">{mode.title}</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">{mode.summary}</p>
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-3">
          {blueprintConstraints.map((constraint) => {
            const active = selectedConstraintIds.includes(constraint.id);

            return (
              <button
                key={constraint.id}
                type="button"
                onClick={() => onToggleConstraint(constraint.id)}
                className={`rounded-[1.5rem] border p-4 text-left transition ${
                  active
                    ? "border-cyan-300/35 bg-cyan-300/10"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-white">
                    {constraint.label}
                  </p>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      active ? "bg-cyan-300" : "bg-slate-600"
                    }`}
                  />
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {constraint.summary}
                </p>
              </button>
            );
          })}
        </div>
      </article>

      <div className="grid gap-4">
        <article className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
                Generated Blueprint
              </p>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                我会先这样搭这类项目
              </h3>
            </div>
            <Binary className="h-5 w-5 text-cyan-200" />
          </div>

          <p className="mt-5 rounded-[1.5rem] border border-cyan-300/20 bg-cyan-300/10 px-4 py-4 text-sm leading-7 text-cyan-50">
            {blueprintSummary}
          </p>

          <div className="mt-6 grid gap-3">
            {rankedRecommendations.map((item, index) => (
              <div
                key={item.id}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-xs font-semibold text-cyan-100">
                      {index + 1}
                    </span>
                    <p className="text-base font-semibold text-white">{item.title}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {item.axis}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {item.summary}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
            Why This Fits
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {selectedConstraintIds.map((constraintId) => {
              const constraint = blueprintConstraints.find(
                (item) => item.id === constraintId,
              );

              if (!constraint) {
                return null;
              }

              return (
                <span
                  key={constraint.id}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs leading-6 text-slate-300"
                >
                  {constraint.label}
                </span>
              );
            })}
          </div>

          <a
            href="/resume"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-white"
          >
            去 Resume 看完整能力维度
            <ArrowRight className="h-4 w-4" />
          </a>
        </article>
      </div>
    </div>
  );
}

function DecisionCard({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/75">
        {title}
      </p>
      <p className="mt-3 text-sm leading-7 text-slate-300">{content}</p>
    </div>
  );
}
