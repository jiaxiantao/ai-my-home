"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { InsightCard } from "@/components/insight-card";
import type { InsightArticle } from "@/lib/editorial-content";

type InsightsExplorerProps = {
  articles: InsightArticle[];
};

export function InsightsExplorer({ articles }: InsightsExplorerProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");

  const categories = useMemo(
    () => ["All", ...new Set(articles.map((article) => article.category))],
    [articles],
  );

  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesCategory =
        activeCategory === "All" || article.category === activeCategory;

      if (!matchesCategory) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const corpus = [
        article.title,
        article.summary,
        article.category,
        ...article.tags,
        ...article.takeaways,
      ]
        .join(" ")
        .toLowerCase();

      return corpus.includes(normalizedQuery);
    });
  }, [activeCategory, articles, query]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5">
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => {
            const isActive = category === activeCategory;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  isActive
                    ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
                    : "border-white/10 bg-slate-950/70 text-slate-300 hover:text-white"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索文章主题，例如 性能、AI、架构、治理..."
            className="w-full rounded-full border border-white/10 bg-slate-950/80 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40"
          />
        </label>
      </div>

      {filteredArticles.length ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredArticles.map((article) => (
            <InsightCard key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-white/15 bg-slate-950/70 p-8 text-sm text-slate-400">
          没有找到匹配文章，换个关键词试试。
        </div>
      )}
    </div>
  );
}
