import type { Metadata } from "next";

import { ExperienceAccordion } from "@/components/experience-accordion";
import { JsonLd } from "@/components/json-ld";
import { SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { experienceChapters } from "@/lib/ongoing-content";

export const metadata: Metadata = {
  title: "Experience | XJ / Frontend Systems",
  description:
    "A stage-based view of my work experience across delivery, system design, engineering infrastructure and AI-assisted workflow.",
};

export default function ExperiencePage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-10 lg:px-8 lg:py-16">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Experience",
            description: metadata.description,
          }}
        />

        <section className="grid gap-8 rounded-[2.25rem] border border-white/10 bg-white/5 p-8 lg:grid-cols-[1.08fr_0.92fr] lg:p-10">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
              Experience
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-5xl">
              我把工作经历拆成几个阶段来看，而不是压缩成一段简介
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              很多能力不是突然出现的，而是在不同阶段一点点长出来的。我更喜欢按阶段去回看：当时主要负责什么、开始承担哪些判断、又把哪些经验逐渐沉淀成稳定的工作方式。
            </p>
          </div>

          <div className="grid gap-4">
            <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
                Chapters
              </p>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-white">
                {experienceChapters.length}
              </p>
              <p className="mt-2 text-sm text-slate-400">个阶段性的工作切面</p>
            </article>

            <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
                Focus
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                从页面交付、模块 owner，到工程系统、内容沉淀和 AI 工作流，我更想把这些变化写成一条连续的路径。
              </p>
            </article>
          </div>
        </section>

        <section className="space-y-10">
          <SectionHeading
            eyebrow="Stage View"
            title="每个阶段都对应了不同的关注点和工作方式"
            description="我会更关注这些变化是怎么发生的：哪些事情开始变成日常，哪些判断开始变成系统，哪些内容开始从经验变成资产。"
          />

          <ExperienceAccordion items={experienceChapters} />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
