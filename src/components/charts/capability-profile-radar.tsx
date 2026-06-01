"use client";

import type { EChartsOption } from "echarts";
import { useMemo } from "react";

import { useECharts } from "@/components/charts/use-echarts";
import { withChartTheme } from "@/lib/chart-theme";
import type { CapabilityProfileScores } from "@/lib/capability-scores";

export function CapabilityProfileRadar({
  scores,
}: {
  scores: CapabilityProfileScores;
}) {
  const option = useMemo<EChartsOption>(() => {
    const values = [
      scores.fullstackApi,
      scores.engineeringDemos,
      scores.cicdRelease,
      scores.edgeAi,
      scores.visualization,
      scores.security,
    ];
    const max = Math.max(...values, 100);

    return (
      withChartTheme({
        radar: {
          indicator: [
            { name: "全栈 API", max },
            { name: "工程 Demo", max },
            { name: "CI/CD", max },
            { name: "端侧 AI", max },
            { name: "3D 可视化", max },
            { name: "安全治理", max },
          ],
          radius: "62%",
          splitLine: { lineStyle: { color: "#1e293b" } },
          axisLine: { lineStyle: { color: "#334155" } },
          axisName: { color: "#94a3b8", fontSize: 11 },
        },
        series: [
          {
            type: "radar",
            data: [
              {
                value: values,
                areaStyle: { color: "rgba(34, 211, 238, 0.22)" },
                lineStyle: { color: "#22d3ee", width: 2 },
                itemStyle: { color: "#67e8f9" },
              },
            ],
          },
        ],
      })
    );
  }, [scores]);

  const ref = useECharts(option, [scores]);

  return (
    <div
      ref={ref}
      className="h-[300px] w-full"
      role="img"
      aria-label="能力雷达总览"
    />
  );
}
