import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  PenLine,
  Phone,
  Sparkles,
} from "lucide-react";

import { CopyButton } from "@/components/copy-button";
import { TechStackBoard } from "@/components/tech-stack-board";
import {
  resumeBusinessProjects,
  resumeContact,
  resumeEducation,
  resumeExperiences,
  resumeHeadline,
  resumeOpenSourceProjects,
  resumeSelfEvaluation,
  resumeSkillGroups,
  resolveResumePublicPath,
  type ResumeProject,
} from "@/lib/resume-content";
import { PLATFORM_EXPERIENCE_NAV } from "@/lib/external-projects";
import { techStackGroups } from "@/lib/showcase-content";

export function HomeResume({ siteUrl }: { siteUrl: string }) {
  return (
    <div id="resume" className="flex flex-col gap-14 scroll-mt-24">
      <section className="grid gap-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900/45 via-slate-950/40 to-slate-950/35 p-8 backdrop-blur-xl lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.32em] text-cyan-200/70">
            Resume · {resumeHeadline.nameEn}
          </p>
          <div className="flex items-start gap-5">
            <Image
              src={resolveResumePublicPath(resumeContact.avatar)}
              alt={`${resumeHeadline.name} 头像`}
              width={96}
              height={96}
              className="h-24 w-24 shrink-0 rounded-full border-2 border-cyan-300/30 object-cover shadow-lg shadow-cyan-500/10"
              unoptimized
              priority
            />
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                {resumeHeadline.name}
              </h1>
              <p className="mt-2 text-lg text-slate-300">{resumeHeadline.title}</p>
              <p className="mt-1 text-sm text-cyan-200/80">{resumeHeadline.tagline}</p>
            </div>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate-400">
            {resumeHeadline.objective}
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="#portfolio"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-400/10 px-5 py-2.5 text-sm font-semibold text-cyan-50 transition hover:border-cyan-300/55 hover:bg-cyan-400/18"
            >
              查看在线作品
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={resumeContact.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5"
            >
              GitHub
            </a>
            <CopyButton value={siteUrl} label="复制站点" />
          </div>
        </div>

        <aside className="space-y-4 rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-6 backdrop-blur-md">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            联系方式
          </p>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0 text-cyan-300/80" />
              <a href={`tel:${resumeContact.phone}`} className="hover:text-white">
                {resumeContact.phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0 text-cyan-300/80" />
              <a href={`mailto:${resumeContact.email}`} className="hover:text-white">
                {resumeContact.email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="h-4 w-4 shrink-0 text-cyan-300/80" />
              {resumeContact.location}
            </li>
            <li className="flex items-center gap-3">
              <Globe className="h-4 w-4 shrink-0 text-cyan-300/80" />
              <a
                href={resumeContact.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                个人主页
              </a>
            </li>
            <li className="flex items-center gap-3">
              <PenLine className="h-4 w-4 shrink-0 text-cyan-300/80" />
              <a
                href={resumeContact.juejin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                掘金技术博客
              </a>
            </li>
          </ul>

          <div className="border-t border-white/10 pt-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              <GraduationCap className="h-3.5 w-3.5" />
              教育背景
            </p>
            <p className="mt-3 font-medium text-white">{resumeEducation.school}</p>
            <p className="mt-1 text-sm text-slate-400">
              {resumeEducation.major} · {resumeEducation.degree}
            </p>
            <p className="mt-1 font-mono text-xs text-slate-500">{resumeEducation.period}</p>
          </div>
        </aside>
      </section>

      <section className="space-y-6">
        <SectionLabel icon={Briefcase} label="工作经历" />
        <div className="grid gap-5">
          {resumeExperiences.map((job) => (
            <article
              key={job.company}
              className="rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-6 md:p-7"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-white">{job.company}</h2>
                  <p className="mt-1 text-sm text-cyan-200/90">{job.role}</p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-slate-400">
                  {job.period}
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-400">{job.summary}</p>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    工作职责
                  </p>
                  <ul className="mt-3 space-y-2">
                    {job.responsibilities.map((item) => (
                      <li key={item} className="flex gap-2 text-sm text-slate-300">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cyan-300" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    工作亮点
                  </p>
                  <ul className="mt-3 space-y-2">
                    {job.highlights.map((item) => (
                      <li key={item} className="flex gap-2 text-sm text-slate-300">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-violet-300" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionLabel icon={Sparkles} label="业务项目 · 大搜车" />
        <ProjectGrid projects={resumeBusinessProjects} showLinks previewLinkLabel="产品官网" />
      </section>

      <section className="space-y-6">
        <SectionLabel icon={Sparkles} label="开源项目 · GitHub" />
        <p className="text-sm text-slate-500">
          <a
            href={resumeContact.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-200/90 hover:text-cyan-100"
          >
            github.com/jiaxiantao
          </a>
          {" · "}
          以下为公开仓库，含在线预览的项目可直接体验。
        </p>
        <div className="flex flex-wrap gap-2">
          {PLATFORM_EXPERIENCE_NAV.map((project) => (
            <a
              key={project.previewUrl}
              href={project.previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100 transition hover:border-cyan-200/40 hover:bg-cyan-300/15"
            >
              {project.label}
            </a>
          ))}
        </div>
        <ProjectGrid projects={resumeOpenSourceProjects} showLinks previewLinkLabel="在线预览" />
      </section>

      <section className="space-y-6">
        <SectionLabel label="专业能力" />
        <div className="grid gap-4 md:grid-cols-2">
          {resumeSkillGroups.map((group) => (
            <article
              key={group.title}
              className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-5"
            >
              <h3 className="text-sm font-semibold text-white">{group.title}</h3>
              <ul className="mt-3 space-y-2">
                {group.items.map((item) => (
                  <li key={item} className="text-sm text-slate-400">
                    · {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionLabel label="技术栈视图（当前工程实践）" />
        <TechStackBoard items={techStackGroups} />
      </section>

      <section className="rounded-[1.75rem] border border-violet-300/15 bg-violet-300/5 p-6 md:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-200/80">
          自我评价
        </p>
        <ul className="mt-4 space-y-3">
          {resumeSelfEvaluation.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-7 text-slate-300">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-300" />
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ProjectGrid({
  projects,
  showLinks = false,
  previewLinkLabel = "在线预览",
}: {
  projects: ResumeProject[];
  showLinks?: boolean;
  previewLinkLabel?: string;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {projects.map((project) => (
        <article
          key={project.name}
          className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h2 className="text-lg font-semibold text-white">{project.name}</h2>
            <span className="font-mono text-[11px] text-slate-500">{project.period}</span>
          </div>
          <p className="mt-2 text-sm text-slate-400">{project.summary}</p>
          {showLinks && (project.repoUrl || project.previewUrl) ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {project.previewUrl ? (
                <a
                  href={project.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1 text-[11px] text-cyan-100 transition hover:border-cyan-200/40"
                >
                  {previewLinkLabel}
                </a>
              ) : null}
              {project.repoUrl ? (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/10 bg-slate-950/35 px-2.5 py-1 text-[11px] text-slate-300 transition hover:border-white/20"
                >
                  仓库
                </a>
              ) : null}
            </div>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {project.stack.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-slate-950/35 px-2.5 py-1 text-[11px] text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
          <ul className="mt-4 space-y-2">
            {project.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-2 text-sm leading-6 text-slate-300">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cyan-300" />
                {bullet}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

function SectionLabel({
  label,
  icon: Icon,
}: {
  label: string;
  icon?: typeof Briefcase;
}) {
  return (
    <div className="flex items-center gap-2">
      {Icon ? <Icon className="h-4 w-4 text-cyan-300/80" /> : null}
      <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/75">
        {label}
      </h2>
    </div>
  );
}
