"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type HealthData = {
  ok?: boolean;
  ready?: boolean;
  db?: { connected?: boolean; ok?: boolean; latencyMs?: number };
  llm?: { configured?: boolean; label?: string };
  search?: { pgTrgm?: boolean };
  server?: { node?: string; totalMs?: number };
  timestamp?: string;
};

type ProbeRow = {
  key: string;
  label: string;
  href: string;
  ms?: number;
  ttftMs?: number;
  status?: number;
  ok?: boolean;
  detail?: string;
  agentMetrics?: AgentProbeMetrics;
};

type AgentProbeMetrics = {
  rounds: number;
  p50Ms: number;
  p95Ms: number;
  avgSteps: number;
  avgToolCalls: number;
};

type AgentProbeHistory = {
  at: string;
  environment: string;
  p50Ms: number;
  p95Ms: number;
  avgSteps: number;
  avgToolCalls: number;
  errorRate: number;
};
const AGENT_HISTORY_LIMIT = 20;
const WINDOW_OPTIONS = [
  { label: "最近 1 小时", value: 1 },
  { label: "最近 24 小时", value: 24 },
  { label: "最近 7 天", value: 24 * 7 },
] as const;
const ENV_OPTIONS = [
  { label: "全部环境", value: "all" },
  { label: "local", value: "local" },
  { label: "preview", value: "preview" },
  { label: "prod", value: "prod" },
] as const;

function getRuntimeEnvironment() {
  if (typeof window === "undefined") {
    return "local";
  }

  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    return "local";
  }
  if (host.includes("preview") || host.includes("vercel.app")) {
    return "preview";
  }
  return "prod";
}

function getErrorLevel(rate: number) {
  if (rate <= 0.05) {
    return { label: "GREEN", ok: true, threshold: "≤ 5%" };
  }
  if (rate <= 0.2) {
    return { label: "YELLOW", ok: false, threshold: "5% - 20%" };
  }
  return { label: "RED", ok: false, threshold: "> 20%" };
}

const PROBES: Array<{ key: string; label: string; href: string }> = [
  { key: "health", label: "GET /api/health", href: "/api/health" },
  { key: "profile", label: "GET /api/profile", href: "/api/profile" },
  { key: "dashboard", label: "GET /api/dashboard", href: "/api/dashboard" },
  { key: "chat", label: "POST /api/chat", href: "/api/chat" },
  { key: "chat-sse", label: "SSE /api/chat (references→chunk→done)", href: "/api/chat" },
  { key: "agent-sse", label: "SSE /api/agent (plan→tool→answer)", href: "/api/agent" },
  {
    key: "search",
    label: "GET /api/notes/search?q=架构",
    href: "/api/notes/search?q=架构&limit=3",
  },
  {
    key: "analytics",
    label: "GET /api/analytics/notes",
    href: "/api/analytics/notes",
  },
];

