"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
            className={cn(
              "relative inline-flex h-11 w-11 items-center justify-center rounded-full border text-[11px] font-semibold uppercase transition",
              authenticated
                ? "border-emerald-200/40 bg-emerald-300/15 text-emerald-100 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]"
                : "border-cyan-200/40 bg-cyan-300/10 text-cyan-100 shadow-[0_0_0_4px_rgba(34,211,238,0.1)]",
            )}
            aria-label="打开登录弹窗"
          >
            {checkingSession ? "..." : authenticated ? "admin" : "游客"}
          </button>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full border text-[10px] font-semibold uppercase",
              authenticated
                ? "border-emerald-200/40 bg-emerald-300/15 text-emerald-100"
                : "border-cyan-200/40 bg-cyan-300/10 text-cyan-100",
            )}
            aria-label="打开登录弹窗"
          >
            {checkingSession ? "..." : authenticated ? "admin" : "游客"}
          </button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-xl text-slate-200"
            aria-expanded={open}
            aria-label={open ? "关闭菜单" : "打开菜单"}
            onClick={() => setOpen((value) => !value)}
          >
            <Menu className="h-5 w-5" />
          </Button>
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

      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent
          onClose={() => {
            setAuthOpen(false);
            setAuthMessage(null);
          }}
        >
          <DialogHeader>
            <Badge variant={authenticated ? "secondary" : "default"} className="w-fit">
              {authenticated ? "Admin Session" : "Guest Session"}
            </Badge>
            <DialogTitle>账号登录</DialogTitle>
            <DialogDescription>
              登录后可调用数据库写接口（新增/删除笔记、状态探针写入）；游客仅可浏览内容。
            </DialogDescription>
          </DialogHeader>

          {authenticated ? (
            <div className="mt-5 space-y-4">
              <p className="text-sm text-emerald-200">当前已登录：admin</p>
              <Button variant="outline" onClick={() => void handleLogout()}>
                退出登录
              </Button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="mt-5 grid gap-3">
              <Input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="管理员账号"
              />
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="管理员密码"
              />
              <Button type="submit" size="lg">
                登录
              </Button>
            </form>
          )}

          {authMessage ? (
            <p className="mt-4 text-sm text-cyan-200/90">{authMessage}</p>
          ) : null}
        </DialogContent>
      </Dialog>
    </header>
  );
}
