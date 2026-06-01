import type { Metadata } from "next";

import { ReleaseCenterPanel } from "@/components/release-center-panel";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Release Center | XJ / Frontend Systems",
  description:
    "A CI/CD-focused release order system for application registration, build pipelines, and staged deployments.",
};

export default function ReleaseCenterPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10 lg:px-8 lg:py-14">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
          Release Engineering
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
          工程化发布单系统
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">
          从应用注册、构建产物、质量门禁到测试/预发/生产环境推进，完整展示 CI/CD
          的流程化能力。每个发布动作都受门禁约束，确保“能发”与“该发”分离。
        </p>
        <p className="mt-3 text-xs text-slate-500">
          生产发布窗口默认 10:00 - 22:00（可通过 RELEASE_PROD_WINDOW_START_HOUR /
          RELEASE_PROD_WINDOW_END_HOUR 调整）。
        </p>
      </section>

      <section className="space-y-6">
        <SectionHeading eyebrow="Pipeline" title="应用管理 · 构建 · 分环境发布" />
        <ReleaseCenterPanel />
      </section>
    </main>
  );
}