export function StatusProbe() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [probes, setProbes] = useState<ProbeRow[]>([]);
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [agentMetrics, setAgentMetrics] = useState<AgentProbeMetrics | null>(null);
  const [agentHistory, setAgentHistory] = useState<AgentProbeHistory[]>([]);
  const [windowHours, setWindowHours] = useState<number>(24);
  const [environment, setEnvironment] = useState<string>(() => getRuntimeEnvironment());

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/health", { cache: "no-store", signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setHealth(data as HealthData))
      .catch((err: unknown) => {
        if ((err as { name?: string }).name !== "AbortError") {
          setHealth(null);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({
      probeKey: "agent-sse",
      limit: String(AGENT_HISTORY_LIMIT),
      sinceHours: String(windowHours),
    });
    if (environment !== "all") {
      query.set("environment", environment);
    }

    fetch(`/api/status/probes?${query.toString()}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then(
        (data: {
          records?: Array<{
            createdAt: string;
            environment: string | null;
            p50Ms: number | null;
            p95Ms: number | null;
            avgSteps: number | null;
            avgToolCalls: number | null;
            errorRate: number | null;
          }>;
        }) => {
          const history = (data.records ?? [])
            .filter((item) => item.p50Ms != null && item.p95Ms != null)
            .map((item) => ({
              at: new Date(item.createdAt).toLocaleTimeString("zh-CN", {
                hour12: false,
              }),
              environment: item.environment ?? "unknown",
              p50Ms: item.p50Ms ?? 0,
              p95Ms: item.p95Ms ?? 0,
              avgSteps: item.avgSteps ?? 0,
              avgToolCalls: item.avgToolCalls ?? 0,
              errorRate: item.errorRate ?? 0,
            }));
          setAgentHistory(history);
        },
      )
      .catch(() => {
        setAgentHistory([]);
      });

    return () => controller.abort();
  }, [windowHours, environment]);

  async function runProbes() {
    setRunning(true);
    setProbes([]);
    setAgentMetrics(null);

    const results = await Promise.all(
      PROBES.map(async (probe) => {
        const started = performance.now();
        try {
          if (probe.key === "chat-sse") {
            const sse = await runChatSseProbe(probe.href);
            return {
              key: probe.key,
              label: probe.label,
              href: probe.href,
              ms: Math.round(performance.now() - started),
              ttftMs: sse.ttftMs,
              status: sse.status,
              ok: sse.ok,
              detail: sse.detail,
            };
          }
          if (probe.key === "agent-sse") {
            const sse = await runAgentSseProbe(probe.href);
            return {
              key: probe.key,
              label: probe.label,
              href: probe.href,
              ms: Math.round(performance.now() - started),
              status: sse.status,
              ok: sse.ok,
              detail: sse.detail,
              agentMetrics: sse.metrics,
            };
          }

          const res =
            probe.key === "chat"
              ? await fetch(probe.href, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  cache: "no-store",
                  body: JSON.stringify({
                    question: "status probe: hello",
                    stream: false,
                  }),
                })
              : await fetch(probe.href, { cache: "no-store" });

          return {
            key: probe.key,
            label: probe.label,
            href: probe.href,
            ms: Math.round(performance.now() - started),
            status: res.status,
            ok: res.ok,
          };
        } catch {
          return {
            key: probe.key,
            label: probe.label,
            href: probe.href,
            ms: Math.round(performance.now() - started),
            status: 0,
            ok: false,
            detail: probe.key === "chat-sse" ? "fetch failed" : undefined,
          };
        }
      }),
    );

    const latestAgentMetrics =
      results.find((row) => row.key === "agent-sse")?.agentMetrics ?? null;

    setProbes(results);
    setLastRun(new Date().toLocaleTimeString("zh-CN", { hour12: false }));
    setAgentMetrics(latestAgentMetrics);

    if (latestAgentMetrics) {
      const errorCount = results.filter((row) => row.key === "agent-sse" && !row.ok).length;
      const entry = {
        at: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
        environment,
        p50Ms: latestAgentMetrics.p50Ms,
        p95Ms: latestAgentMetrics.p95Ms,
        avgSteps: latestAgentMetrics.avgSteps,
        avgToolCalls: latestAgentMetrics.avgToolCalls,
        errorRate: Number((errorCount / 1).toFixed(2)),
      };

      setAgentHistory((current) => [...current, entry].slice(-AGENT_HISTORY_LIMIT));
      void fetch("/api/status/probes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          probeKey: "agent-sse",
          environment,
          p50Ms: entry.p50Ms,
          p95Ms: entry.p95Ms,
          avgSteps: entry.avgSteps,
          avgToolCalls: entry.avgToolCalls,
          errorRate: entry.errorRate,
          ok: errorCount === 0,
          detail: "status-probe",
        }),
      });
    }

    setRunning(false);
  }

  const allOk = probes.length > 0 && probes.every((p) => p.ok);

  return (
    <div className="grid gap-8">
      {/* Health summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          label="Database"
          ok={Boolean(health?.db?.ok)}
          detail={
            health?.db?.ok
              ? `连接正常 · ${health.db.latencyMs ?? 0} ms`
              : health?.db?.connected === false
                ? "未连接（回退到内置数据）"
                : "探测中…"
          }
        />
        <StatusCard
          label="LLM Runtime"
          ok={Boolean(health?.llm?.configured)}
          detail={health?.llm?.label ?? "未配置"}
        />
        <StatusCard
          label="pg_trgm"
          ok={Boolean(health?.search?.pgTrgm)}
          detail={health?.search?.pgTrgm ? "扩展已安装" : "使用内存检索"}
        />
        <StatusCard
          label="Node.js"
          ok={Boolean(health?.server?.node)}
          detail={health?.server?.node ?? "—"}
        />
      </div>

      {agentMetrics ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatusCard
            label="Agent p50"
            ok={true}
            detail={`${agentMetrics.p50Ms} ms`}
          />
          <StatusCard
            label="Agent p95"
            ok={agentMetrics.p95Ms < 5000}
            detail={`${agentMetrics.p95Ms} ms`}
          />
          <StatusCard
            label="Avg Steps"
            ok={agentMetrics.avgSteps <= 4}
            detail={`${agentMetrics.avgSteps.toFixed(1)} steps`}
          />
          <StatusCard
            label="Avg Tools"
            ok={agentMetrics.avgToolCalls <= 4}
            detail={`${agentMetrics.avgToolCalls.toFixed(1)} calls`}
          />
        </div>
      ) : null}

      {agentHistory.length ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/75">
              Agent 趋势（最近 {agentHistory.length} 次）
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={windowHours}
                onChange={(event) => setWindowHours(Number(event.target.value))}
                className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] text-slate-300"
              >
                {WINDOW_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={environment}
                onChange={(event) => setEnvironment(event.target.value)}
                className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] text-slate-300"
              >
                {ENV_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  setAgentHistory([]);
                  const query = new URLSearchParams({ probeKey: "agent-sse" });
                  if (environment !== "all") {
                    query.set("environment", environment);
                  }
                  void fetch(`/api/status/probes?${query.toString()}`, {
                    method: "DELETE",
                  });
                }}
                className="rounded-full border border-white/10 px-3 py-1 text-[10px] text-slate-400 hover:border-white/20 hover:text-slate-200"
              >
                清空历史
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {agentHistory.map((item, index) => {
              const maxMs = Math.max(item.p95Ms, 1);
              const p50Width = Math.max((item.p50Ms / maxMs) * 100, 5);
              const p95Width = 100;

              return (
                <div key={`${item.at}-${index}`} className="space-y-1">
                  <p className="font-mono text-[10px] text-slate-500">
                    {item.at} · {item.environment} · p50 {item.p50Ms}ms · p95{" "}
                    {item.p95Ms}ms · steps{" "}
                    {item.avgSteps.toFixed(1)} · tools {item.avgToolCalls.toFixed(1)}
                  </p>
                  <div className="relative h-2 rounded bg-white/10">
                    <div
                      className="absolute inset-y-0 left-0 rounded bg-violet-300/50"
                      style={{ width: `${p95Width}%` }}
                      title={`p95 ${item.p95Ms}ms`}
                    />
                    <div
                      className="absolute inset-y-0 left-0 rounded bg-cyan-300/90"
                      style={{ width: `${p50Width}%` }}
                      title={`p50 ${item.p50Ms}ms`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {agentHistory.length ? (
        (() => {
          const latest = agentHistory[agentHistory.length - 1];
          const level = getErrorLevel(latest.errorRate);

          return (
            <StatusCard
              label={`Agent Error Rate · ${level.label}`}
              ok={level.ok}
              detail={`${Math.round(latest.errorRate * 100)}%（${level.threshold}）`}
            />
          );
        })()
      ) : null}

      {/* API probes */}
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/75">
            API 延迟探测
          </p>
          <div className="flex items-center gap-3">
            {lastRun ? (
              <span className="font-mono text-[10px] text-slate-500">
                上次运行 {lastRun}
                {allOk ? " · ✓ 全部通过" : ""}
              </span>
            ) : null}
            <button
              type="button"
              disabled={running}
              onClick={() => void runProbes()}
              className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-100 disabled:opacity-50"
            >
              {running ? "探测中…" : "并行探测"}
            </button>
          </div>
        </div>

        <div className="grid gap-2">
          {PROBES.map((probe) => {
            const row = probes.find((p) => p.key === probe.key);
            return (
              <div
                key={probe.key}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <Link
                  href={probe.href}
                  className="font-mono text-xs text-cyan-100/90 transition hover:text-white"
                >
                  {probe.label}
                </Link>
                {row ? (
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span
                      className={row.ok ? "text-emerald-300" : "text-rose-300"}
                    >
                      {row.ok ? "✓" : "✗"} HTTP {row.status || "ERR"}
                    </span>
                    <span className="text-slate-400">{row.ms} ms</span>
                    {row.ttftMs != null ? (
                      <span className="text-slate-500">TTFT {row.ttftMs} ms</span>
                    ) : null}
                    {row.detail ? (
                      <span className="text-slate-500">· {row.detail}</span>
                    ) : null}
                  </div>
                ) : (
                  <span className="font-mono text-[10px] text-slate-600">
                    点击「并行探测」
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {health?.timestamp ? (
        <p className="font-mono text-[10px] text-slate-600">
          Health 检查于 {new Date(health.timestamp).toLocaleString("zh-CN")}
        </p>
      ) : null}
    </div>
  );
}

async function runChatSseProbe(url: string): Promise<{
  ok: boolean;
  status: number;
  ttftMs?: number;
  detail: string;
}> {
  const controller = new AbortController();
  const startedAt = performance.now();
  const timeout = window.setTimeout(() => controller.abort(), 12_000);

  let status = 0;
  let sawReferences = false;
  let sawChunk = false;
  let sawDone = false;
  let ttftMs: number | undefined;
  let lastEvent: string | null = null;
  let invalidOrder = false;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      signal: controller.signal,
      body: JSON.stringify({
        question: "status probe: sse",
        stream: true,
      }),
    });

    status = res.status;
    if (!res.ok) {
      return { ok: false, status, detail: "non-200" };
    }

    const reader = res.body?.getReader();
    if (!reader) {
      return { ok: false, status, detail: "no reader" };
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let boundary = buffer.indexOf("\n\n");
      while (boundary !== -1) {
        const block = buffer.slice(0, boundary).trim();
        buffer = buffer.slice(boundary + 2);

        if (block) {
          const event = parseSseEventName(block);
            if (event) {
              if (
                (event === "references" && lastEvent && lastEvent !== "references") ||
                (event === "meta" &&
                  lastEvent &&
                  lastEvent !== "references" &&
                  lastEvent !== "meta") ||
                (event === "chunk" &&
                  lastEvent &&
                  lastEvent !== "references" &&
                  lastEvent !== "meta" &&
                  lastEvent !== "chunk") ||
                (event === "done" && lastEvent !== "chunk")
              ) {
                invalidOrder = true;
              }

              lastEvent = event;

              if (event === "references") {
                sawReferences = true;
              } else if (event === "meta") {
                // meta 事件在 references 之后、chunk 之前
              } else if (event === "chunk") {
              sawChunk = true;
              if (ttftMs == null) {
                ttftMs = Math.round(performance.now() - startedAt);
              }
            } else if (event === "done") {
              sawDone = true;
              return {
                ok: sawReferences && sawChunk && !invalidOrder,
                status,
                ttftMs,
                detail: invalidOrder ? "order invalid" : "ok",
              };
            }
          }
        }

        boundary = buffer.indexOf("\n\n");
      }
    }

    return {
      ok: sawReferences && sawChunk && sawDone && !invalidOrder,
      status,
      ttftMs,
      detail: "stream ended early",
    };
  } catch (error) {
    const aborted = (error as { name?: string }).name === "AbortError";
    return { ok: false, status, ttftMs, detail: aborted ? "timeout" : "error" };
  } finally {
    window.clearTimeout(timeout);
  }
}

async function runAgentSseProbe(url: string): Promise<{
  ok: boolean;
  status: number;
  detail: string;
  metrics?: AgentProbeMetrics;
}> {
  const rounds = 3;
  const totals: number[] = [];
  const steps: number[] = [];
  const toolCalls: number[] = [];

  for (let index = 0; index < rounds; index += 1) {
    const result = await runSingleAgentProbe(url, index + 1);
    if (!result.ok) {
      return {
        ok: false,
        status: result.status,
        detail: result.detail,
      };
    }

    totals.push(result.totalMs);
    steps.push(result.steps);
    toolCalls.push(result.toolCalls);
  }

  const sorted = [...totals].sort((a, b) => a - b);
  const p50 = sorted[Math.floor((sorted.length - 1) * 0.5)];
  const p95 = sorted[Math.floor((sorted.length - 1) * 0.95)];
  const avgSteps = steps.reduce((sum, value) => sum + value, 0) / steps.length;
  const avgToolCalls =
    toolCalls.reduce((sum, value) => sum + value, 0) / toolCalls.length;

  return {
    ok: true,
    status: 200,
    detail: `p50 ${p50}ms · p95 ${p95}ms`,
    metrics: {
      rounds,
      p50Ms: p50,
      p95Ms: p95,
      avgSteps,
      avgToolCalls,
    },
  };
}

async function runSingleAgentProbe(
  url: string,
  round: number,
): Promise<{
  ok: boolean;
  status: number;
  detail: string;
  totalMs: number;
  steps: number;
  toolCalls: number;
}> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12_000);

  let status = 0;
  let sawPlan = false;
  let sawToolCall = false;
  let sawStepMetric = false;
  let donePayload: { steps: number; toolCalls: number; totalMs: number } | null = null;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      signal: controller.signal,
      body: JSON.stringify({
        message:
          round % 2
            ? "先检索前端架构笔记，再计算 (128 + 64) * 3，并告诉我现在时间"
            : "帮我检索性能治理笔记并给出时间",
      }),
    });

    status = res.status;
    if (!res.ok) {
      return { ok: false, status, detail: "non-200", totalMs: 0, steps: 0, toolCalls: 0 };
    }

    const reader = res.body?.getReader();
    if (!reader) {
      return { ok: false, status, detail: "no reader", totalMs: 0, steps: 0, toolCalls: 0 };
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let boundary = buffer.indexOf("\n\n");
      while (boundary !== -1) {
        const block = buffer.slice(0, boundary).trim();
        buffer = buffer.slice(boundary + 2);

        const event = parseSseEventName(block);
        const payload = parseSseData(block) as
          | { type?: string; steps?: number; toolCalls?: number; totalMs?: number }
          | null;

        if (event === "plan") sawPlan = true;
        if (event === "tool_call") sawToolCall = true;
        if (event === "step_metric") sawStepMetric = true;
        if (event === "done" && payload?.steps != null && payload.toolCalls != null && payload.totalMs != null) {
          donePayload = {
            steps: payload.steps,
            toolCalls: payload.toolCalls,
            totalMs: payload.totalMs,
          };
          return {
            ok: sawPlan && sawToolCall && sawStepMetric,
            status,
            detail:
              sawPlan && sawToolCall && sawStepMetric
                ? "ok"
                : "missing plan/tool_call/step_metric",
            totalMs: donePayload.totalMs,
            steps: donePayload.steps,
            toolCalls: donePayload.toolCalls,
          };
        }

        boundary = buffer.indexOf("\n\n");
      }
    }

    return {
      ok: false,
      status,
      detail: "stream ended early",
      totalMs: 0,
      steps: 0,
      toolCalls: 0,
    };
  } catch (error) {
    const aborted = (error as { name?: string }).name === "AbortError";
    return {
      ok: false,
      status,
      detail: aborted ? "timeout" : "error",
      totalMs: 0,
      steps: 0,
      toolCalls: 0,
    };
  } finally {
    window.clearTimeout(timeout);
  }
}

function parseSseEventName(block: string) {
  const lines = block.split("\n");
  for (const line of lines) {
    if (line.startsWith("event:")) {
      return line.slice(6).trim();
    }
  }
  return null;
}

function parseSseData(block: string) {
  const lines = block.split("\n");
  const dataLine = lines.find((line) => line.startsWith("data:"));
  if (!dataLine) {
    return null;
  }
  try {
    return JSON.parse(dataLine.slice(5).trim()) as unknown;
  } catch {
    return null;
  }
}

function StatusCard({
  label,
  ok,
  detail,
}: {
  label: string;
  ok: boolean;
  detail: string;
}) {
  return (
    <article
      className={`rounded-2xl border p-5 ${
        ok
          ? "border-emerald-400/20 bg-emerald-400/5"
          : "border-amber-400/20 bg-amber-400/5"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${ok ? "bg-emerald-400" : "bg-amber-400"}`}
        />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          {label}
        </p>
      </div>
      <p className="mt-3 text-sm text-slate-200">{detail}</p>
    </article>
  );
}
