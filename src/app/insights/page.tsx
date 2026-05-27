import type { Metadata } from "next";

import { InsightsExplorer } from "@/components/insights-explorer";
import { JsonLd } from "@/components/json-ld";
import { SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { insightArticles } from "@/lib/editorial-content";

export const metadata: Metadata = {
  title: "Insights Library | XJ / Frontend Systems",
  description:
    "A searchable library of engineering insights on frontend architecture, performance governance, AI workflow and full-stack awareness.",
};

export default function InsightsPage() {
  const featured = insightArticles.filter((article) => article.featured).length;

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-10 lg:px-8 lg:py-16">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Insights Library",
            description: metadata.description,
          }}
        />

        <section className="grid gap-8 rounded-[2.25rem] border border-white/10 bg-white/5 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
              Insights Library
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-5xl">
              我会把反复出现的工程判断写成可检索的文章
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              这里沉淀的是我在架构判断、性能治理、AI 工作流和全栈协作上的长期观察。很多内容平时就散落在项目和对话里，我更愿意把它们整理成能持续复用的文章。
            </p>
          </div>

          <div className="grid gap-4">
            <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
                Snapshot
              </p>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-white">
                {insightArticles.length}
              </p>
              <p className="mt-2 text-sm text-slate-400">篇结构化工程洞察</p>
            </article>

            <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
                Featured
              </p>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-white">
                {featured}
              </p>
              <p className="mt-2 text-sm text-slate-400">篇重点展示文章</p>
            </article>
          </div>
        </section>

        <section className="space-y-10">
          <SectionHeading
            eyebrow="Filterable Reading"
            title="可搜索、可分类、可持续扩展的文章中心"
            description="我把文章做成可搜索、可分类的结构，后续继续补内容时只需要维护数据和正文，不需要再改页面骨架。"
          />

          <InsightsExplorer articles={insightArticles} />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
