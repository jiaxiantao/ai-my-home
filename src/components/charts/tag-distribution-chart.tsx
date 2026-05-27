"use client";

import type { EChartsOption } from "echarts";
import { useMemo } from "react";

import { useECharts } from "@/components/charts/use-echarts";
import { chartPalette, withChartTheme } from "@/lib/chart-theme";

export function TagDistributionChart({
  data,
}: {
  data: Array<{ tag: string; count: number }>;
}) {
  const option = useMemo<EChartsOption>(
    () =>
      withChartTheme({
        grid: { left: 48, right: 16, top: 24, bottom: 48 },
        tooltip: { trigger: "axis" },
        xAxis: {
          type: "category",
          data: data.map((item) => item.tag),
          axisLabel: { rotate: 28, fontSize: 11 },
          axisLine: { lineStyle: { color: "#334155" } },
        },
        yAxis: {
          type: "value",
          splitLine: { lineStyle: { color: "#1e293b" } },
        },
        series: [
          {
            type: "bar",
            data: data.map((item, index) => ({
              value: item.count,
              itemStyle: {
                color: chartPalette[index % chartPalette.length],
                borderRadius: [6, 6, 0, 0],
              },
            })),
            barWidth: "52%",
          },
        ],
      }),
    [data],
  );

  const ref = useECharts(option, [data]);

  return (
    <div
      ref={ref}
      className="h-[280px] w-full"
      role="img"
      aria-label="笔记标签分布柱状图"
    />
  );
}
