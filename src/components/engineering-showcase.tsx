"use client";

import { useState } from "react";
import { Activity, Cpu, Gauge, Layers, Radio, Search, Workflow } from "lucide-react";

import { ApiLatencyDemo } from "@/components/demos/api-latency-demo";
import { CheckoutFlowDemo } from "@/components/demos/checkout-flow-demo";
import { DebounceThrottleDemo } from "@/components/demos/debounce-throttle-demo";
import { SseInspectorDemo } from "@/components/demos/sse-inspector-demo";
import { SearchCompareDemo } from "@/components/demos/search-compare-demo";
import { VirtualScrollDemo } from "@/components/demos/virtual-scroll-demo";
import { WebVitalsDemo } from "@/components/demos/web-vitals-demo";
import { WorkerComputeDemo } from "@/components/demos/worker-compute-demo";

type DemoId =
  | "vitals"
  | "api"
  | "virtual"
  | "state"
  | "sse"
  | "worker"
  | "search"
  | "debounce";

const demos: Array<{
  id: DemoId;
  title: string;
  tech: string;
  icon: typeof Gauge;
}> = [
  {
    id: "vitals",
    title: "Web Vitals 实测",
    tech: "PerformanceObserver",
    icon: Gauge,
  },
  {
    id: "api",
    title: "API 延迟瀑布",
    tech: "fetch + ECharts",
    icon: Activity,
  },
  {
    id: "virtual",
    title: "虚拟列表 10k",
    tech: "windowing",
    icon: Layers,
  },
  {
    id: "state",
    title: "结账状态机",
    tech: "useReducer",
    icon: Workflow,
  },
  {
    id: "sse",
    title: "SSE 帧监视",
    tech: "ReadableStream",
    icon: Radio,
  },
  {
    id: "worker",
    title: "Web Worker",
    tech: "非阻塞计算",
    icon: Cpu,
  },
  {
    id: "search",
    title: "检索对比",
    tech: "pg_trgm vs memory",
    icon: Search,
  },
  {
    id: "debounce",
    title: "debounce / throttle",
    tech: "输入节奏控制",
    icon: Workflow,
  },
];

export function EngineeringShowcase() {
  const [active, setActive] = useState<DemoId>("vitals");

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2">
        {demos.map((demo) => {
          const Icon = demo.icon;
          const isActive = demo.id === active;

          return (
            <button
              key={demo.id}
              type="button"
              onClick={() => setActive(demo.id)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                isActive
                  ? "border-cyan-300/35 bg-cyan-300/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-cyan-200/80" />
                <span className="text-sm font-semibold text-white">{demo.title}</span>
              </div>
              <span className="mt-1 block font-mono text-[10px] text-slate-500">
                {demo.tech}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-5 md:p-7">
        {active === "vitals" ? <WebVitalsDemo /> : null}
        {active === "api" ? <ApiLatencyDemo /> : null}
        {active === "virtual" ? <VirtualScrollDemo /> : null}
        {active === "state" ? <CheckoutFlowDemo /> : null}
        {active === "sse" ? <SseInspectorDemo /> : null}
        {active === "worker" ? <WorkerComputeDemo /> : null}
        {active === "search" ? <SearchCompareDemo /> : null}
        {active === "debounce" ? <DebounceThrottleDemo /> : null}
      </div>
    </div>
  );
}
