"use client";

import { useState } from "react";

import { agentToolCatalog } from "@/lib/agent/tool-catalog";
import type { AgentPlan, AgentTraceEvent } from "@/lib/agent/types";

type TraceLine = {
  id: string;
  kind: string;
  text: string;
};

function formatPlan(plan: AgentPlan) {
  if (plan.action === "tool") {
    return `调用 ${plan.tool} · ${plan.reasoning}`;
  }

  return `直接回答 · ${plan.reasoning}`;
}

function parseSseBlock(block: string) {
  let event = "message";
  let data = "";

  for (const line of block.split("\n")) {
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      data += line.slice(5).trim();
    }
  }

  if (!data) {
    return null;
  }

  try {
    return { event, payload: JSON.parse(data) as AgentTraceEvent };
  } catch {
    return null;
  }
}

export function AgentOrchestratorDemo() {
  const [message, setMessage] = useState("帮我搜索笔记里关于前端架构的内容");
  const [lines, setLines] = useState<TraceLine[]>([]);
  const [finalAnswer, setFinalAnswer] = useState("");
  const [running, setRunning] = useState(false);

  async function runAgent() {
    setRunning(true);
    setLines([]);
    setFinalAnswer("");

    const response = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!response.ok || !response.body) {
      setLines([
        {
          id: crypto.randomUUID(),
          kind: "error",
          text: `HTTP ${response.status}`,
        },
      ]);
      setRunning(false);
      return;
    }

    const reader = response.body.getReader();
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

        const parsed = parseSseBlock(block);

        if (parsed?.payload) {
          const { payload } = parsed;
          const id = crypto.randomUUID();

          if (payload.type === "trace") {
            setLines((current) => [
              ...current,
              { id, kind: "trace", text: `[${payload.phase}] ${payload.message}` },
            ]);
          } else if (payload.type === "plan") {
            setLines((current) => [
              ...current,
              { id, kind: "plan", text: formatPlan(payload.plan) },
            ]);
          } else if (payload.type === "tool_call") {
            setLines((current) => [
              ...current,
              {
                id,
                kind: "tool",
                text: `→ ${payload.tool}(${JSON.stringify(payload.args)})`,
              },
            ]);
          } else if (payload.type === "tool_result") {
            setLines((current) => [
              ...current,
              { id, kind: "result", text: payload.output },
            ]);
          } else if (payload.type === "answer") {
            setFinalAnswer(payload.text);
          } else if (payload.type === "error") {
            setLines((current) => [
              ...current,
              { id, kind: "error", text: payload.message },
            ]);
          }
        }

        boundary = buffer.indexOf("\n\n");
      }
    }

    setRunning(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-4">
        <p className="text-sm leading-7 text-slate-400">
          简化 Agent 循环：用户输入 → LLM/规则规划 → 可选工具 → 结果再规划 →
          最终回答。全程 SSE 推送 trace，便于前端编排 UI。
        </p>

        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={3}
          className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/40"
        />

        <button
          type="button"
          onClick={() => void runAgent()}
          disabled={running || !message.trim()}
          className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
        >
          {running ? "运行中…" : "运行 Agent 循环"}
        </button>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-xs leading-6 text-slate-300">
          {lines.length ? (
            <ul className="space-y-2">
              {lines.map((line) => (
                <li key={line.id} className="whitespace-pre-wrap">
                  <span className="text-cyan-200/70">{line.kind}</span> {line.text}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">trace 将显示在这里</p>
          )}
        </div>

        {finalAnswer ? (
          <div className="rounded-2xl border border-cyan-300/25 bg-cyan-300/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/80">
              Final
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-200">
              {finalAnswer}
            </p>
          </div>
        ) : null}
      </div>

      <aside className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Tools
        </p>
        <ul className="mt-3 space-y-3">
          {agentToolCatalog.map((tool) => (
            <li key={tool.name} className="text-xs leading-6 text-slate-400">
              <span className="font-mono text-cyan-200/80">{tool.name}</span>
              <span className="block text-slate-500">{tool.description}</span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
