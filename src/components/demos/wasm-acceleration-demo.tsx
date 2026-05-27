"use client";

import { useState } from "react";

type BenchRow = {
  lane: string;
  ms: number;
  detail: string;
};

function matmul(size: number) {
  const a = new Float32Array(size * size);
  const b = new Float32Array(size * size);
  const out = new Float32Array(size * size);

  for (let index = 0; index < a.length; index += 1) {
    a[index] = (index % 17) / 17;
    b[index] = (index % 13) / 13;
  }

  const started = performance.now();

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      let sum = 0;

      for (let k = 0; k < size; k += 1) {
        sum += a[row * size + k] * b[k * size + col];
      }

      out[row * size + col] = sum;
    }
  }

  return {
    ms: Math.round(performance.now() - started),
    checksum: Math.round(out[0] + out[out.length - 1]),
  };
}

function runInWorker(size: number) {
  return new Promise<{ ms: number; checksum: number }>((resolve, reject) => {
    const worker = new Worker("/workers/matmul-bench.js");
    const timeout = window.setTimeout(() => {
      worker.terminate();
      reject(new Error("Worker timeout"));
    }, 60_000);

    worker.onmessage = (event: MessageEvent<{ ms: number; checksum: number }>) => {
      window.clearTimeout(timeout);
      worker.terminate();
      resolve(event.data);
    };

    worker.onerror = () => {
      window.clearTimeout(timeout);
      worker.terminate();
      reject(new Error("Worker failed"));
    };

    worker.postMessage({ size });
  });
}

const stackNotes = [
  {
    title: "WebAssembly",
    body: "ONNX Runtime Web / Transformers.js 将算子编译为 WASM，在 CPU 上接近原生速度，且不阻塞 UI（可配合 Worker）。",
  },
  {
    title: "WebGL / WebGPU",
    body: "部分推理框架可把矩阵运算卸载到 GPU（WebGL compute 或 WebGPU），适合较大模型或实时视频管线。",
  },
  {
    title: "主线程边界",
    body: "重计算应离开主线程；本页对比主线程密集循环 vs Worker 内同样逻辑。",
  },
];

export function WasmAccelerationDemo() {
  const [rows, setRows] = useState<BenchRow[]>([]);
  const [running, setRunning] = useState(false);

  async function runBench() {
    setRunning(true);
    setRows([]);
    const size = 96;

    const main = matmul(size);
    setRows([
      {
        lane: "主线程矩阵乘",
        ms: main.ms,
        detail: `checksum ${main.checksum} · ${size}×${size}`,
      },
    ]);

    const worker = await runInWorker(size);
    setRows((current) => [
      ...current,
      {
        lane: "Web Worker + WASM 友好隔离",
        ms: worker.ms,
        detail: `checksum ${worker.checksum} · 同规模`,
      },
    ]);

    setRunning(false);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-7 text-slate-400">
        浏览器端 AI 栈通常分层：JavaScript 编排 →{" "}
        <span className="text-cyan-200/90">WASM</span> 执行算子 → 可选{" "}
        <span className="text-cyan-200/90">WebGL/WebGPU</span> 加速。下方用矩阵乘
        模拟算子负载，对比主线程与 Worker。
      </p>

      <div className="grid gap-3 md:grid-cols-3">
        {stackNotes.map((note) => (
          <div
            key={note.title}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <p className="text-sm font-semibold text-white">{note.title}</p>
            <p className="mt-2 text-xs leading-6 text-slate-400">{note.body}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => void runBench()}
        disabled={running}
        className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 disabled:opacity-50"
      >
        {running ? "基准测试中…" : "运行 WASM 友好基准"}
      </button>

      {rows.length ? (
        <div className="grid gap-2">
          {rows.map((row) => (
            <div
              key={row.lane}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3"
            >
              <span className="text-sm text-white">{row.lane}</span>
              <span className="font-mono text-xs text-slate-400">
                {row.ms} ms · {row.detail}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
