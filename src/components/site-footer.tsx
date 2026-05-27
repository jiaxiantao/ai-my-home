/* eslint-disable @next/next/no-html-link-for-pages */
import { siteProfile } from "@/lib/site-content";

const footerNav = [
  { href: "/#dashboard", label: "看板" },
  { href: "/notes", label: "Notes" },
  { href: "/assistant", label: "Assistant" },
  { href: "/cases", label: "Cases" },
  { href: "/resume", label: "Resume" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-sm text-slate-400">
            <p className="font-medium text-slate-300">{siteProfile.name}</p>
            <p className="mt-1">Next.js · Prisma · PostgreSQL · Ollama · ECharts · Three.js</p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <a
              href={`mailto:${siteProfile.email}`}
              className="text-cyan-200/90 transition hover:text-white"
            >
              {siteProfile.email}
            </a>
            <a
              href={siteProfile.github}
              target="_blank"
              rel="noreferrer"
              className="text-slate-300 transition hover:text-white"
            >
              GitHub
            </a>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 border-t border-white/10 pt-5 text-sm text-slate-400">
          {footerNav.map((item) => (
            <a key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
