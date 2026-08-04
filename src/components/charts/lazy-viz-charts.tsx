"use client";

import dynamic from "next/dynamic";

import { ChartSkeleton } from "@/components/charts/chart-skeleton";

function TagChartLoading() {
  return <ChartSkeleton height={280} />;
}

export const LazyTagDistributionChart = dynamic(
  () =>
    import("@/components/charts/tag-distribution-chart").then(
      (mod) => mod.TagDistributionChart,
    ),
  { ssr: false, loading: TagChartLoading },
);
