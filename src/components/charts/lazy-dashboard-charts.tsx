"use client";

import dynamic from "next/dynamic";

import { ChartSkeleton } from "@/components/charts/chart-skeleton";

function RadarChartLoading() {
  return <ChartSkeleton height={300} />;
}

function TagChartLoading() {
  return <ChartSkeleton height={280} />;
}

function TimelineChartLoading() {
  return <ChartSkeleton height={280} />;
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

export const LazyTagDistributionChart = dynamic(
  () =>
    import("@/components/charts/tag-distribution-chart").then(
      (mod) => mod.TagDistributionChart,
    ),
  { ssr: false, loading: TagChartLoading },
);

export const LazyNotesTimelineChart = dynamic(
  () =>
    import("@/components/charts/notes-timeline-chart").then(
      (mod) => mod.NotesTimelineChart,
    ),
  { ssr: false, loading: TimelineChartLoading },
);

export const LazyDeliveryFlowSankey = dynamic(
  () =>
    import("@/components/charts/delivery-flow-sankey").then(
      (mod) => mod.DeliveryFlowSankey,
    ),
  { ssr: false, loading: SankeyChartLoading },
);
