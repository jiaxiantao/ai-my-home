"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { CaseStudyCard } from "@/components/case-study-card";
import { DomainCard } from "@/components/domain-card";
import type { CaseStudy, DomainDetail } from "@/lib/site-content";

type CapabilityExplorerProps = {
  domains: DomainDetail[];
  caseStudies: CaseStudy[];
};

type ExplorerTab = "domains" | "cases";

export function CapabilityExplorer({
  domains,
  caseStudies,
}: CapabilityExplorerProps) {
  const [activeTab, setActiveTab] = useState<ExplorerTab>("domains");
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();

  const filteredDomains = useMemo(() => {
    if (!normalizedQuery) {
      return domains;
    }

    return domains.filter((domain) => {
      const corpus = [
        domain.title,
        domain.strapline,
        domain.summary,
        domain.expertiseLevel,
        ...domain.highlights,
        ...domain.principles,
      ]
        .join(" ")
        .toLowerCase();

      return corpus.includes(normalizedQuery);
    });
  }, [domains, normalizedQuery]);

  const filteredCaseStudies = useMemo(() => {
    if (!normalizedQuery) {
      return caseStudies;
    }

    return caseStudies.filter((caseStudy) => {
      const corpus = [
        caseStudy.title,
        caseStudy.summary,
        caseStudy.context,
        caseStudy.impact,
        ...caseStudy.stack,
      ]
        .join(" ")
        .toLowerCase();

      return corpus.includes(normalizedQuery);
    });
  }, [caseStudies, normalizedQuery]);

  const resultCount =
    activeTab === "domains" ? filteredDomains.length : filteredCaseStudies.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="inline-flex w-fit rounded-full border border-white/10 bg-slate-950/70 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("domains")}
            className={`rounded-full px-4 py-2 text-sm transition ${
              activeTab === "domains"
                ? "bg-white text-slate-950"
                : "text-slate-300 hover:text-white"
            }`}
          >
            能力领域
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("cases")}
            className={`rounded-full px-4 py-2 text-sm transition ${
              activeTab === "cases"
                ? "bg-white text-slate-950"
                : "text-slate-300 hover:text-white"
            }`}
          >
            案例表达
          </button>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative block min-w-[280px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索关键字，例如 架构、性能、AI、协作..."
              className="w-full rounded-full border border-white/10 bg-slate-950/80 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40"
            />
          </label>

          <div className="text-sm text-slate-400">
            当前结果 <span className="font-semibold text-white">{resultCount}</span>
          </div>
        </div>
      </div>

      {activeTab === "domains" ? (
        filteredDomains.length ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {filteredDomains.map((domain) => (
              <DomainCard key={domain.slug} domain={domain} />
            ))}
          </div>
        ) : (
          <EmptyState label="没有找到匹配的能力领域，试试更宽泛的关键词。" />
        )
      ) : filteredCaseStudies.length ? (
        <div className="grid gap-6">
          {filteredCaseStudies.map((caseStudy) => (
            <CaseStudyCard key={caseStudy.slug} caseStudy={caseStudy} />
          ))}
        </div>
      ) : (
        <EmptyState label="没有找到匹配的案例，换一个问题域再试试。" />
      )}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-white/15 bg-slate-950/70 p-8 text-sm text-slate-400">
      {label}
    </div>
  );
}
