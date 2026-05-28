"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/#topology", label: "能力图" },
  { href: "/#cross-platform", label: "大前端" },
  { href: "/#dashboard", label: "看板" },
  { href: "/#edge-ai", label: "端侧 AI" },
  { href: "/#tech-demos", label: "工程 Demo" },
  { href: "/#demo-lab", label: "判断台" },
  { href: "/notes", label: "Notes" },
  { href: "/assistant", label: "Assistant" },
  { href: "/agents", label: "Agents" },
  { href: "/cases", label: "Cases" },
  { href: "/status", label: "Status" },
  { href: "/admin", label: "Admin" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link
          href="/"
          className="text-sm font-semibold tracking-[0.24em] text-white"
          onClick={() => setOpen(false)}
        >
          XJ / FRONTEND SYSTEMS
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-300 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/resume" className="transition-colors hover:text-white">
            Resume
          </Link>
        </nav>

        <button
          type="button"
          className="rounded-xl border border-white/10 p-2 text-slate-200 lg:hidden"
          aria-expanded={open}
          aria-label={open ? "关闭菜单" : "打开菜单"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <nav className="border-t border-white/10 bg-slate-950/95 px-6 py-4 lg:hidden">
          <ul className="grid gap-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-200"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/resume"
                className="block rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-200"
                onClick={() => setOpen(false)}
              >
                Resume
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
