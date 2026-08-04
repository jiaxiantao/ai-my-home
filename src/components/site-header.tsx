"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { DecryptedText } from "@/components/reactbits/decrypted-text";
import { GradientText } from "@/components/reactbits/gradient-text";
import { ShinyText } from "@/components/reactbits/shiny-text";
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
import {
  MOOD_OPTIONS,
  useWeatherMood,
} from "@/components/weather-mood-provider";
import { HOME_AGENT_AGENTS_URL, PLATFORM_EXPERIENCE_NAV } from "@/lib/external-projects";
import {
  applySamePageHashNavigation,
  parseHashHref,
} from "@/lib/smooth-hash";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  external?: boolean;
};

const navGroups: Array<{ id: string; label: string; items: NavItem[] }> = [
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
      { href: "/#cross-platform", label: "大前端" },
    ],
  },
  {
    id: "ai",
    label: "智能与内容",
    items: [
      { href: "/#front-intelligence", label: "智能编排" },
      { href: "/#edge-ai", label: "端侧 AI" },
      { href: "/assistant", label: "Assistant" },
      {
        href: HOME_AGENT_AGENTS_URL,
        label: "Agents",
        external: true,
      },
      {
        href: "/notes",
        label: "Notes",
      },
      { href: "/cases", label: "Cases" },
    ],
  },
  {
    id: "platform",
    label: "平台体验",
    items: PLATFORM_EXPERIENCE_NAV.map((project) => ({
      href: project.previewUrl,
      label: project.label,
      external: true,
    })),
  },
];

