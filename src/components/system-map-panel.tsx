import Link from "next/link";

import { architectureSystemMap, type SystemArtifact } from "@/lib/system-map";

export function SystemMapPanel({ scenarioId }: { scenarioId: string }) {
  const artifacts = architectureSystemMap[scenarioId];

  if (!artifacts?.length) {
    return null;
  }

  return (
    <article className="rounded-[2rem] border border-violet-300/20 bg-violet-300/5 p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-200/80">
        System Map
      </p>
      <p className="mt-2 text-sm text-slate-400">
        这个场景在本仓库里的真实落点 — 演示与代码对齐。
      </p>
      <div className="mt-5 grid gap-3">
        {artifacts.map((artifact) => (
          <ArtifactRow key={artifact.label} artifact={artifact} />
        ))}
      </div>
    </article>
  );
}

function ArtifactRow({ artifact }: { artifact: SystemArtifact }) {
  const badge =
    artifact.kind === "api"
      ? "API"
      : artifact.kind === "route"
        ? "Route"
        : "File";

  const content = (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-[1.25rem] border border-white/10 bg-slate-950/60 px-4 py-3 transition hover:border-white/20">
      <div>
        <p className="text-sm font-semibold text-white">{artifact.label}</p>
        <p className="mt-1 text-xs leading-6 text-slate-400">{artifact.summary}</p>
        {artifact.file ? (
          <p className="mt-1 font-mono text-[10px] text-slate-500">{artifact.file}</p>
        ) : null}
      </div>
      <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] text-slate-400">
        {badge}
      </span>
    </div>
  );

  if (artifact.href) {
    return (
      <Link href={artifact.href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
