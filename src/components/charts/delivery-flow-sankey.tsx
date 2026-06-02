"use client";

import type { EChartsOption } from "echarts";
import { useMemo } from "react";

import { useECharts } from "@/components/charts/use-echarts";
import { withChartTheme } from "@/lib/chart-theme";

type FlowSankeyProps = {
  notesCount: number;
  domainsCount: number;
  caseStudiesCount: number;
};

export function DeliveryFlowSankey({
  notesCount,
  domainsCount,
  caseStudiesCount,
}: FlowSankeyProps) {
  const option = useMemo<EChartsOption>(
    () =>
      withChartTheme({
        tooltip: { trigger: "item" },
        series: [
          {
            type: "sankey",
            emphasis: { focus: "adjacency" },
            lineStyle: { color: "gradient", curveness: 0.5, opacity: 0.35 },
            label: { color: "#e2e8f0", fontSize: 11 },
            data: [
              { name: "Next.js BFF" },
              { name: "PostgreSQL" },
              { name: "Note Search" },
              { name: "/api/chat" },
              { name: "Cases" },
              { name: "Insights" },
            ],
            links: [
              { source: "Next.js BFF", target: "PostgreSQL", value: Math.max(notesCount, 1) },
              {
                source: "PostgreSQL",
                target: "Note Search",
                value: Math.max(notesCount, 1),
              },
              {
                source: "Note Search",
                target: "/api/chat",
                value: Math.max(Math.ceil(notesCount * 0.7), 1),
              },
              {
                source: "Next.js BFF",
                target: "Cases",
                value: Math.max(caseStudiesCount, 1),
              },
              {
                source: "Next.js BFF",
                target: "Insights",
                value: Math.max(domainsCount, 1),
              },
            ],
          },
        ],
      }),
    [caseStudiesCount, domainsCount, notesCount],
  );

  const ref = useECharts(option, [caseStudiesCount, domainsCount, notesCount]);

  return (
    <div
      ref={ref}
      className="h-[320px] w-full"
      role="img"
      aria-label="全栈交付链路桑基图"
    />
  );
}
