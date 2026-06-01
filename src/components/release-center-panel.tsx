"use client";

import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import type { ReleaseApp, ReleaseOrder } from "@/lib/release-center-store";

type ReleaseData = {
  apps: ReleaseApp[];
  orders: ReleaseOrder[];
};

type CheckKey = "unitPassed" | "e2ePassed" | "securityPassed" | "approved";

const checkItems: Array<{ key: CheckKey; label: string }> = [
  { key: "unitPassed", label: "Unit 通过" },
  { key: "e2ePassed", label: "E2E 通过" },
  { key: "securityPassed", label: "安全扫描通过" },
  { key: "approved", label: "人工审批通过" },
];

export function ReleaseCenterPanel() {
  const { authenticated } = useAuth();
  const [apps, setApps] = useState<ReleaseApp[]>([]);
  const [orders, setOrders] = useState<ReleaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  const [appForm, setAppForm] = useState({
    name: "",
    repo: "",
    buildCommand: "pnpm build",
    testCommand: "pnpm lint && pnpm test:e2e",
  });
  const [orderForm, setOrderForm] = useState({
    appId: "",
    version: "",
    branch: "main",
    changeTicket: "",
  });
  const [approvalDraft, setApprovalDraft] = useState<
    Record<string, { approver: string; reason: string }>
  >({});

  async function loadData() {
    setLoading(true);
    try {
      const [appsRes, ordersRes] = await Promise.all([
        fetch("/api/release/apps", { cache: "no-store" }),
        fetch("/api/release/orders", { cache: "no-store" }),
      ]);
      const appsPayload = (await appsRes.json()) as { apps?: ReleaseApp[] };
      const ordersPayload = (await ordersRes.json()) as { orders?: ReleaseOrder[] };
      const next: ReleaseData = {
        apps: appsPayload.apps ?? [],
        orders: ordersPayload.orders ?? [],
      };
      setApps(next.apps);
      setOrders(next.orders);
      if (!orderForm.appId && next.apps[0]) {
        setOrderForm((current) => ({ ...current, appId: next.apps[0]!.id }));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);
    return () => {
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const releaseSummary = useMemo(() => {
    const released = orders.filter((item) => item.status === "released").length;
    const inProgress = orders.filter((item) => item.status !== "released").length;
    return { released, inProgress };
  }, [orders]);

  async function createApp() {
    setMessage("");
    const response = await fetch("/api/release/apps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appForm),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(payload.error ?? "创建应用失败");
      return;
    }
    setAppForm((current) => ({ ...current, name: "", repo: "" }));
    await loadData();
  }

  async function createOrder() {
    setMessage("");
    const response = await fetch("/api/release/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderForm),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(payload.error ?? "创建发布单失败");
      return;
    }
    setOrderForm((current) => ({
      ...current,
      version: "",
      branch: "main",
      changeTicket: "",
    }));
    await loadData();
  }

  async function runAction(orderId: string, body: object) {
    setBusyOrderId(orderId);
    setMessage("");
    try {
      const response = await fetch(`/api/release/orders/${orderId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(payload.error ?? "发布动作执行失败");
        return;
      }
      await loadData();
    } finally {
      setBusyOrderId(null);
    }
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 md:grid-cols-3">
        <Metric label="应用数" value={String(apps.length)} />
        <Metric label="发布中" value={String(releaseSummary.inProgress)} />
        <Metric label="已完成" value={String(releaseSummary.released)} />
      </section>

      {!authenticated ? (
        <p className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          当前为游客模式：可浏览发布单。登录 admin 后可创建应用、构建、发布。
        </p>
      ) : null}

      {message ? (
        <p className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
          {message}
        </p>
      ) : null}

      <section className="grid gap-4 rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 lg:grid-cols-2">
        <div className="grid gap-3">
          <p className="text-sm font-semibold text-white">1) 添加应用</p>
          <Input
            placeholder="应用名，如 ai-my-home-web"
            value={appForm.name}
            onChange={(value) => setAppForm((current) => ({ ...current, name: value }))}
          />
          <Input
            placeholder="仓库地址"
            value={appForm.repo}
            onChange={(value) => setAppForm((current) => ({ ...current, repo: value }))}
          />
          <Input
            placeholder="构建命令"
            value={appForm.buildCommand}
            onChange={(value) =>
              setAppForm((current) => ({ ...current, buildCommand: value }))
            }
          />
          <Input
            placeholder="测试命令"
            value={appForm.testCommand}
            onChange={(value) =>
              setAppForm((current) => ({ ...current, testCommand: value }))
            }
          />
          <Button disabled={!authenticated} onClick={() => void createApp()}>
            新增应用
          </Button>
        </div>

        <div className="grid gap-3">
          <p className="text-sm font-semibold text-white">2) 创建发布单</p>
          <select
            value={orderForm.appId}
            onChange={(event) =>
              setOrderForm((current) => ({ ...current, appId: event.target.value }))
            }
            className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-slate-100"
          >
            <option value="">选择应用</option>
            {apps.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name}
              </option>
            ))}
          </select>
          <Input
            placeholder="版本号，如 v1.2.0"
            value={orderForm.version}
            onChange={(value) =>
              setOrderForm((current) => ({ ...current, version: value }))
            }
          />
          <Input
            placeholder="分支，如 main / release/2026.06"
            value={orderForm.branch}
            onChange={(value) =>
              setOrderForm((current) => ({ ...current, branch: value }))
            }
          />
          <Input
            placeholder="变更单号，如 CR-2026-0612"
            value={orderForm.changeTicket}
            onChange={(value) =>
              setOrderForm((current) => ({ ...current, changeTicket: value }))
            }
          />
          <Button
            disabled={!authenticated || !orderForm.appId || !orderForm.changeTicket.trim()}
            onClick={() => void createOrder()}
          >
            创建发布单
          </Button>
        </div>
      </section>

      <section className="grid gap-4">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
          3) 发布流水线执行
        </p>
        {loading ? (
          <p className="text-sm text-slate-400">加载中...</p>
        ) : orders.length ? (
          orders.map((order) => (
            <article
              key={order.id}
              className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-slate-950/75 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {order.appName}
                  </p>
                  <h3 className="text-lg font-semibold text-white">
                    {order.version} · {order.branch}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">{order.changeTicket}</p>
                </div>
                <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
                  {order.status}
                </span>
              </div>
              {order.lock.locked ? (
                <p className="rounded-xl border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-xs text-amber-100">
                  pipeline locked by {order.lock.by} · {order.lock.reason}
                </p>
              ) : null}

              <div className="grid gap-3 md:grid-cols-3">
                <StagePill
                  title="Build"
                  detail={
                    order.build.status === "success"
                      ? `${Math.round((order.build.durationMs ?? 0) / 1000)}s · ${order.build.artifact ?? "-"}`
                      : "等待执行"
                  }
                  status={order.build.status}
                />
                <StagePill
                  title="Test"
                  detail={order.environments.test.deployedAt ?? "未部署"}
                  status={order.environments.test.status}
                />
                <StagePill
                  title="Pre/Prod"
                  detail={`pre: ${order.environments.pre.status} · prod: ${order.environments.prod.status}`}
                  status={
                    order.environments.prod.status === "success"
                      ? "success"
                      : order.environments.pre.status
                  }
                />
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                {checkItems.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    disabled={!authenticated || busyOrderId === order.id}
                    onClick={() =>
                      void runAction(order.id, {
                        action: "set_checks",
                        checks: { [item.key]: !order.checks[item.key] },
                        approval:
                          item.key === "approved"
                            ? {
                                approver:
                                  approvalDraft[order.id]?.approver ??
                                  order.approval.approver ??
                                  "",
                                reason:
                                  approvalDraft[order.id]?.reason ??
                                  order.approval.reason ??
                                  "",
                              }
                            : undefined,
                      })
                    }
                    className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
                      order.checks[item.key]
                        ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                        : "border-white/10 bg-white/5 text-slate-300"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="grid gap-2 rounded-xl border border-white/10 bg-white/5 p-3 md:grid-cols-2">
                <Input
                  placeholder="审批人，如 release-oncall"
                  value={approvalDraft[order.id]?.approver ?? order.approval.approver ?? ""}
                  onChange={(value) =>
                    setApprovalDraft((current) => ({
                      ...current,
                      [order.id]: {
                        approver: value,
                        reason: current[order.id]?.reason ?? order.approval.reason ?? "",
                      },
                    }))
                  }
                />
                <Input
                  placeholder="审批理由，如 低峰窗口+回滚验证完成"
                  value={approvalDraft[order.id]?.reason ?? order.approval.reason ?? ""}
                  onChange={(value) =>
                    setApprovalDraft((current) => ({
                      ...current,
                      [order.id]: {
                        approver:
                          current[order.id]?.approver ?? order.approval.approver ?? "",
                        reason: value,
                      },
                    }))
                  }
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  disabled={!authenticated || busyOrderId === order.id}
                  onClick={() => void runAction(order.id, { action: "run_build" })}
                >
                  构建
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!authenticated || busyOrderId === order.id}
                  onClick={() =>
                    void runAction(order.id, {
                      action: "deploy",
                      environment: "test",
                    })
                  }
                >
                  发布测试环境
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!authenticated || busyOrderId === order.id}
                  onClick={() =>
                    void runAction(order.id, {
                      action: "deploy",
                      environment: "pre",
                    })
                  }
                >
                  发布预发环境
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!authenticated || busyOrderId === order.id}
                  onClick={() =>
                    void runAction(order.id, {
                      action: "deploy",
                      environment: "prod",
                    })
                  }
                >
                  发布生产环境
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!authenticated || busyOrderId === order.id}
                  onClick={() =>
                    void runAction(order.id, {
                      action: "rollback_prod",
                    })
                  }
                >
                  生产回滚
                </Button>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  审计日志
                </p>
                <div className="mt-2 grid gap-1 font-mono text-[11px] text-slate-400">
                  {order.auditLogs.length ? (
                    order.auditLogs.slice(0, 6).map((log) => (
                      <p key={log.id}>
                        [{new Date(log.at).toLocaleTimeString()}] {log.operator} ·{" "}
                        {log.action} · {log.detail}
                      </p>
                    ))
                  ) : (
                    <p>暂无操作记录</p>
                  )}
                </div>
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
            暂无发布单，先创建一个应用和发布单。
          </p>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </article>
  );
}

function Input({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-slate-100 outline-none focus:border-cyan-300/40"
    />
  );
}

function StagePill({
  title,
  status,
  detail,
}: {
  title: string;
  status: "pending" | "running" | "success" | "failed";
  detail: string;
}) {
  const colorClass =
    status === "success"
      ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
      : status === "running"
        ? "border-cyan-300/25 bg-cyan-300/10 text-cyan-100"
        : status === "failed"
          ? "border-rose-300/25 bg-rose-300/10 text-rose-100"
          : "border-white/10 bg-white/5 text-slate-300";

  return (
    <div className={`rounded-xl border px-3 py-2 text-xs ${colorClass}`}>
      <p className="font-semibold uppercase tracking-[0.2em]">{title}</p>
      <p className="mt-1 truncate">{detail}</p>
    </div>
  );
}
