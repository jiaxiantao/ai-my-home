import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

import { SectionHeading } from "@/components/section-heading";
import { getDomainBySlug } from "@/lib/content-service";
import { iconMap } from "@/lib/icon-map";
import { domainDetails } from "@/lib/site-content";

type DomainPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return domainDetails.map((domain) => ({
    slug: domain.slug,
  }));
}

export async function generateMetadata({
  params,
}: DomainPageProps): Promise<Metadata> {
  const { slug } = await params;
  const domain = await getDomainBySlug(slug);

  if (!domain) {
    return {
      title: "领域未找到",
    };
  }

  return {
    title: `${domain.title} | XJ / Frontend Systems`,
    description: domain.summary,
  };
}

export default async function DomainPage({ params }: DomainPageProps) {
  const { slug } = await params;
  const domain = await getDomainBySlug(slug);

  if (!domain) {
    notFound();
  }

  const Icon = iconMap[domain.icon];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-10 lg:px-8 lg:py-16">
        <section className="grid gap-8 rounded-[2.25rem] border border-white/10 bg-white/5 p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
          <div>
            <Link
              href="/#topology"
              className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              返回首页总览
            </Link>

            <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
              <Icon className="h-4 w-4" />
              {domain.expertiseLevel}
            </div>

            <div className="mt-8 space-y-5">
              <p className="text-sm uppercase tracking-[0.28em] text-slate-400">
                {domain.strapline}
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                {domain.title}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-slate-300">
                {domain.overview}
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
                Focus Highlights
              </p>
              <ul className="mt-5 space-y-3">
                {domain.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-3 text-sm text-slate-200">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
                Working Principles
              </p>
              <div className="mt-5 grid gap-4">
                {domain.principles.map((principle) => (
                  <div
                    key={principle}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300"
                  >
                    {principle}
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="space-y-10">
          <SectionHeading
            eyebrow="Deep Dive"
            title="打开一个领域后，看到的是可复用的方法与判断逻辑"
            description="每个专题都不只是技术名词，而是围绕业务复杂度、团队协作与长期维护给出的工程判断。你后续可以继续补充更多案例、文章和深入拆解。"
          />

          <div className="grid gap-6">
            {domain.topics.map((topic, index) => (
              <article
                key={topic.title}
                className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-7"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200/75">
                      Topic 0{index + 1}
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                      {topic.title}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      {topic.summary}
                    </p>
                  </div>
                  <ArrowRight className="hidden h-5 w-5 text-slate-500 md:block" />
                </div>

                <div className="markdown mt-8">
                  <ReactMarkdown>{topic.body}</ReactMarkdown>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <a
            href="/resume"
            className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6 transition hover:border-cyan-300/30 hover:bg-white/7"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
              Resume
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
              看结构化简历页
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              用更明确的维度展示能力边界、成长路径和技术表达方式。
            </p>
          </a>

          <a
            href="/playbooks"
            className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6 transition hover:border-cyan-300/30 hover:bg-white/7"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
              Playbooks
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
              看工程方法论页
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              通过可点击的 playbook 展示你处理复杂问题的稳定套路。
            </p>
          </a>

          <a
            href="/api/profile"
            className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6 transition hover:border-cyan-300/30 hover:bg-white/7"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
              API
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
              看结构化资料输出
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              通过 JSON route handler 展示内容建模、聚合输出和工程完整性。
            </p>
          </a>
        </section>
      </main>

  );
}
