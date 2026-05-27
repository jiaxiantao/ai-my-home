/* eslint-disable @next/next/no-html-link-for-pages */
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getInsightBySlug, insightArticles } from "@/lib/editorial-content";

type InsightPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return insightArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: InsightPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getInsightBySlug(slug);

  if (!article) {
    return {
      title: "文章未找到",
    };
  }

  return {
    title: `${article.title} | XJ / Insights`,
    description: article.summary,
  };
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "long",
  }).format(new Date(date));
}

export default async function InsightDetailPage({ params }: InsightPageProps) {
  const { slug } = await params;
  const article = getInsightBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-14 px-6 py-10 lg:px-8 lg:py-16">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.summary,
            datePublished: article.publishedAt,
            articleSection: article.category,
            keywords: article.tags,
          }}
        />

        <section className="rounded-[2.25rem] border border-white/10 bg-white/5 p-8 lg:p-10">
          <a
            href="/insights"
            className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            返回文章中心
          </a>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs">
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-cyan-100">
              {article.category}
            </span>
            <span className="text-slate-500">{formatDate(article.publishedAt)}</span>
            <span className="text-slate-500">{article.readingTime}</span>
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white md:text-5xl">
            {article.title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            {article.summary}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8">
          <div className="markdown">
            <ReactMarkdown>{article.body}</ReactMarkdown>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <article className="rounded-[1.75rem] border border-cyan-300/20 bg-cyan-300/10 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/75">
              Why this matters
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
              我为什么会把这篇内容留下来
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-100">
              我写这类文章不是为了把页面填满，而是为了把那些反复出现、反复需要判断的问题留下来。很多时候，内容一旦被写清楚，后面的沟通和决策都会顺很多。
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
              Key Takeaways
            </p>
            <ul className="mt-5 space-y-3">
              {article.takeaways.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-slate-300">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <a
              href="/playbooks"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-white"
            >
              继续查看工程方法论
              <ArrowRight className="h-4 w-4" />
            </a>
          </article>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
