export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div
      className="animate-pulse rounded-xl border border-white/5 bg-white/5"
      style={{ height }}
      aria-hidden
    />
  );
}
