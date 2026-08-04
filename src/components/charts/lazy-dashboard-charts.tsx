"use client";

import dynamic from "next/dynamic";

import { ChartSkeleton } from "@/components/charts/chart-skeleton";

function RadarChartLoading() {
  return <ChartSkeleton height={300} />;
}

function SankeyChartLoading() {
  return <ChartSkeleton height={320} />;
}

export const LazySystemRadarChart = dynamic(
  () =>
    import("@/components/charts/system-radar-chart").then(
      (mod) => mod.SystemRadarChart,
    ),
  { ssr: false, loading: RadarChartLoading },
);

export const LazyDeliveryFlowSankey = dynamic(
  () =>
    import("@/components/charts/delivery-flow-sankey").then(
      (mod) => mod.DeliveryFlowSankey,
    ),
  { ssr: false, loading: SankeyChartLoading },
);
