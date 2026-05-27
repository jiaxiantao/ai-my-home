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
};

const PROBES: Array<{ key: string; label: string; href: string }> = [
  { key: "health", label: "GET /api/health", href: "/api/health" },
  { key: "profile", label: "GET /api/profile", href: "/api/profile" },
  { key: "dashboard", label: "GET /api/dashboard", href: "/api/dashboard" },
  { key: "chat", label: "POST /api/chat", href: "/api/chat" },
  { key: "chat-sse", label: "SSE /api/chat (references→chunk→done)", href: "/api/chat" },
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

  async function runProbes() {
    setRunning(true);
    setProbes([]);

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

    setProbes(results);
    setLastRun(new Date().toLocaleTimeString("zh-CN", { hour12: false }));
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

function parseSseEventName(block: string) {
  const lines = block.split("\n");
  for (const line of lines) {
    if (line.startsWith("event:")) {
      return line.slice(6).trim();
    }
  }
  return null;
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