function NavLink({
  item,
  className,
  onClick,
  tabIndex,
  "data-testid": dataTestId,
  pathname,
}: {
  item: NavItem;
  className: string;
  onClick?: () => void;
  tabIndex?: number;
  "data-testid"?: string;
  pathname: string;
}) {
  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onClick}
        tabIndex={tabIndex}
        data-testid={dataTestId}
      >
        {item.label}
      </a>
    );
  }

  const { hash } = parseHashHref(item.href);

  return (
    <Link
      href={item.href}
      scroll={!hash}
      className={className}
      onClick={(event) => {
        if (applySamePageHashNavigation(item.href, pathname)) {
          event.preventDefault();
        }
        onClick?.();
      }}
      tabIndex={tabIndex}
      data-testid={dataTestId}
    >
      {item.label}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const desktopNavRef = useRef<HTMLElement | null>(null);
  const mobileMoodRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { authenticated, loading, message, clearMessage, login, logout } = useAuth();
  const { mood, setMoodId } = useWeatherMood();
  const moodDropdownExpanded = activeDropdown === "mood";

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
      const target = event.target as Node | null;
      if (!target) return;
      const inDesktopNav = Boolean(desktopNavRef.current?.contains(target));
      const inMobileMood = Boolean(mobileMoodRef.current?.contains(target));
      if (!inDesktopNav && !inMobileMood) {
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

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }
      setActiveDropdown(null);
      setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
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

  function isGroupCurrent(group: (typeof navGroups)[number]) {
    return group.items.some((item) => !item.external && item.href === pathname);
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/35 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-8">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/3 px-4 py-2 shadow-[0_10px_30px_rgba(2,6,23,0.18)]">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.24em] text-white"
            onClick={() => setOpen(false)}
          >
            <GradientText
              animationSpeed={12}
              colors={["#e2e8f0", "#67e8f9", "#c4b5fd"]}
              className="text-sm"
            >
              XJ / FRONTEND SYSTEMS
            </GradientText>
          </Link>
          <p className="hidden items-center gap-1 text-[10px] text-slate-500 lg:inline-flex">
            <kbd className="rounded border border-white/10 px-1 font-mono">⌘K</kbd>
            快捷导航
          </p>
        </div>

        <nav
          ref={desktopNavRef}
          className="hidden items-center gap-6 text-sm text-slate-300 lg:flex"
        >
          {navGroups.map((group) => {
            const expanded = activeDropdown === group.id;
            const current = isGroupCurrent(group);
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
                    setActiveDropdown((currentOpen) =>
                      currentOpen === group.id ? null : group.id,
                    )
                  }
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-3.5 py-1.5 text-sm transition",
                    expanded || current
                      ? "border-cyan-300/30 bg-cyan-300/10 text-white shadow-[0_0_0_3px_rgba(34,211,238,0.08)]"
                      : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/4 hover:text-white",
                  )}
                  aria-expanded={expanded}
                >
                  {expanded || current ? (
                    <ShinyText
                      text={group.label}
                      color="rgba(226, 232, 240, 0.92)"
                      shineColor="#ffffff"
                      speed={4}
                      spread={132}
                    />
                  ) : (
                    group.label
                  )}
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      expanded && "rotate-180",
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "absolute left-0 top-full z-20 min-w-44 pt-2 transition-opacity duration-150",
                    expanded
                      ? "pointer-events-auto opacity-100"
                      : "pointer-events-none opacity-0",
                  )}
                  aria-hidden={!expanded}
                  onMouseEnter={cancelCloseTimer}
                  onMouseLeave={scheduleDropdownClose}
                >
                  <div className="rounded-xl border border-white/10 bg-slate-950/45 p-2 shadow-2xl backdrop-blur-xl">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.href}
                        item={item}
                        pathname={pathname}
                        data-testid={`nav-${group.id}-${item.label.replace(/\s+/g, "-").toLowerCase()}`}
                        onClick={() => setActiveDropdown(null)}
                        tabIndex={expanded ? 0 : -1}
                        className="block rounded-lg px-3 py-2 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => {
                cancelCloseTimer();
                setActiveDropdown("mood");
              }}
              onMouseLeave={scheduleDropdownClose}
              onFocus={() => setActiveDropdown("mood")}
              onClick={() =>
                setActiveDropdown((current) => (current === "mood" ? null : "mood"))
              }
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-3.5 py-1.5 text-sm transition",
                moodDropdownExpanded
                  ? "border-violet-300/30 bg-violet-300/10 text-white shadow-[0_0_0_3px_rgba(167,139,250,0.08)]"
                  : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/4 hover:text-white",
              )}
              aria-expanded={moodDropdownExpanded}
              aria-haspopup="listbox"
              aria-label="切换心情天气"
            >
              <span className="inline-flex items-center gap-1">
                心情 ·
                <ShinyText
                  text={mood.label}
                  color="rgba(226, 232, 240, 0.92)"
                  shineColor="#ffffff"
                  speed={4.5}
                  spread={138}
                />
              </span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  moodDropdownExpanded && "rotate-180",
                )}
              />
            </button>
            <div
              className={cn(
                "absolute right-0 top-full z-20 min-w-44 pt-2 transition-opacity duration-150",
                moodDropdownExpanded
                  ? "pointer-events-auto opacity-100"
                  : "pointer-events-none opacity-0",
              )}
              aria-hidden={!moodDropdownExpanded}
              onMouseEnter={cancelCloseTimer}
              onMouseLeave={scheduleDropdownClose}
            >
              <div
                role="listbox"
                aria-label="心情选项"
                className="max-h-[min(70vh,28rem)] min-w-52 overflow-y-auto rounded-xl border border-white/10 bg-slate-950/45 p-2 shadow-2xl backdrop-blur-xl"
              >
                {MOOD_OPTIONS.map((option) => {
                  const selected = option.id === mood.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      tabIndex={moodDropdownExpanded ? 0 : -1}
                      onClick={() => {
                        setMoodId(option.id);
                        setActiveDropdown(null);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs transition",
                        selected
                          ? "bg-white/10 text-white"
                          : "text-slate-300 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <span>{option.label}</span>
                      <span className="text-[10px] text-slate-500">{option.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className={cn(
              "relative inline-flex h-9 w-9 items-center justify-center rounded-full border text-[10px] font-semibold uppercase transition",
              authenticated
                ? "border-emerald-200/40 bg-emerald-300/15 text-emerald-100 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]"
                : "border-cyan-200/40 bg-cyan-300/10 text-cyan-100 shadow-[0_0_0_3px_rgba(34,211,238,0.1)]",
            )}
            aria-label="打开登录弹窗"
          >
            {loading ? "..." : authenticated ? "admin" : "游客"}
          </button>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <div className="relative" ref={mobileMoodRef}>
            <button
              type="button"
              onClick={() =>
                setActiveDropdown((current) => (current === "mood" ? null : "mood"))
              }
              className="inline-flex h-9 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 text-[11px] text-slate-200"
              aria-expanded={moodDropdownExpanded}
              aria-haspopup="listbox"
              aria-label="切换心情天气"
            >
              {mood.label}
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  moodDropdownExpanded && "rotate-180",
                )}
              />
            </button>
            {moodDropdownExpanded ? (
              <div className="absolute right-0 top-full z-30 min-w-44 pt-2">
                <div
                  role="listbox"
                  aria-label="心情选项"
                  className="max-h-[min(70vh,28rem)] min-w-52 overflow-y-auto rounded-xl border border-white/10 bg-slate-950/45 p-2 shadow-2xl backdrop-blur-xl"
                >
                  {MOOD_OPTIONS.map((option) => {
                    const selected = option.id === mood.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => {
                          setMoodId(option.id);
                          setActiveDropdown(null);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs transition",
                          selected
                            ? "bg-white/10 text-white"
                            : "text-slate-300 hover:bg-white/10 hover:text-white",
                        )}
                      >
                        <span>{option.label}</span>
                        <span className="text-[10px] text-slate-500">
                          {option.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-full border text-[10px] font-semibold uppercase",
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
            className="h-9 w-9 rounded-xl text-slate-200"
            aria-expanded={open}
            aria-label={open ? "关闭菜单" : "打开菜单"}
            onClick={() => setOpen((value) => !value)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-white/10 bg-slate-950/45 px-6 py-4 backdrop-blur-xl lg:hidden">
          <ul className="grid gap-2">
            {navGroups.map((group) => (
              <li key={group.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                  <DecryptedText text={group.label} revealOnHover speed={18} />
                </p>
                <div className="grid gap-2">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      pathname={pathname}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-200"
                    />
                  ))}
                </div>
              </li>
            ))}
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
