import dynamic from "next/dynamic";
import Link from "next/link";

import { CapabilityProfileSection } from "@/components/capability-profile-section";
import { CaseProofCard } from "@/components/case-proof-card";
import { CopyButton } from "@/components/copy-button";
import { HomeResume } from "@/components/home-resume";
import { HomeScrollRestoration } from "@/components/home-scroll-restoration";
import { SectionHeading } from "@/components/section-heading";
import { SectionSkeleton } from "@/components/section-skeleton";
import { FrontIntelligenceSpotlight } from "@/components/front-intelligence-spotlight";
import { ReleaseCenterSpotlight } from "@/components/release-center-spotlight";
import { SystemsVisualization } from "@/components/systems-visualization";
import { getHomepageContent } from "@/lib/content-service";
import { getDashboardData } from "@/lib/dashboard-service";
import { EXTERNAL_PROJECTS, HOME_AGENT_AGENTS_URL } from "@/lib/external-projects";
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

const CrossPlatformShowcase = dynamic(
  () =>
    import("@/components/cross-platform-showcase").then(
      (mod) => mod.CrossPlatformShowcase,
    ),
  { loading: () => <SectionSkeleton lines={4} /> },
);

const EdgeAiShowcase = dynamic(
  () =>
    import("@/components/edge-ai-showcase").then((mod) => mod.EdgeAiShowcase),
  { loading: () => <SectionSkeleton lines={4} /> },
);

const exploreLinks = [
  { href: "/cases", label: "Cases" },
  { href: "/insights", label: "Insights" },
  { href: "/notes", label: "Notes" },
  { href: "/assistant", label: "Assistant" },
  { href: HOME_AGENT_AGENTS_URL, label: "Agents", external: true },
  { href: "/release-center", label: "Release Center" },
  { href: EXTERNAL_PROJECTS.carShowroom.previewUrl, label: "3D看车", external: true },
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
      <HomeScrollRestoration />
      <HomeResume siteUrl={siteUrl} />

      <section id="portfolio" className="space-y-6 scroll-mt-24">
        <SectionHeading
          eyebrow="Portfolio"
          title="在线作品与技术演示"
          description="以下为可交互的工程能力证明，与上方简历相互印证。"
        />
      </section>

      <section id="capability-radar" className="space-y-6">
        <SectionHeading eyebrow="Capability" title="六维能力雷达 · 一眼看覆盖面" />
        <CapabilityProfileSection dashboard={dashboard} />
      </section>

      <section id="front-intelligence" className="space-y-6">
        <SectionHeading
          eyebrow="Front Intelligence"
          title="前端智能化：意图识别 · Prompt 编排 · 偏好学习"
        />
        <FrontIntelligenceSpotlight dashboard={dashboard} llmLabel={llmLabel} />
      </section>

      <section id="viz" className="space-y-6">
        <SectionHeading
          eyebrow="Visualization"
          title="Three.js + ECharts + PostgreSQL"
        />
        <SystemsVisualization analytics={dashboard.analytics} domains={domains} />
      </section>

      <section id="dashboard" className="space-y-6">
        <SectionHeading eyebrow="Dashboard" title="实时数据与链路" />
        <FullstackDashboard data={dashboard} llmLabel={llmLabel} />
      </section>

      <section id="release-center" className="space-y-6">
        <SectionHeading
          eyebrow="Release Engineering"
          title="发布单 · 构建 · 分环境门禁"
        />
        <ReleaseCenterSpotlight release={dashboard.release} />
      </section>

      <section id="cross-platform" className="space-y-6">
        <SectionHeading
          eyebrow="Cross-Platform"
          title="大前端：移动端 H5 · 小程序 · 桌面端"
        />
        <CrossPlatformShowcase />
      </section>

      <section id="edge-ai" className="space-y-6">
        <SectionHeading
          eyebrow="Edge AI"
          title="浏览器端智能：Transformers.js · WASM · MediaPipe"
        />
        <EdgeAiShowcase />
      </section>

      <section id="tech-demos" className="space-y-6">
        <SectionHeading
          eyebrow="Engineering Demos"
          title="可交互样例：性能 · 网络 · 渲染 · 状态 · 流 · Worker · 检索 · 安全"
        />
        <EngineeringShowcase />
      </section>

      <section id="demo-lab" className="space-y-6">
        <SectionHeading eyebrow="Demo Lab" title="切换输入，看输出判断" />
        <InteractiveDemoLab />
      </section>

      <section className="space-y-6">
        <SectionHeading eyebrow="Cases" title="结果可核对的交付样例" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
          {exploreLinks.map((item) =>
            "external" in item && item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-slate-300 transition hover:border-cyan-300/30 hover:text-white"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-slate-300 transition hover:border-cyan-300/30 hover:text-white"
              >
                {item.label}
              </Link>
            ),
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton value={siteUrl} label="站点" />
          <CopyButton value={`${siteUrl}/api/profile`} label="简历 API" />
        </div>
      </section>
    </main>
  );
}
