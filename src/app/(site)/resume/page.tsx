import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Download, FileJson } from "lucide-react";

import { CareerTimeline } from "@/components/career-timeline";
import { CopyButton } from "@/components/copy-button";
import { MetricCard } from "@/components/metric-card";
import { SectionHeading } from "@/components/section-heading";
import { TechStackBoard } from "@/components/tech-stack-board";
import { getHomepageContent } from "@/lib/content-service";
import {
  careerTimeline,
  resumeDimensions,
  techStackGroups,
} from "@/lib/showcase-content";

export const metadata: Metadata = {
  title: "Resume Snapshot | XJ / Frontend Systems",
  description:
    "Structured resume snapshot for showcasing frontend architecture, engineering depth and long-term technical growth.",
};

export default async function ResumePage() {
  const { profile, metrics, domains } = await getHomepageContent();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-10 lg:px-8 lg:py-16">
        <section className="grid gap-8 rounded-[2.25rem] border border-white/10 bg-white/5 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
              Resume Snapshot
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-5xl">
              我把经历、判断和内容入口整理成了一份结构化版本
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              {profile.summary}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <CopyButton value={siteUrl} label="复制站点链接" />
              <CopyButton value={`${siteUrl}/api/profile`} label="复制简历 API" />
              <a
                href="/api/profile"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-white/25 hover:bg-white/8"
              >
                <FileJson className="h-4 w-4" />
                打开 JSON
              </a>
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-white/25 hover:bg-white/8"
              >
                <Download className="h-4 w-4" />
                GitHub 主页
              </a>
            </div>
          </div>

          <div className="grid gap-4">
            {resumeDimensions.map((item) => (
              <article
                key={item.title}
                className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6"
              >
                <h2 className="text-xl font-semibold text-white">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">{item.summary}</p>
                <ul className="mt-5 space-y-3">
                  {item.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 text-sm text-slate-300">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              detail={metric.detail}
            />
          ))}
        </section>

        <section className="space-y-10">
          <SectionHeading
            eyebrow="Growth Path"
            title="职业成长路径比一句“6 年经验”更有说服力"
            description="我把这几年的变化拆成几个阶段，这样很多能力为什么会长成现在这个样子，会更容易看清楚。"
          />

          <CareerTimeline items={careerTimeline} />
        </section>

        <section className="space-y-10">
          <SectionHeading
            eyebrow="Capability Snapshot"
            title="这些入口对应的是我长期在做的几类事情"
            description="每个领域都不是一句关键词，而是我持续在记录和扩展的内容模块。"
          />

          <div className="grid gap-5 lg:grid-cols-2">
            {domains.map((domain) => (
              <Link
                key={domain.slug}
                href={`/domains/${domain.slug}`}
                className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6 transition hover:border-cyan-300/30 hover:bg-white/7"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
                  {domain.expertiseLevel}
                </p>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                  {domain.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-300">{domain.summary}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">
                  查看详情
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-10">
          <SectionHeading
            eyebrow="Tech Stack"
            title="技术栈展示成系统视图，而不是平铺名词"
            description="我更关心这些能力如何组合成完整交付体系，而不是把它们拆成一串互不相关的名词。"
          />

          <TechStackBoard items={techStackGroups} />
        </section>
      </main>

  );
}
