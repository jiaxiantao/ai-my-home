"use client";

import dynamic from "next/dynamic";

import { ChartSkeleton } from "@/components/charts/chart-skeleton";

export const LazyTagDistributionChart = dynamic(
  () =>
    import("@/components/charts/tag-distribution-chart").then(
      (mod) => mod.TagDistributionChart,
    ),
  { ssr: false, loading: () => <ChartSkeleton height={260} /> },
);

export const LazyNotesTimelineChart = dynamic(
  () =>
    import("@/components/charts/notes-timeline-chart").then(
      (mod) => mod.NotesTimelineChart,
    ),
  { ssr: false, loading: () => <ChartSkeleton height={260} /> },
);
