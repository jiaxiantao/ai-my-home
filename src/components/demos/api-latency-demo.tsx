"use client";

import { useMemo, useState } from "react";

import { useECharts } from "@/components/charts/use-echarts";
import { withChartTheme } from "@/lib/chart-theme";

type EndpointSpec = {
  id: string;
  label: string;
  url: string;
};

const endpoints: EndpointSpec[] = [
  { id: "health", label: "GET /api/health", url: "/api/health" },
  { id: "dashboard", label: "GET /api/dashboard", url: "/api/dashboard" },
  { id: "profile", label: "GET /api/profile", url: "/api/profile" },
  {
    id: "search",
    label: "GET /api/notes/search",
    url: "/api/notes/search?q=架构&limit=5",
  },
];

type BenchRow = {
  label: string;
  ms: number;
  status: number;
};

export function ApiLatencyDemo() {
  const [selected, setSelected] = useState<string[]>([
    "health",
    "dashboard",
    "search",
  ]);
  const [rows, setRows] = useState<BenchRow[]>([]);
  const [running, setRunning] = useState(false);

  const chartOption = useMemo(
    () =>
      withChartTheme({
        grid: { left: 140, right: 24, top: 16, bottom: 24 },
        xAxis: { type: "value", splitLine: { lineStyle: { color: "#1e293b" } } },
        yAxis: {
          type: "category",
          data: rows.map((row) => row.label).reverse(),
          axisLine: { show: false },
        },
        series: [
          {
            type: "bar",
            data: rows
              .map((row) => ({
                value: row.ms,
                itemStyle: {
                  color: row.status >= 400 ? "#fb7185" : "#22d3ee",
                  borderRadius: [0, 6, 6, 0],
                },
              }))
              .reverse(),
            barWidth: 14,
          },
        ],
      }),
    [rows],
  );

  const chartRef = useECharts(chartOption, [rows]);

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  async function runBenchmark() {
    setRunning(true);
    const specs = endpoints.filter((item) => selected.includes(item.id));
    const results: BenchRow[] = [];

    await Promise.all(
      specs.map(async (spec) => {
        const started = performance.now();

        try {
          const response = await fetch(spec.url, { cache: "no-store" });
          const ms = Math.round(performance.now() - started);
          results.push({
            label: spec.label,
            ms,
            status: response.status,
          });
        } catch {
          results.push({
            label: spec.label,
            ms: Math.round(performance.now() - started),
            status: 0,
          });
        }
      }),
    );

    setRows(results.sort((a, b) => b.ms - a.ms));
    setRunning(false);
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {endpoints.map((item) => {
          const active = selected.includes(item.id);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              className={`rounded-full border px-3 py-1.5 font-mono text-xs transition ${
                active
                  ? "border-cyan-300/35 bg-cyan-300/10 text-cyan-100"
                  : "border-white/10 text-slate-400 hover:border-white/20"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={running || !selected.length}
        onClick={() => void runBenchmark()}
        className="w-fit rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-50"
      >
        {running ? "压测中…" : "并行请求并计时"}
      </button>

      <div
        ref={chartRef}
        className="h-[220px] w-full rounded-2xl border border-white/10 bg-slate-950/60"
      />

      {rows.length ? (
        <div className="grid gap-2 font-mono text-xs text-slate-400">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"
            >
              <span>{row.label}</span>
              <span>
                {row.ms} ms · HTTP {row.status || "ERR"}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
