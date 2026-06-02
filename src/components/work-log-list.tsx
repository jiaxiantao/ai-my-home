import type { WorkLog } from "@/lib/ongoing-content";

type WorkLogListProps = {
  items: WorkLog[];
};

export function WorkLogList({ items }: WorkLogListProps) {
  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <article
          key={`${item.date}-${item.title}`}
          className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h3 className="text-xl font-semibold tracking-tight text-white">
              {item.title}
            </h3>
            <span className="text-sm text-slate-500">{item.date}</span>
          </div>

          <p className="mt-4 text-sm leading-7 text-slate-300">{item.summary}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
