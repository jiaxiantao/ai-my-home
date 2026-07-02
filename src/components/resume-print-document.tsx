import {
  resumeBusinessProjects,
  resumeContact,
  resumeEducation,
  resumeExperiences,
  resumeHeadline,
  resumeOpenSourceProjects,
  resumeSelfEvaluation,
  resumeSkillGroups,
  type ResumeProject,
} from "@/lib/resume-content";

const PDF_OPEN_SOURCE_PROJECTS = resumeOpenSourceProjects.slice(0, 4);

const PDF_SELF_EVALUATION = resumeSelfEvaluation.map((item) =>
  item.includes("本站点")
    ? "持续维护多个 GitHub 开源项目，欢迎结合在线 Demo 与公开仓库进一步了解技术细节。"
    : item,
);

export function ResumePrintDocument() {
  return (
    <article className="resume-print mx-auto min-h-screen max-w-[210mm] bg-white px-10 py-9 text-[13px] leading-[1.55] text-slate-800 print:px-8 print:py-7">
      <header className="border-b border-slate-300 pb-5">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-[26px] font-bold tracking-tight text-slate-900">
              {resumeHeadline.name}
            </h1>
            <p className="mt-1 text-[15px] font-semibold text-slate-700">
              {resumeHeadline.title}
            </p>
            <p className="mt-1 text-[12px] text-slate-500">{resumeHeadline.tagline}</p>
          </div>
          <div className="shrink-0 text-right text-[12px] text-slate-600">
            <p>{resumeContact.phone}</p>
            <p className="mt-0.5">{resumeContact.email}</p>
            <p className="mt-0.5">{resumeContact.location}</p>
            <p className="mt-0.5 text-slate-500">github.com/jiaxiantao</p>
          </div>
        </div>
        <p className="mt-4 text-[12.5px] leading-6 text-slate-600">
          {resumeHeadline.objective}
        </p>
      </header>

      <section className="mt-5">
        <SectionTitle>教育背景</SectionTitle>
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <span className="font-semibold text-slate-900">{resumeEducation.school}</span>
            <span className="mx-2 text-slate-400">|</span>
            <span>
              {resumeEducation.major} · {resumeEducation.degree}
            </span>
          </div>
          <span className="text-[12px] text-slate-500">{resumeEducation.period}</span>
        </div>
      </section>

      <section className="mt-5">
        <SectionTitle>工作经历</SectionTitle>
        <div className="mt-3 space-y-4">
          {resumeExperiences.map((job) => (
            <div key={job.company} className="break-inside-avoid">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <span className="font-semibold text-slate-900">{job.company}</span>
                  <span className="mx-2 text-slate-400">|</span>
                  <span className="text-slate-700">{job.role}</span>
                </div>
                <span className="text-[12px] text-slate-500">{job.period}</span>
              </div>
              <p className="mt-1.5 text-[12.5px] text-slate-600">{job.summary}</p>
              <ul className="mt-2 space-y-1">
                {job.responsibilities.map((item) => (
                  <Bullet key={item}>{item}</Bullet>
                ))}
              </ul>
              {job.highlights.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {job.highlights.map((item) => (
                    <Bullet key={item} muted>
                      {item}
                    </Bullet>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <SectionTitle>业务项目 · 大搜车</SectionTitle>
        <div className="mt-3 space-y-3.5">
          {resumeBusinessProjects.map((project) => (
            <PrintProject key={project.name} project={project} maxBullets={4} />
          ))}
        </div>
      </section>

      <section className="mt-5">
        <SectionTitle>开源项目 · GitHub</SectionTitle>
        <div className="mt-3 space-y-3.5">
          {PDF_OPEN_SOURCE_PROJECTS.map((project) => (
            <PrintProject key={project.name} project={project} maxBullets={3} showLinks />
          ))}
        </div>
      </section>

      <section className="mt-5 break-inside-avoid">
        <SectionTitle>专业能力</SectionTitle>
        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3">
          {resumeSkillGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-[12.5px] font-semibold text-slate-800">{group.title}</h3>
              <p className="mt-1 text-[12px] leading-5 text-slate-600">
                {group.items.join(" · ")}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 break-inside-avoid">
        <SectionTitle>自我评价</SectionTitle>
        <ul className="mt-2 space-y-1.5">
          {PDF_SELF_EVALUATION.map((item) => (
            <Bullet key={item}>{item}</Bullet>
          ))}
        </ul>
      </section>
    </article>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="border-b border-slate-200 pb-1 text-[13px] font-bold tracking-wide text-slate-900">
      {children}
    </h2>
  );
}

function Bullet({ children, muted = false }: { children: string; muted?: boolean }) {
  return (
    <li
      className={`flex gap-2 text-[12.5px] leading-5 ${muted ? "text-slate-500" : "text-slate-700"}`}
    >
      <span className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-slate-400" />
      <span>{children}</span>
    </li>
  );
}

function PrintProject({
  project,
  maxBullets,
  showLinks = false,
}: {
  project: ResumeProject;
  maxBullets: number;
  showLinks?: boolean;
}) {
  const bullets = project.bullets.slice(0, maxBullets);

  return (
    <div className="break-inside-avoid">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <span className="font-semibold text-slate-900">{project.name}</span>
          <span className="mx-2 text-slate-400">|</span>
          <span className="text-[12px] text-slate-500">{project.period}</span>
        </div>
        {showLinks && project.repoUrl ? (
          <span className="text-[11px] text-slate-500">{project.repoUrl.replace("https://", "")}</span>
        ) : null}
      </div>
      <p className="mt-1 text-[12px] text-slate-600">{project.summary}</p>
      <p className="mt-1 text-[11.5px] text-slate-500">{project.stack.join(" · ")}</p>
      <ul className="mt-1.5 space-y-1">
        {bullets.map((bullet) => (
          <Bullet key={bullet}>{bullet}</Bullet>
        ))}
      </ul>
    </div>
  );
}
