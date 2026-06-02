import { ArrowRight } from "lucide-react";

import type { CaseStudy } from "@/lib/site-content";

type CaseStudyCardProps = {
  caseStudy: CaseStudy;
};

export function CaseStudyCard({ caseStudy }: CaseStudyCardProps) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-7">
      <div className="flex flex-wrap gap-2">
        {caseStudy.stack.map((item) => (
          <span
            key={item}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        <h3 className="text-2xl font-semibold tracking-tight text-white">
          {caseStudy.title}
        </h3>
        <p className="text-sm leading-7 text-slate-300">{caseStudy.summary}</p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Context
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-300">{caseStudy.context}</p>
        </div>
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/70">
            Impact
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-100">{caseStudy.impact}</p>
        </div>
      </div>

      <a
        href={`/cases/${caseStudy.slug}`}
        className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-white"
      >
        查看完整案例拆解
        <ArrowRight className="h-4 w-4" />
      </a>
    </article>
  );
}
