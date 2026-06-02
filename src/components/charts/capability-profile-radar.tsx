"use client";

import type { EChartsOption } from "echarts";
import { useMemo } from "react";

import { useECharts } from "@/components/charts/use-echarts";
import {
  CAPABILITY_DIMENSIONS,
  type CapabilityDimensionKey,
} from "@/lib/capability-dimensions";
import { withChartTheme } from "@/lib/chart-theme";
import type { CapabilityProfileScores } from "@/lib/capability-scores";

export function CapabilityProfileRadar({
  scores,
  highlightKey = null,
}: {
  scores: CapabilityProfileScores;
  highlightKey?: CapabilityDimensionKey | null;
}) {
  const option = useMemo<EChartsOption>(() => {
    const values = CAPABILITY_DIMENSIONS.map((dimension) => scores[dimension.key]);
    const max = Math.max(...values, 100);
    const highlightIndex = highlightKey
      ? CAPABILITY_DIMENSIONS.findIndex((item) => item.key === highlightKey)
      : -1;

    return withChartTheme({
      radar: {
        indicator: CAPABILITY_DIMENSIONS.map((dimension, index) => ({
          name: dimension.label,
          max,
          color: highlightIndex === index ? "#22d3ee" : "#64748b",
        })),
        radius: "62%",
        splitLine: { lineStyle: { color: "#1e293b" } },
        axisLine: { lineStyle: { color: "#334155" } },
        axisName: {
          fontSize: highlightIndex >= 0 ? 12 : 11,
          fontWeight: highlightIndex >= 0 ? 600 : 400,
        },
      },
      series: [
        {
          type: "radar",
          data: [
            {
              value: values,
              areaStyle: {
                color:
                  highlightIndex >= 0
                    ? "rgba(34, 211, 238, 0.32)"
                    : "rgba(34, 211, 238, 0.22)",
              },
              lineStyle: { color: "#22d3ee", width: highlightIndex >= 0 ? 3 : 2 },
              itemStyle: {
                color: "#67e8f9",
                borderColor: "#22d3ee",
                borderWidth: 1,
              },
              symbolSize: values.map((_, index) =>
                highlightIndex === index ? 10 : 6,
              ),
            },
          ],
        },
      ],
    });
  }, [scores, highlightKey]);

  const ref = useECharts(option, [scores, highlightKey]);

  return (
    <div
      ref={ref}
      className="h-[300px] w-full"
      role="img"
      aria-label={
        highlightKey
          ? `能力雷达，高亮 ${CAPABILITY_DIMENSIONS.find((item) => item.key === highlightKey)?.label ?? ""}`
          : "能力雷达总览"
      }
    />
  );
}
