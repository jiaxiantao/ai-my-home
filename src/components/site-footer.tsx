import Link from "next/link";

import { AnimatedContent } from "@/components/reactbits/animated-content";
import { DecryptedText } from "@/components/reactbits/decrypted-text";
import { StarBorder } from "@/components/reactbits/star-border";
import { HashLink } from "@/components/hash-link";
import { siteProfile } from "@/lib/site-content";

const footerNav = [
  { href: "/#dashboard", label: "看板" },
  { href: "/notes", label: "Notes" },
  { href: "/assistant", label: "Assistant" },
  { href: "/cases", label: "Cases" },
  { href: "/#resume", label: "Resume" },
] as const;

function isHashHref(href: string) {
  return href.includes("#");
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 lg:px-8">
        <AnimatedContent
          className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
          distance={18}
        >
          <div className="text-sm text-slate-400">
            <p className="font-medium text-slate-300">{siteProfile.name}</p>
            <p className="mt-1">Next.js · Prisma · PostgreSQL · Ollama · ECharts · Three.js</p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <a
              href={`mailto:${siteProfile.email}`}
              className="text-cyan-200/90 transition hover:text-white"
            >
              <DecryptedText text={siteProfile.email} revealOnHover speed={18} />
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
        </AnimatedContent>

        <AnimatedContent
          className="flex flex-wrap gap-4 border-t border-white/10 pt-5 text-sm text-slate-400"
          distance={12}
          delay={0.08}
        >
          {footerNav.map((item) => (
            <StarBorder
              key={item.href}
              className="rounded-full"
              color="rgba(103, 232, 249, 0.35)"
              speed="10s"
            >
              {isHashHref(item.href) ? (
                <HashLink
                  href={item.href}
                  className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition hover:text-white"
                >
                  {item.label}
                </HashLink>
              ) : (
                <Link
                  href={item.href}
                  className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition hover:text-white"
                >
                  {item.label}
                </Link>
              )}
            </StarBorder>
          ))}
        </AnimatedContent>
      </div>
    </footer>
  );
}
