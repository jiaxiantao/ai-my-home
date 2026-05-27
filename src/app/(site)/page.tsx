import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CaseProofCard } from "@/components/case-proof-card";
import { CopyButton } from "@/components/copy-button";
import { HomeProofBar } from "@/components/home-proof-bar";
import { SectionHeading } from "@/components/section-heading";
import { SectionSkeleton } from "@/components/section-skeleton";
import { SystemsVisualization } from "@/components/systems-visualization";
import { getHomepageContent } from "@/lib/content-service";
import { getDashboardData } from "@/lib/dashboard-service";
import { getLlmLabel } from "@/lib/llm-config";

const FullstackDashboard = dynamic(
  () =>
    import("@/components/fullstack-dashboard").then((mod) => mod.FullstackDashboard),
  { loading: () => <SectionSkeleton lines={5} /> },
);

const InteractiveDemoLab = dynamic(
  () =>
    import("@/components/interactive-demo-lab").then((mod) => mod.InteractiveDemoLab),
  { loading: () => <SectionSkeleton lines={4} /> },
);

const CapabilityTopology = dynamic(
  () =>
    import("@/components/capability-topology").then((mod) => mod.CapabilityTopology),
  { loading: () => <SectionSkeleton lines={4} /> },
);

const EngineeringShowcase = dynamic(
  () =>
    import("@/components/engineering-showcase").then(
      (mod) => mod.EngineeringShowcase,
    ),
  { loading: () => <SectionSkeleton lines={5} /> },
);

const exploreLinks = [
  { href: "/cases", label: "Cases" },
  { href: "/insights", label: "Insights" },
  { href: "/notes", label: "Notes" },
  { href: "/assistant", label: "Assistant" },
  { href: "/experience", label: "Experience" },
  { href: "/playbooks", label: "Playbooks" },
] as const;

export default async function Home() {
  const homepage = await getHomepageContent();
  const { profile, domains, caseStudies } = homepage;
  const [dashboard, llmLabel] = await Promise.all([
    getDashboardData(homepage),
    Promise.resolve(getLlmLabel()),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-16 px-6 py-10 lg:px-8 lg:py-14">
        <section className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.32em] text-slate-500">
              {profile.name} · {profile.title}
            </p>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
              {profile.tagline}
            </h1>
            <p className="max-w-lg text-sm leading-7 text-slate-400">{profile.intro}</p>

            <div className="flex flex-wrap gap-3">
              <a
                href="#viz"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
              >
                3D + 图表
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                全栈看板
              </a>
              <a
                href="#tech-demos"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                工程 Demo
              </a>
              <a
                href="#demo-lab"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-white/5"
              >
                判断台
              </a>
              <Link
                href="/resume"
                className="inline-flex items-center rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:text-white"
              >
                Resume
              </Link>
            </div>
          </div>

          <HomeProofBar dashboard={dashboard} />
        </section>

        <section id="viz" className="space-y-6">
          <SectionHeading
            eyebrow="Visualization"
            title="Three.js + ECharts + PostgreSQL"
          />
          <SystemsVisualization
            analytics={dashboard.analytics}
            domains={domains}
          />
        </section>

        <section id="dashboard" className="space-y-6">
          <SectionHeading eyebrow="Dashboard" title="实时数据与链路" />
          <FullstackDashboard data={dashboard} llmLabel={llmLabel} />
        </section>

        <section id="tech-demos" className="space-y-6">
          <SectionHeading
            eyebrow="Engineering Demos"
            title="可交互样例：性能 · 网络 · 渲染 · 状态 · 流 · Worker · 检索"
          />
          <EngineeringShowcase />
        </section>

        <section id="demo-lab" className="space-y-6">
          <SectionHeading eyebrow="Demo Lab" title="切换输入，看输出判断" />
          <InteractiveDemoLab />
        </section>

        <section className="space-y-6">
          <SectionHeading eyebrow="Cases" title="结果可核对的三类交付" />
          <div className="grid gap-4 lg:grid-cols-3">
            {caseStudies.map((caseStudy) => (
              <CaseProofCard key={caseStudy.slug} caseStudy={caseStudy} />
            ))}
          </div>
        </section>

        <section id="topology" className="space-y-6">
          <SectionHeading eyebrow="Topology" title="能力连接图" />
          <CapabilityTopology profile={profile} domains={domains} />
        </section>

        <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-4">
          <div className="flex flex-wrap gap-2">
            {exploreLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-slate-300 transition hover:border-cyan-300/30 hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton value={siteUrl} label="站点" />
            <CopyButton value={`${siteUrl}/api/dashboard`} label="API" />
          </div>
        </section>
    </main>
  );
}
