"use client";

import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/auth-provider";
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

const navGroups = [
  {
    id: "engineering",
    label: "工程与能力",
    items: [
      { href: "/#topology", label: "能力图" },
      { href: "/#dashboard", label: "看板" },
      { href: "/#tech-demos", label: "工程 Demo" },
      { href: "/#demo-lab", label: "判断台" },
      { href: "/release-center", label: "Release Center" },
      { href: "/status", label: "Status" },
    ],
  },
  {
    id: "ai",
    label: "智能与内容",
    items: [
      { href: "/#edge-ai", label: "端侧 AI" },
      { href: "/assistant", label: "Assistant" },
      { href: "/agents", label: "Agents" },
      { href: "/notes", label: "Notes" },
      { href: "/cases", label: "Cases" },
    ],
  },
  {
    id: "platform",
    label: "平台体验",
    items: [
      { href: "/#cross-platform", label: "大前端" },
      { href: "/car-showroom", label: "3D看车" },
    ],
  },
] as const;

export function SiteHeader() {
  const desktopNavRef = useRef<HTMLElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { authenticated, loading, message, clearMessage, login, logout } = useAuth();

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearMessage();
    const ok = await login(username, password);
    if (!ok) {
      return;
    }
    setPassword("");
    setAuthOpen(false);
  }

  async function handleLogout() {
    await logout();
  }

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!desktopNavRef.current) return;
      const target = event.target as Node | null;
      if (!target) return;
      if (!desktopNavRef.current.contains(target)) {
        setActiveDropdown(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  function cancelCloseTimer() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function scheduleDropdownClose() {
    cancelCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 130);
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

        <nav
          ref={desktopNavRef}
          className="hidden items-center gap-6 text-sm text-slate-300 lg:flex"
        >
          {navGroups.map((group) => {
            const expanded = activeDropdown === group.id;
            return (
              <div key={group.id} className="relative">
                <button
                  type="button"
                  onMouseEnter={() => {
                    cancelCloseTimer();
                    setActiveDropdown(group.id);
                  }}
                  onMouseLeave={scheduleDropdownClose}
                  onFocus={() => setActiveDropdown(group.id)}
                  onClick={() =>
                    setActiveDropdown((current) =>
                      current === group.id ? null : group.id,
                    )
                  }
                  className="inline-flex items-center gap-1 text-sm text-slate-300 transition hover:text-white"
                  aria-expanded={expanded}
                >
                  {group.label}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {expanded ? (
                  <div
                    className="absolute left-0 top-full z-20 min-w-44 pt-2"
                    onMouseEnter={cancelCloseTimer}
                    onMouseLeave={scheduleDropdownClose}
                  >
                    <div className="rounded-xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setActiveDropdown(null)}
                        className="block rounded-lg px-3 py-2 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
                      >
                        {item.label}
                      </Link>
                    ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
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
            {loading ? "..." : authenticated ? "admin" : "游客"}
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
            {loading ? "..." : authenticated ? "admin" : "游客"}
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
            {navGroups.map((group) => (
              <li key={group.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                  {group.label}
                </p>
                <div className="grid gap-2">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-200"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
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
            clearMessage();
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

          {message ? (
            <p className="mt-4 text-sm text-cyan-200/90">{message}</p>
          ) : null}
        </DialogContent>
      </Dialog>
    </header>
  );
}
