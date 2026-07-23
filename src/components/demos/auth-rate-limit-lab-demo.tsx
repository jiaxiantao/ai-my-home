"use client";

import { useMemo, useRef, useState } from "react";

import {
  LOGIN_RATE_LIMIT_WINDOW_MS,
  assessLoginRisk,
  createLoginRateLimiter,
  formatLoginRiskLevelLabel,
  getAdaptiveLoginLimitByRisk,
  getLoginRiskContributions,
} from "@/lib/auth-rate-limit";

type AttackMode = "single-ip" | "distributed-ip";

type AttackLog = {
  id: number;
  at: number;
  ip: string;
  username: string;
  limited: boolean;
  retryAfterSeconds?: number;
  riskScore: number;
  riskLevel: "low" | "medium" | "high";
  dynamicLimit: number;
};

export function AuthRateLimitLabDemo() {
  const [username, setUsername] = useState("admin");
  const [baseIp, setBaseIp] = useState("10.10.0.7");
  const [mode, setMode] = useState<AttackMode>("single-ip");
  const [logs, setLogs] = useState<AttackLog[]>([]);
  const [failedStreak, setFailedStreak] = useState(0);
  const [usernameBurst, setUsernameBurst] = useState(0);
  const [ipSwitchCount, setIpSwitchCount] = useState(0);
  const [suspiciousUa, setSuspiciousUa] = useState(false);

  const idRef = useRef(0);
  const limiterMapRef = useRef(
    new Map<number, ReturnType<typeof createLoginRateLimiter>>([[5, createLoginRateLimiter({ maxAttempts: 5 })]]),
  );
  const lastIpRef = useRef(baseIp);

  const safeUsername = username.trim() || "admin";
  const windowSeconds = Math.round(LOGIN_RATE_LIMIT_WINDOW_MS / 1000);

  function resetLab() {
    setLogs([]);
    setFailedStreak(0);
    setUsernameBurst(0);
    setIpSwitchCount(0);
    limiterMapRef.current = new Map<number, ReturnType<typeof createLoginRateLimiter>>([
      [5, createLoginRateLimiter({ maxAttempts: 5 })],
    ]);
    lastIpRef.current = baseIp;
  }

  function getIpByIndex(index: number) {
    if (mode === "single-ip") {
      return baseIp;
    }

    const suffix = (index % 6) + 10;
    const chunks = baseIp.split(".");
    const prefix = chunks.length === 4 ? chunks.slice(0, 3).join(".") : "10.10.0";
    return `${prefix}.${suffix}`;
  }

  function pushAttempt(index: number) {
    const ip = getIpByIndex(index);
    const didSwitchIp = lastIpRef.current !== ip;
    const nextIpSwitchCount = didSwitchIp ? ipSwitchCount + 1 : ipSwitchCount;
    const nextFailedStreak = failedStreak + 1;
    const nextBurst = usernameBurst + 1;

    const risk = assessLoginRisk({
      ipSwitchCountLastMinute: nextIpSwitchCount,
      usernameBurstLastMinute: nextBurst,
      failedStreak: nextFailedStreak,
      suspiciousUserAgent: suspiciousUa,
    });
    const dynamicLimit = getAdaptiveLoginLimitByRisk(risk.level);
    if (!limiterMapRef.current.has(dynamicLimit)) {
      limiterMapRef.current.set(
        dynamicLimit,
        createLoginRateLimiter({ maxAttempts: dynamicLimit }),
      );
    }
    const result = limiterMapRef.current
      .get(dynamicLimit)!
      .check({ ip, username: safeUsername });
    idRef.current += 1;
    lastIpRef.current = ip;

    setIpSwitchCount(nextIpSwitchCount);
    setFailedStreak(nextFailedStreak);
    setUsernameBurst(nextBurst);

    setLogs((current) =>
      [
        {
          id: idRef.current,
          at: Date.now(),
          ip,
          username: safeUsername,
          limited: result.limited,
          retryAfterSeconds: result.limited ? result.retryAfterSeconds : undefined,
          riskScore: risk.score,
          riskLevel: risk.level,
          dynamicLimit,
        },
        ...current,
      ].slice(0, 20),
    );
  }

  function runBurst(total: number) {
    for (let index = 0; index < total; index += 1) {
      pushAttempt(index);
    }
  }

  const blockedCount = logs.filter((item) => item.limited).length;
  const passCount = logs.length - blockedCount;
  const blockedRatio = logs.length ? Math.round((blockedCount / logs.length) * 100) : 0;
  const latestRisk = logs[0];
  const currentSignals = useMemo(
    () => ({
      ipSwitchCountLastMinute: ipSwitchCount,
      usernameBurstLastMinute: usernameBurst,
      failedStreak,
      suspiciousUserAgent: suspiciousUa,
    }),
    [failedStreak, ipSwitchCount, suspiciousUa, usernameBurst],
  );
  const currentRisk = useMemo(() => assessLoginRisk(currentSignals), [currentSignals]);
  const riskContributions = useMemo(
    () => getLoginRiskContributions(currentSignals),
    [currentSignals],
  );
  const maxContributionScore = useMemo(
    () => Math.max(...riskContributions.map((item) => item.score), 1),
    [riskContributions],
  );

  const recommendation = useMemo(() => {
    if (!logs.length) {
      return "先触发几次模拟请求，看看同一策略下的拦截走势。";
    }
    if (mode === "single-ip" && blockedRatio >= 40) {
      return "同 IP 暴力尝试会被快速压制，当前策略对“脚本直冲”有效。";
    }
    if (mode === "distributed-ip" && blockedRatio <= 20) {
      return "分布式 IP 可绕过单桶策略，下一步建议叠加设备指纹/验证码/账号级熔断。";
    }
    if (latestRisk?.riskLevel === "high") {
      return "当前风险已进入 high，系统应该联动验证码或二次验证，避免账号被持续撞库。";
    }
    return "当前拦截率中等，建议继续叠加风险信号做分层限流。";
  }, [blockedRatio, logs.length, mode, latestRisk?.riskLevel]);

  return (
    <div className="grid gap-4">
      <p className="text-sm leading-7 text-slate-400">
        登录攻防实验台：复用真实限流算法，模拟同 IP 暴力尝试与分布式 IP 撞库，观察拦截效果差异。
      </p>

      <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/35 p-4 md:grid-cols-3">
        <label className="grid gap-2 text-xs text-slate-400">
          用户名
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300/40"
          />
        </label>
        <label className="grid gap-2 text-xs text-slate-400">
          基础 IP
          <input
            value={baseIp}
            onChange={(event) => setBaseIp(event.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300/40"
          />
        </label>
        <div className="grid gap-2 text-xs text-slate-400">
          攻击模式
          <div className="flex gap-2">
            <ModeButton
              active={mode === "single-ip"}
              label="单 IP 暴力"
              onClick={() => setMode("single-ip")}
            />
            <ModeButton
              active={mode === "distributed-ip"}
              label="分布式 IP"
              onClick={() => setMode("distributed-ip")}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/35 p-4 md:grid-cols-4">
        <StatCard label="连续失败" value={`${failedStreak}`} helper="failed streak" />
        <StatCard label="账号重试频率" value={`${usernameBurst}/min`} helper="username burst" />
        <StatCard label="IP 切换次数" value={`${ipSwitchCount}/min`} helper="ip switch" />
        <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-300">
          模拟可疑 UA
          <button
            type="button"
            onClick={() => setSuspiciousUa((value) => !value)}
            className={`rounded-full border px-3 py-1 transition ${
              suspiciousUa
                ? "border-cyan-300/35 bg-cyan-300/10 text-cyan-100"
                : "border-white/10 bg-slate-950/35 text-slate-400"
            }`}
          >
            {suspiciousUa ? "ON" : "OFF"}
          </button>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <ActionButton label="模拟 1 次失败登录" onClick={() => pushAttempt(0)} />
        <ActionButton label="连续攻击 x8" onClick={() => runBurst(8)} />
        <ActionButton label="重置实验" onClick={resetLab} accent="dim" />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <StatCard label="通过请求" value={`${passCount}`} helper="limited = false" />
        <StatCard label="拦截请求" value={`${blockedCount}`} helper="HTTP 429" />
        <StatCard
          label="动态规则"
          value={`${latestRisk?.dynamicLimit ?? 5}/${windowSeconds}s`}
          helper={`risk: ${latestRisk?.riskLevel ?? "low"} (${latestRisk?.riskScore ?? 10})`}
        />
      </div>

      <article className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
            风险评分拆解
          </p>
          <p className="text-xs text-slate-400">
            实时风险：
            <span
              className={`ml-1 font-semibold ${
                currentRisk.level === "high"
                  ? "text-rose-200"
                  : currentRisk.level === "medium"
                    ? "text-amber-200"
                    : "text-emerald-200"
              }`}
            >
              {formatLoginRiskLevelLabel(currentRisk.level)} ({currentRisk.score})
            </span>
          </p>
        </div>
        <div className="mt-4 grid gap-3">
          {riskContributions.map((item) => (
            <div key={item.id} className="grid gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">{item.label}</span>
                <span className="font-mono text-slate-400">+{item.score}</span>
              </div>
              <div className="h-2 rounded-full bg-white/5">
                <div
                  className={`h-full rounded-full ${
                    item.score <= 0
                      ? "bg-slate-700"
                      : item.score >= 28
                        ? "bg-rose-300/80"
                        : item.score >= 15
                          ? "bg-amber-300/80"
                          : "bg-cyan-300/80"
                  }`}
                  style={{ width: `${(item.score / maxContributionScore) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </article>

      <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
          防护判断
        </p>
        <p className="mt-2 text-sm leading-7 text-cyan-50">{recommendation}</p>
      </div>

      <div className="grid gap-2 rounded-2xl border border-white/10 bg-slate-950/40 p-4 font-mono text-xs">
        {logs.length ? (
          logs.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-slate-500">
                {new Date(item.at).toLocaleTimeString()}
              </span>
              <span className="text-slate-300">{item.ip}</span>
              <span className="text-slate-400">{item.username}</span>
              <span className={item.limited ? "text-rose-200" : "text-emerald-200"}>
                {item.limited ? `blocked (${item.retryAfterSeconds}s)` : "allowed"}
              </span>
              <span className="text-cyan-200">
                risk {item.riskLevel} ({item.riskScore}) · limit {item.dynamicLimit}
              </span>
            </div>
          ))
        ) : (
          <p className="text-slate-500">点击上方按钮开始攻防模拟</p>
        )}
      </div>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  accent = "default",
}: {
  label: string;
  onClick: () => void;
  accent?: "default" | "dim";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
        accent === "dim"
          ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
          : "border-cyan-300/35 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/20"
      }`}
    >
      {label}
    </button>
  );
}

function ModeButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-xs transition ${
        active
          ? "border-cyan-300/35 bg-cyan-300/10 text-cyan-100"
          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 font-mono text-[11px] text-slate-500">{helper}</p>
    </article>
  );
}
