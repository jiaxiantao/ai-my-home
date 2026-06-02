import { ArrowRight } from "lucide-react";

import type { CaseStudy } from "@/lib/site-content";

export function CaseProofCard({ caseStudy }: { caseStudy: CaseStudy }) {
  return (
    <article className="flex h-full flex-col rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6">
      <div className="flex flex-wrap gap-2">
        {caseStudy.stack.map((item) => (
          <span
            key={item}
            className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-slate-400"
          >
            {item}
          </span>
        ))}
      </div>

      <h3 className="mt-4 text-lg font-semibold text-white">{caseStudy.title}</h3>

      <ul className="mt-4 flex-1 space-y-2.5">
        {caseStudy.proofLines.map((line) => (
          <li key={line} className="flex gap-2.5 text-sm leading-6 text-slate-300">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cyan-300" />
            <span>{line}</span>
          </li>
        ))}
      </ul>

      <a
        href={`/cases/${caseStudy.slug}`}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-white"
      >
        案例拆解
        <ArrowRight className="h-4 w-4" />
      </a>
    </article>
  );
}
