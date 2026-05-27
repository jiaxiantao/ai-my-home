import type { Metadata } from "next";

import { CurrentTracks } from "@/components/current-tracks";
import { JsonLd } from "@/components/json-ld";
import { SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WorkLogList } from "@/components/work-log-list";
import { currentTracks, workLogs } from "@/lib/ongoing-content";

export const metadata: Metadata = {
  title: "Now | XJ / Frontend Systems",
  description:
    "Current focus areas, active tracks and recent work logs from my frontend and AI-fullstack workflow.",
};

export default function NowPage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-10 lg:px-8 lg:py-16">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Now",
            description: metadata.description,
          }}
        />

        <section className="grid gap-8 rounded-[2.25rem] border border-white/10 bg-white/5 p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Now</p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-5xl">
              这里记录我当前在做的事，以及最近在反复思考的问题
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              我想把这个页面保留成一个持续更新的入口。相比“完成了什么”，这里更关心我现在把精力放在哪里、为什么会放在那里，以及最近有哪些内容在逐步成型。
            </p>
          </div>

          <div className="grid gap-4">
            <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
                Active Tracks
              </p>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-white">
                {currentTracks.length}
              </p>
              <p className="mt-2 text-sm text-slate-400">个持续推进的方向</p>
            </article>

            <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
                Recent Logs
              </p>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-white">
                {workLogs.length}
              </p>
              <p className="mt-2 text-sm text-slate-400">条最近整理下来的工作记录</p>
            </article>
          </div>
        </section>

        <section className="space-y-10">
          <SectionHeading
            eyebrow="Current Tracks"
            title="这几件事，是我现在最想持续做下去的内容"
            description="它们并不是相互独立的任务，而是我现在把前端、内容系统、数据建模和 AI 工作流放在一起推进的几条主线。"
          />

          <CurrentTracks items={currentTracks} />
        </section>

        <section className="space-y-10">
          <SectionHeading
            eyebrow="Recent Logs"
            title="最近的工作记录"
            description="这里的记录会比文章更短，比案例更轻，但它们能保留下很多正在形成中的判断和变化。"
          />

          <WorkLogList items={workLogs} />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
