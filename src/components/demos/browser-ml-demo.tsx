"use client";

import { useState } from "react";

type SentimentLabel = { label: string; score: number };

type TransformersEnvLike = {
  allowLocalModels?: boolean;
  allowRemoteModels?: boolean;
  useBrowserCache?: boolean;
  backends?: {
    onnx?: {
      wasm?: {
        numThreads?: number;
      };
    };
  };
};

export function BrowserMlDemo() {
  const [text, setText] = useState(
    "Transformers.js runs entirely in the browser with ONNX Runtime Web.",
  );
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [progress, setProgress] = useState("");
  const [backend, setBackend] = useState("");
  const [loadMs, setLoadMs] = useState<number | null>(null);
  const [inferMs, setInferMs] = useState<number | null>(null);
  const [labels, setLabels] = useState<SentimentLabel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [resultSource, setResultSource] = useState<"model" | "fallback" | null>(
    null,
  );

  function runMockClassification(input: string) {
    const normalized = input.toLowerCase();
    const positiveHints = ["great", "good", "fast", "stable", "awesome", "love"];
    const negativeHints = ["bad", "slow", "error", "fail", "broken", "hate"];

    const positiveHit = positiveHints.some((word) => normalized.includes(word));
    const negativeHit = negativeHints.some((word) => normalized.includes(word));

    if (positiveHit && !negativeHit) {
      return [
        { label: "POSITIVE", score: 0.91 },
        { label: "NEGATIVE", score: 0.09 },
      ] as SentimentLabel[];
    }

    if (negativeHit && !positiveHit) {
      return [
        { label: "NEGATIVE", score: 0.88 },
        { label: "POSITIVE", score: 0.12 },
      ] as SentimentLabel[];
    }

    return [
      { label: "POSITIVE", score: 0.56 },
      { label: "NEGATIVE", score: 0.44 },
    ] as SentimentLabel[];
  }

  async function runClassification() {
    setError(null);
    setStatus("loading");
    setProgress("");
    setLoadMs(null);
    setInferMs(null);
    setLabels([]);
    setResultSource(null);
    const loadStarted = performance.now();

    try {
      const { pipeline, env } = await import("@xenova/transformers");
      const runtimeEnv = env as TransformersEnvLike | undefined;

      // 某些运行时下 env 字段不完整，需防御式配置
      if (runtimeEnv) {
        if (typeof runtimeEnv.allowLocalModels === "boolean") {
          runtimeEnv.allowLocalModels = false;
        }
        if (typeof runtimeEnv.allowRemoteModels === "boolean") {
          runtimeEnv.allowRemoteModels = true;
        }
        if (typeof runtimeEnv.useBrowserCache === "boolean") {
          runtimeEnv.useBrowserCache = true;
        }
      }

      const wasmBackend = runtimeEnv?.backends?.onnx?.wasm;
      setBackend(
        wasmBackend
          ? `ONNX Runtime Web · WASM threads=${String(wasmBackend.numThreads ?? "auto")}`
          : "Transformers.js pipeline",
      );

      const classifier = await pipeline(
        "sentiment-analysis",
        "Xenova/distilbert-base-uncased-finetuned-sst-2-english",
        {
          progress_callback: (state: { status?: string; progress?: number }) => {
            if (state.status === "progress" && typeof state.progress === "number") {
              setProgress(`${Math.round(state.progress)}%`);
            } else if (state.status) {
              setProgress(state.status);
            }
          },
        },
      );

      setLoadMs(Math.round(performance.now() - loadStarted));
      setStatus("ready");

      const inferStarted = performance.now();
      const output = (await classifier(text)) as SentimentLabel[];
      setInferMs(Math.round(performance.now() - inferStarted));
      setLabels(Array.isArray(output) ? output : [output as SentimentLabel]);
      setResultSource("model");
    } catch (caught) {
      setStatus("error");
      const raw = caught instanceof Error ? caught.message : "模型加载或推理失败";
      setError(
        raw.includes("Cannot convert undefined or null to object")
          ? "Transformers 运行时初始化失败，请刷新页面后重试；若仍失败，建议切换浏览器或关闭隐私扩展。"
          : raw,
      );
    }
  }

  function useMockResult() {
    setStatus("ready");
    setError(null);
    setProgress("demo fallback");
    setBackend("Demo fallback · heuristic sentiment");
    setLoadMs(0);
    setInferMs(0);
    setLabels(runMockClassification(text));
    setResultSource("fallback");
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-7 text-slate-400">
        使用{" "}
        <span className="font-mono text-cyan-200/90">@xenova/transformers</span>{" "}
        在浏览器内加载量化 ONNX 模型，推理在 WebAssembly 中执行（零服务端往返）。
        首次会从 Hugging Face CDN 拉取权重并缓存到 IndexedDB。
      </p>

      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={3}
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/40"
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void runClassification()}
          disabled={status === "loading" || !text.trim()}
          className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
        >
          {status === "loading" ? "加载模型…" : "浏览器内推理"}
        </button>
        <button
          type="button"
          onClick={useMockResult}
          disabled={status === "loading" || !text.trim()}
          className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 disabled:opacity-50"
        >
          使用演示结果
        </button>
        {progress ? (
          <span className="self-center font-mono text-xs text-slate-500">{progress}</span>
        ) : null}
      </div>

      {backend ? (
        <p className="font-mono text-xs text-slate-500">{backend}</p>
      ) : null}

      {loadMs != null ? (
        <p className="font-mono text-xs text-slate-500">
          模型就绪 {loadMs} ms
          {inferMs != null ? ` · 推理 ${inferMs} ms` : null}
        </p>
      ) : null}

      {resultSource ? (
        <p
          className={`inline-flex rounded-full border px-3 py-1 text-[11px] ${
            resultSource === "model"
              ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-200"
              : "border-amber-300/30 bg-amber-300/10 text-amber-200"
          }`}
        >
          {resultSource === "model" ? "真实模型结果" : "演示兜底结果"}
        </p>
      ) : null}

      {labels.length ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {labels.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="mt-1 font-mono text-xs text-cyan-200/80">
                {(item.score * 100).toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
