import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  className?: string;
};

export function MetricCard({
  label,
  value,
  detail,
  className,
}: MetricCardProps) {
  return (
    <article
      className={cn(
        "rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.2)] backdrop-blur",
        className,
      )}
    >
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-3 text-sm leading-7 text-slate-300">{detail}</p>
    </article>
  );
}
