import type { TechStackGroup } from "@/lib/showcase-content";

type TechStackBoardProps = {
  items: TechStackGroup[];
};

export function TechStackBoard({ items }: TechStackBoardProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {items.map((group) => (
        <article
          key={group.title}
          className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6"
        >
          <h3 className="text-xl font-semibold tracking-tight text-white">
            {group.title}
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">{group.summary}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            {group.items.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-200"
              >
                {item}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
