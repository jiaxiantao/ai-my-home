"use client";

import type { EChartsOption } from "echarts";
import { useMemo } from "react";

import { useECharts } from "@/components/charts/use-echarts";
import { withChartTheme } from "@/lib/chart-theme";

export function SystemRadarChart({
  values,
}: {
  values: {
    notes: number;
    domains: number;
    cases: number;
    tracks: number;
    demos: number;
  };
}) {
  const max = Math.max(
    values.notes,
    values.domains,
    values.cases,
    values.tracks,
    values.demos,
    1,
  );

  const option = useMemo<EChartsOption>(
    () =>
      withChartTheme({
        radar: {
          indicator: [
            { name: "Notes", max },
            { name: "Domains", max },
            { name: "Cases", max },
            { name: "Tracks", max },
            { name: "Demos", max },
          ],
          splitLine: { lineStyle: { color: "#1e293b" } },
          axisLine: { lineStyle: { color: "#334155" } },
        },
        series: [
          {
            type: "radar",
            data: [
              {
                value: [
                  values.notes,
                  values.domains,
                  values.cases,
                  values.tracks,
                  values.demos,
                ],
                areaStyle: { color: "rgba(34, 211, 238, 0.25)" },
                lineStyle: { color: "#22d3ee", width: 2 },
                itemStyle: { color: "#67e8f9" },
              },
            ],
          },
        ],
      }),
    [max, values],
  );

  const ref = useECharts(option, [values]);

  return (
    <div
      ref={ref}
      className="h-[260px] w-full"
      role="img"
      aria-label="系统规模雷达图"
    />
  );
}
