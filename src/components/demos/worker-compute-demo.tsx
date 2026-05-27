"use client";

import { useState } from "react";

type BenchResult = {
  lane: string;
  durationMs: number;
  checksum: number;
  blocked: boolean;
};

function runOnMainThread(iterations: number) {
  const started = performance.now();
  let checksum = 0;

  for (let index = 0; index < iterations; index += 1) {
    checksum += Math.sqrt(index % 997) * Math.sin(index / 128);
  }

  return {
    durationMs: Math.round(performance.now() - started),
    checksum: Math.round(checksum),
  };
}

function runInWorker(iterations: number) {
  return new Promise<{ durationMs: number; checksum: number }>((resolve, reject) => {
    const worker = new Worker("/workers/heavy-compute.js");
    const timeout = window.setTimeout(() => {
      worker.terminate();
      reject(new Error("Worker timeout"));
    }, 30_000);

    worker.onmessage = (event: MessageEvent<{ durationMs: number; checksum: number }>) => {
      window.clearTimeout(timeout);
      worker.terminate();
      resolve(event.data);
    };

    worker.onerror = () => {
      window.clearTimeout(timeout);
      worker.terminate();
      reject(new Error("Worker failed"));
    };

    worker.postMessage({ iterations });
  });
}

export function WorkerComputeDemo() {
  const [results, setResults] = useState<BenchResult[]>([]);
  const [running, setRunning] = useState(false);
  const [uiFrozen, setUiFrozen] = useState(false);

  async function runCompare() {
    setRunning(true);
    setResults([]);
    const iterations = 6_000_000;

    const mainStarted = performance.now();
    const main = runOnMainThread(iterations);
    const mainWall = Math.round(performance.now() - mainStarted);

    setResults([
      {
        lane: "主线程（UI 会卡住）",
        durationMs: main.durationMs,
        checksum: main.checksum,
        blocked: true,
      },
    ]);
    setUiFrozen(false);

    const worker = await runInWorker(iterations);

    setResults((current) => [
      ...current,
      {
        lane: "Web Worker",
        durationMs: worker.durationMs,
        checksum: worker.checksum,
        blocked: false,
      },
      {
        lane: "主线程 wall time",
        durationMs: mainWall,
        checksum: main.checksum,
        blocked: true,
      },
    ]);
    setRunning(false);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <div className="grid gap-3 content-start">
        <button
          type="button"
          disabled={running}
          onClick={() => {
            setUiFrozen(true);
            void runCompare();
          }}
          className="w-fit rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-50"
        >
          {running ? "计算中…" : "对比主线程 vs Worker"}
        </button>
        <p className="text-sm leading-7 text-slate-400">
          相同循环 600 万次。主线程计算时按钮无法点击；Worker 在后台线程执行，UI 仍可响应。
        </p>
        <button
          type="button"
          className={`w-fit rounded-full border px-4 py-2 text-sm transition ${
            uiFrozen
              ? "border-rose-400/40 text-rose-200"
              : "border-cyan-300/30 text-cyan-100"
          }`}
        >
          {uiFrozen && running ? "UI 被阻塞…" : "UI 可点击"}
        </button>
      </div>

      <div className="grid gap-2">
        {results.map((row) => (
          <article
            key={row.lane}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
          >
            <div className="flex justify-between gap-3 text-sm">
              <span className="font-semibold text-white">{row.lane}</span>
              <span className="font-mono text-cyan-200">{row.durationMs} ms</span>
            </div>
            <p className="mt-1 font-mono text-xs text-slate-500">
              checksum {row.checksum}
              {row.blocked ? " · blocks UI" : " · non-blocking"}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
