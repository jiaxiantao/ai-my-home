import type { DashboardData } from "@/lib/dashboard-service";

const apiProofs = [
  { href: "/api/health", label: "GET /api/health" },
  { href: "/api/dashboard", label: "GET /api/dashboard" },
  { href: "/api/analytics/notes", label: "GET /api/analytics/notes" },
  { href: "/api/profile", label: "GET /api/profile" },
  { href: "/api/notes", label: "GET /api/notes" },
  { href: "/api/notes/search?q=架构", label: "GET /api/notes/search" },
  { href: "/api/chat", label: "POST /api/chat" },
];

export function HomeProofBar({ dashboard }: { dashboard: DashboardData }) {
  const { overview } = dashboard;

  const stats = [
    { label: "Notes", value: String(overview.notesCount) },
    { label: "Cases", value: String(overview.caseStudiesCount) },
    { label: "Domains", value: String(overview.domainsCount) },
    { label: "Demo 台", value: String(overview.demoCapabilitiesCount) },
  ];

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {apiProofs.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-cyan-100/90 transition hover:border-cyan-300/30 hover:bg-cyan-300/10"
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}
