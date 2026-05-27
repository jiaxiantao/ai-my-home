import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PlaybookAccordion } from "@/components/playbook-accordion";
import { SectionHeading } from "@/components/section-heading";
import { playbooks } from "@/lib/showcase-content";

export const metadata: Metadata = {
  title: "Engineering Playbooks | XJ / Frontend Systems",
  description:
    "Interactive engineering playbooks for project bootstrapping, refactoring, performance governance and cross-team delivery.",
};

export default function PlaybooksPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-10 lg:px-8 lg:py-16">
        <section className="grid gap-8 rounded-[2.25rem] border border-white/10 bg-white/5 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
              Engineering Playbooks
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-5xl">
              我把反复使用的处理路径写成了 playbook
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              我更想把“遇到这种复杂度时我通常怎么判断、怎么拆解、怎么推进”留下来。这里的 playbook 就是这部分内容的集中整理。
            </p>
          </div>

          <div className="grid gap-4">
            {[
              "把复杂场景拆成可沟通、可推进、可复盘的步骤。",
              "体现的不只是技术知识，还有优先级、风险和协作判断。",
              "很多内容本来就在项目里反复出现，所以我更愿意把它们沉淀成固定入口。",
            ].map((item, index) => (
              <article
                key={item}
                className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
                  Signal 0{index + 1}
                </p>
                <p className="mt-4 text-sm leading-7 text-slate-300">{item}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-10">
          <SectionHeading
            eyebrow="How I Usually Work"
            title="四类高频复杂场景，对应四套方法论"
            description="这些内容更接近我平时的工程处理方式样本。相比只写“熟悉某项能力”，我更愿意把路径和判断一起留下来。"
          />

          <PlaybookAccordion items={playbooks} />
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
            Next Step
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
            从这里继续往下，能回到具体领域和案例里
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
            对我来说，方法论更像“我通常怎么处理”，而领域详情页更像“我为什么会这样判断”。两边放在一起，内容会完整很多。
          </p>
          <Link
            href="/#topology"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-white"
          >
            回到首页继续浏览
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

  );
}
