import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { iconMap } from "@/lib/icon-map";
import type { DomainDetail } from "@/lib/site-content";

type DomainCardProps = {
  domain: DomainDetail;
};

export function DomainCard({ domain }: DomainCardProps) {
  const Icon = iconMap[domain.icon];

  return (
    <Link
      href={`/domains/${domain.slug}`}
      className="group rounded-[2rem] border border-white/10 bg-white/5 p-7 transition-transform duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-white/8"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-200">
          <Icon className="h-5 w-5" />
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-400">
          {domain.expertiseLevel}
        </span>
      </div>

      <div className="mt-8 space-y-4">
        <div>
          <p className="text-sm text-cyan-200/80">{domain.strapline}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            {domain.title}
          </h3>
        </div>
        <p className="text-sm leading-7 text-slate-300">{domain.summary}</p>
      </div>

      <ul className="mt-8 space-y-3">
        {domain.highlights.map((highlight) => (
          <li key={highlight} className="flex items-center gap-3 text-sm text-slate-200">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
            <span>{highlight}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center gap-2 text-sm font-medium text-cyan-200">
        查看领域详情
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
