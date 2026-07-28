import { ArrowRight } from "lucide-react";

import { BorderGlow } from "@/components/reactbits/border-glow";
import { StarBorder } from "@/components/reactbits/star-border";
import type { InsightArticle } from "@/lib/editorial-content";

type InsightCardProps = {
  article: InsightArticle;
};

export function InsightCard({ article }: InsightCardProps) {
  return (
    <BorderGlow
      className="rounded-[1.75rem]"
      glowColor="rgba(103, 232, 249, 0.26)"
      backgroundColor="rgba(2, 6, 23, 0.28)"
    >
      <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-6">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-cyan-100">
            {article.category}
          </span>
          <span className="text-slate-500">{article.publishedAt}</span>
          <span className="text-slate-500">{article.readingTime}</span>
        </div>

        <h3 className="mt-5 text-2xl font-semibold tracking-tight text-white">
          {article.title}
        </h3>
        <p className="mt-4 text-sm leading-7 text-slate-300">{article.summary}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
            >
              {tag}
            </span>
          ))}
        </div>

        <StarBorder className="mt-7 self-start rounded-full" color="rgba(103, 232, 249, 0.82)">
          <a
            href={`/insights/${article.slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-slate-950/95 px-3.5 py-1.5 text-sm font-semibold text-cyan-200 transition hover:text-white"
          >
            阅读完整洞察
            <ArrowRight className="h-4 w-4" />
          </a>
        </StarBorder>
      </article>
    </BorderGlow>
  );
}
