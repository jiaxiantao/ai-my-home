import type { Metadata } from "next";

import { CaseStudyCard } from "@/components/case-study-card";
import { JsonLd } from "@/components/json-ld";
import { SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getHomepageContent } from "@/lib/content-service";

export const metadata: Metadata = {
  title: "Case Narratives | XJ / Frontend Systems",
  description:
    "Case narratives focused on engineering judgment, trade-offs, execution strategy and long-term impact.",
};

export default async function CasesPage() {
  const { caseStudies } = await getHomepageContent();

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-10 lg:px-8 lg:py-16">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Case Narratives",
            description: metadata.description,
          }}
        />

        <section className="rounded-[2.25rem] border border-white/10 bg-white/5 p-8 lg:p-10">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Case Narratives
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-5xl">
            我会把案例拆成问题、约束、决策和结果
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            我不太想把案例写成项目经历流水账，所以这里更像是我对问题、约束、推进方式和结果的重新整理。重点不只是做了什么，而是当时为什么这么判断。
          </p>
        </section>

        <section className="space-y-10">
          <SectionHeading
            eyebrow="Case Collection"
            title="每个案例都可以继续点开，看更完整的拆解"
            description="我把问题、约束、关键决策、执行路径和复盘要点拆开来记录。这样回头看时，很多当时的判断依据也都还在。"
          />

          <div className="grid gap-6">
            {caseStudies.map((caseStudy) => (
              <CaseStudyCard key={caseStudy.slug} caseStudy={caseStudy} />
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
