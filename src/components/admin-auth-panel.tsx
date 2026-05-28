"use client";

import { useEffect, useState } from "react";

export function AdminAuthPanel() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/session", { cache: "no-store", signal: controller.signal })
      .then((res) => res.json())
      .then((data: { authenticated?: boolean }) => {
        setAuthenticated(Boolean(data.authenticated));
      })
      .catch(() => {
        setAuthenticated(false);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(payload.error ?? "登录失败");
      return;
    }
    setAuthenticated(true);
    setPassword("");
    setMessage("登录成功，已获得管理员 Token");
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthenticated(false);
    setMessage("已退出管理员登录");
  }

  if (loading) {
    return <p className="text-sm text-slate-400">正在检查登录状态...</p>;
  }

  return (
    <div className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/70 p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Admin Auth</p>
      <p className="text-sm text-slate-300">
        当前状态：
        <span className={authenticated ? "text-emerald-300" : "text-slate-200"}>
          {authenticated ? " 已登录" : " 游客"}
        </span>
      </p>
      {authenticated ? (
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 hover:border-white/20"
        >
          退出登录
        </button>
      ) : (
        <form onSubmit={handleLogin} className="grid gap-3 md:grid-cols-3">
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none"
            placeholder="管理员账号"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none"
            placeholder="管理员密码"
          />
          <button
            type="submit"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-100"
          >
            登录
          </button>
        </form>
      )}
      {message ? <p className="text-sm text-cyan-200/90">{message}</p> : null}
    </div>
  );
}
