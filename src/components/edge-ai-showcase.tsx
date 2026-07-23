"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { BrainCircuit, Cpu, Scan, Sparkles } from "lucide-react";

import { ExternalProjectLink } from "@/components/external-project-link";
import { FrontIntelligenceComposerDemo } from "@/components/demos/front-intelligence-composer-demo";
import { EXTERNAL_PROJECTS, HOME_AGENT_AGENTS_URL } from "@/lib/external-projects";

const BrowserMlDemo = dynamic(
  () =>
    import("@/components/demos/browser-ml-demo").then((mod) => mod.BrowserMlDemo),
  { ssr: false, loading: () => <DemoSkeleton label="Transformers.js" /> },
);

const WasmAccelerationDemo = dynamic(
  () =>
    import("@/components/demos/wasm-acceleration-demo").then(
      (mod) => mod.WasmAccelerationDemo,
    ),
  { loading: () => <DemoSkeleton label="WASM 基准" /> },
);

const MediapipePoseDemo = dynamic(
  () =>
    import("@/components/demos/mediapipe-pose-demo").then((mod) => mod.MediapipePoseDemo),
  { ssr: false, loading: () => <DemoSkeleton label="MediaPipe Pose" /> },
);

type EdgeTabId = "transformers" | "wasm" | "pose" | "composer";

const tabs: Array<{
  id: EdgeTabId;
  title: string;
  tech: string;
  icon: typeof Sparkles;
}> = [
  {
    id: "transformers",
    title: "Transformers.js",
    tech: "ONNX · 情感分类",
    icon: Sparkles,
  },
  {
    id: "wasm",
    title: "WASM / WebGL",
    tech: "算子加速认知",
    icon: Cpu,
  },
  {
    id: "pose",
    title: "MediaPipe Pose",
    tech: "姿势估计 · 摄像头",
    icon: Scan,
  },
  {
    id: "composer",
    title: "Prompt 编排",
    tech: "意图识别 · 改写",
    icon: BrainCircuit,
  },
];

function DemoSkeleton({ label }: { label: string }) {
  return (
    <p className="text-sm text-slate-500">正在加载 {label}…</p>
  );
}

export function EdgeAiShowcase() {
  const [active, setActive] = useState<EdgeTabId>("transformers");

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === active;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                isActive
                  ? "border-violet-300/35 bg-violet-300/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-violet-200/80" />
                <span className="text-sm font-semibold text-white">{tab.title}</span>
              </div>
              <span className="mt-1 block font-mono text-[10px] text-slate-500">
                {tab.tech}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-5 md:p-7">
        {active === "transformers" ? <BrowserMlDemo /> : null}
        {active === "wasm" ? <WasmAccelerationDemo /> : null}
        {active === "pose" ? <MediapipePoseDemo /> : null}
        {active === "composer" ? <FrontIntelligenceComposerDemo compact /> : null}
      </div>

      <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/5 px-5 py-4">
        <p className="text-sm text-slate-300">
          Agent 工具循环已拆分为独立项目{" "}
          <ExternalProjectLink
            href={HOME_AGENT_AGENTS_URL}
            label={EXTERNAL_PROJECTS.homeAgent.label}
            className="font-semibold text-cyan-100"
          />
          ，可在仓库中体验规划 → 工具调用 → SSE trace 完整链路。
        </p>
      </div>
    </div>
  );
}
