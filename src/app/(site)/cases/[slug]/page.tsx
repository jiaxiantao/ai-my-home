/* eslint-disable @next/next/no-html-link-for-pages */
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { SectionHeading } from "@/components/section-heading";
import {
  caseStudyDetails,
  getCaseStudyDetailBySlug,
} from "@/lib/editorial-content";

type CasePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return caseStudyDetails.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: CasePageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = getCaseStudyDetailBySlug(slug);

  if (!detail) {
    return {
      title: "案例未找到",
    };
  }

  return {
    title: `${detail.title} | XJ / Cases`,
    description: detail.summary,
  };
}

export default async function CaseDetailPage({ params }: CasePageProps) {
  const { slug } = await params;
  const detail = getCaseStudyDetailBySlug(slug);

  if (!detail) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-10 lg:px-8 lg:py-16">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: detail.title,
            description: detail.summary,
          }}
        />

        <section className="grid gap-8 rounded-[2.25rem] border border-white/10 bg-white/5 p-8 lg:grid-cols-[1.12fr_0.88fr] lg:p-10">
          <div>
            <a
              href="/cases"
              className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              返回案例列表
            </a>

            <p className="mt-8 text-sm uppercase tracking-[0.28em] text-slate-400">
              {detail.strapline}
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-5xl">
              {detail.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              {detail.summary}
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-cyan-300/20 bg-cyan-300/10 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/75">
              Core Problem
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-100">{detail.problem}</p>
          </div>
        </section>

        <section className="space-y-10">
          <SectionHeading
            eyebrow="Case Breakdown"
            title="把案例拆成约束、决策、执行和结果"
            description="这种表达方式更能体现工程判断力，因为它展示的是你如何思考复杂问题，而不是只给出一个最终结果。"
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <CardList title="Constraints" items={detail.constraints} />
            <CardList title="Key Decisions" items={detail.decisions} />
            <CardList title="Execution" items={detail.execution} />
            <CardList title="Outcomes" items={detail.outcomes} accent />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
              Lessons Learned
            </p>
            <ul className="mt-5 space-y-3">
              {detail.lessons.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-slate-300">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
              Related Domains
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {detail.relatedDomains.map((item) => (
                <a
                  key={item.slug}
                  href={`/domains/${item.slug}`}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/30 hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </article>
        </section>
      </main>

  );
}

function CardList({
  title,
  items,
  accent = false,
}: {
  title: string;
  items: string[];
  accent?: boolean;
}) {
  return (
    <article
      className={`rounded-[1.75rem] border p-6 ${
        accent
          ? "border-cyan-300/20 bg-cyan-300/10"
          : "border-white/10 bg-slate-950/80"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
        {title}
      </p>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm text-slate-300">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
