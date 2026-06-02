"use client";

import { useState } from "react";

type SseLog = {
  id: number;
  event: string;
  payload: string;
  at: string;
};

export function SseInspectorDemo() {
  const [question, setQuestion] = useState("前端性能问题怎么排查？");
  const [logs, setLogs] = useState<SseLog[]>([]);
  const [streaming, setStreaming] = useState(false);

  async function run() {
    setStreaming(true);
    setLogs([]);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, stream: true }),
    });

    if (!response.ok || !response.body) {
      setLogs([
        {
          id: 0,
          event: "error",
          payload: `HTTP ${response.status}`,
          at: time(),
        },
      ]);
      setStreaming(false);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let id = 0;

    const push = (event: string, payload: unknown) => {
      id += 1;
      setLogs((current) => [
        {
          id,
          event,
          payload:
            typeof payload === "string"
              ? payload
              : JSON.stringify(payload, null, 0).slice(0, 240),
          at: time(),
        },
        ...current,
      ].slice(0, 12));
    };

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      let boundary = buffer.indexOf("\n\n");

      while (boundary !== -1) {
        const block = buffer.slice(0, boundary).trim();
        buffer = buffer.slice(boundary + 2);

        if (block) {
          let eventName = "message";
          let dataLine = "";

          for (const line of block.split("\n")) {
            if (line.startsWith("event:")) {
              eventName = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              dataLine += line.slice(5).trim();
            }
          }

          if (dataLine) {
            try {
              push(eventName, JSON.parse(dataLine));
            } catch {
              push(eventName, dataLine);
            }
          }
        }

        boundary = buffer.indexOf("\n\n");
      }
    }

    setStreaming(false);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="grid gap-3">
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/40"
        />
        <button
          type="button"
          disabled={streaming}
          onClick={() => void run()}
          className="w-fit rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-50"
        >
          {streaming ? "接收 SSE…" : "发起流式请求"}
        </button>
        <p className="text-xs leading-6 text-slate-500">
          原始 event 帧：references → chunk* → done
        </p>
      </div>

      <div className="max-h-80 overflow-auto rounded-2xl border border-white/10 bg-slate-950/80 p-3 font-mono text-xs">
        {logs.length ? (
          logs.map((log) => (
            <article
              key={log.id}
              className="mb-2 rounded-lg border border-white/10 bg-white/5 p-3"
            >
              <div className="flex justify-between gap-2 text-cyan-200/80">
                <span>event: {log.event}</span>
                <span className="text-slate-600">{log.at}</span>
              </div>
              <pre className="mt-2 whitespace-pre-wrap break-all text-slate-400">
                {log.payload}
              </pre>
            </article>
          ))
        ) : (
          <p className="p-4 text-slate-500">点击后显示 SSE 事件流</p>
        )}
      </div>
    </div>
  );
}

function time() {
  return new Date().toLocaleTimeString("zh-CN", { hour12: false });
}
