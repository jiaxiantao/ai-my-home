"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

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
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/session", { cache: "no-store", signal: controller.signal })
      .then((response) => response.json())
      .then((payload: { authenticated?: boolean }) => {
        setAuthenticated(Boolean(payload.authenticated));
      })
      .catch(() => {
        setAuthenticated(false);
      })
      .finally(() => {
        setCheckingSession(false);
      });
    return () => controller.abort();
  }, []);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthMessage(null);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setAuthMessage(payload.error ?? "登录失败");
      return;
    }
    setAuthenticated(true);
    setPassword("");
    setAuthMessage("登录成功");
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthenticated(false);
    setAuthMessage("已退出登录");
  }

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
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-[11px] font-semibold uppercase text-cyan-100 transition hover:border-cyan-200/60"
            aria-label="打开登录弹窗"
          >
            {checkingSession ? "..." : authenticated ? "admin" : "游客"}
          </button>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-[10px] font-semibold uppercase text-cyan-100"
            aria-label="打开登录弹窗"
          >
            {checkingSession ? "..." : authenticated ? "admin" : "游客"}
          </button>
          <button
            type="button"
            className="rounded-xl border border-white/10 p-2 text-slate-200"
            aria-expanded={open}
            aria-label={open ? "关闭菜单" : "打开菜单"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
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

      {authOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Auth</p>
                <h3 className="mt-2 text-xl font-semibold text-white">登录</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAuthOpen(false);
                  setAuthMessage(null);
                }}
                className="rounded-full border border-white/10 p-2 text-slate-300"
                aria-label="关闭登录弹窗"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {authenticated ? (
              <div className="mt-6 space-y-4">
                <p className="text-sm text-emerald-200">当前已登录：admin</p>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 hover:border-white/30"
                >
                  退出登录
                </button>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="mt-6 grid gap-3">
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="管理员账号"
                  className="rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="管理员密码"
                  className="rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-100"
                >
                  登录
                </button>
              </form>
            )}

            {authMessage ? (
              <p className="mt-4 text-sm text-cyan-200/90">{authMessage}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
