"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { AnimatedList } from "@/components/reactbits/animated-list";
import { BlurText } from "@/components/reactbits/blur-text";
import { BorderGlow } from "@/components/reactbits/border-glow";
import { CountUp } from "@/components/reactbits/count-up";
import { DecryptedText } from "@/components/reactbits/decrypted-text";
import { StarBorder } from "@/components/reactbits/star-border";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  ReleaseApp,
  ReleaseOrder,
  ReleaseOrderStatus,
} from "@/lib/release-center-types";
import {
  RELEASE_ORDER_STATUS_LABELS,
  formatReleaseOrderStatus,
} from "@/lib/release-labels";
import {
  buildReleaseCenterQuery,
  buildReleaseCenterShareUrl,
  parseReleaseCenterState,
  type ReleaseStatusFilter,
} from "@/lib/release-center-url-state";

type StatusFilter = ReleaseStatusFilter;

const STATUS_FILTERS: Array<{ key: StatusFilter; label: string }> = [
  { key: "all", label: "全部" },
  ...(
    Object.entries(RELEASE_ORDER_STATUS_LABELS) as Array<
      [ReleaseOrderStatus, string]
    >
  ).map(([key, label]) => ({ key, label })),
];

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFilters = parseReleaseCenterState(searchParams);
  const [linkCopied, setLinkCopied] = useState(false);

  const { authenticated } = useAuth();
  const [apps, setApps] = useState<ReleaseApp[]>([]);
  const [orders, setOrders] = useState<ReleaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");
  const [feedback, setFeedback] = useState<{
    kind: "error" | "success";
    text: string;
  } | null>(null);

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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    initialFilters.status,
  );
  const [appFilter, setAppFilter] = useState<string>(initialFilters.app);
  const [searchQuery, setSearchQuery] = useState(initialFilters.q);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [openOrderIds, setOpenOrderIds] = useState<Set<string>>(new Set());
  const [batchBusy, setBatchBusy] = useState(false);

  useEffect(() => {
    const query = buildReleaseCenterQuery({
      status: statusFilter,
      app: appFilter,
      q: searchQuery,
    });
    router.replace(query ? `/release-center?${query}` : "/release-center", {
      scroll: false,
    });
  }, [statusFilter, appFilter, searchQuery, router]);

  const filterShareUrl = useMemo(
    () =>
      buildReleaseCenterShareUrl({
        status: statusFilter,
        app: appFilter,
        q: searchQuery,
      }),
    [statusFilter, appFilter, searchQuery],
  );

  async function loadData() {
    setLoading(true);
    setLoadError("");
    try {
      const [appsRes, ordersRes] = await Promise.all([
        fetch("/api/release/apps", { cache: "no-store" }),
        fetch("/api/release/orders", { cache: "no-store" }),
      ]);

      if (!appsRes.ok || !ordersRes.ok) {
        setLoadError("加载发布中心数据失败，请稍后点击刷新重试。");
        return;
      }

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
    } catch {
      setLoadError("网络异常，无法加载发布中心数据。");
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

  const statusCounts = useMemo(() => {
    const counts: Record<ReleaseOrderStatus, number> = {
      draft: 0,
      built: 0,
      testing: 0,
      staging: 0,
      released: 0,
    };
    for (const order of orders) {
      counts[order.status] += 1;
    }
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) {
        return false;
      }
      if (appFilter !== "all" && order.appId !== appFilter) {
        return false;
      }
      if (!query) {
        return true;
      }
      return (
        order.version.toLowerCase().includes(query) ||
        order.appName.toLowerCase().includes(query) ||
        order.changeTicket.toLowerCase().includes(query) ||
        order.branch.toLowerCase().includes(query)
      );
    });
  }, [orders, searchQuery, statusFilter, appFilter]);

  const appOrderCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const order of orders) {
      counts.set(order.appId, (counts.get(order.appId) ?? 0) + 1);
    }
    return counts;
  }, [orders]);

  const selectedOrders = useMemo(
    () => orders.filter((order) => selectedOrderIds.has(order.id)),
    [orders, selectedOrderIds],
  );

  const batchBuildCount = selectedOrders.filter((order) => order.status === "draft").length;
  const batchTestDeployCount = selectedOrders.filter(
    (order) => order.status === "built",
  ).length;

  function toggleOrderSelection(orderId: string, selected: boolean) {
    setSelectedOrderIds((current) => {
      const next = new Set(current);
      if (selected) {
        next.add(orderId);
      } else {
        next.delete(orderId);
      }
      return next;
    });
  }

  function selectAllFiltered() {
    setSelectedOrderIds(new Set(filteredOrders.map((order) => order.id)));
  }

  function expandAllFiltered() {
    setOpenOrderIds(new Set(filteredOrders.map((order) => order.id)));
  }

  function collapseAllOrders() {
    setOpenOrderIds(new Set());
  }

  async function runBatchBuild() {
    if (!authenticated || batchBuildCount === 0) {
      return;
    }

    setBatchBusy(true);
    setFeedback(null);
    let success = 0;

    for (const order of selectedOrders) {
      if (order.status !== "draft") {
        continue;
      }
      setBusyOrderId(order.id);
      try {
        const response = await fetch(`/api/release/orders/${order.id}/action`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "run_build" }),
        });
        if (response.ok) {
          success += 1;
        }
      } catch {
        // continue with remaining orders
      }
    }

    setBusyOrderId(null);
    setBatchBusy(false);
    setFeedback({
      kind: success === batchBuildCount ? "success" : "error",
      text:
        success === batchBuildCount
          ? `已批量构建 ${success} 张发布单。`
          : `批量构建完成 ${success}/${batchBuildCount}，部分失败。`,
    });
    await loadData();
  }

  async function runBatchDeployTest() {
    if (!authenticated || batchTestDeployCount === 0) {
      return;
    }

    setBatchBusy(true);
    setFeedback(null);
    let success = 0;

    for (const order of selectedOrders) {
      if (order.status !== "built") {
        continue;
      }
      setBusyOrderId(order.id);
      try {
        const response = await fetch(`/api/release/orders/${order.id}/action`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "deploy", environment: "test" }),
        });
        if (response.ok) {
          success += 1;
        }
      } catch {
        // continue with remaining orders
      }
    }

    setBusyOrderId(null);
    setBatchBusy(false);
    setFeedback({
      kind: success === batchTestDeployCount ? "success" : "error",
      text:
        success === batchTestDeployCount
          ? `已批量部署测试环境 ${success} 张发布单。`
          : `批量部署完成 ${success}/${batchTestDeployCount}，部分失败。`,
    });
    await loadData();
  }

  async function createApp() {
    setFeedback(null);
    const response = await fetch("/api/release/apps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appForm),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setFeedback({ kind: "error", text: payload.error ?? "创建应用失败" });
      return;
    }
    setAppForm((current) => ({ ...current, name: "", repo: "" }));
    setFeedback({ kind: "success", text: "应用已创建。" });
    await loadData();
  }

  async function createOrder() {
    setFeedback(null);
    const response = await fetch("/api/release/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderForm),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setFeedback({ kind: "error", text: payload.error ?? "创建发布单失败" });
      return;
    }
    setOrderForm((current) => ({
      ...current,
      version: "",
      branch: "main",
      changeTicket: "",
    }));
    setFeedback({ kind: "success", text: "发布单已创建。" });
    await loadData();
  }

  async function runAction(orderId: string, body: object) {
    setBusyOrderId(orderId);
    setFeedback(null);
    try {
      const response = await fetch(`/api/release/orders/${orderId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setFeedback({ kind: "error", text: payload.error ?? "发布动作执行失败" });
        return;
      }
      setFeedback({ kind: "success", text: "流水线动作已执行。" });
      await loadData();
    } finally {
      setBusyOrderId(null);
    }
  }

  return (
    <div className="grid gap-6">
      <BorderGlow className="rounded-4xl" glowColor="rgba(103, 232, 249, 0.2)">
      <section className="grid gap-4 rounded-4xl border border-white/10 bg-white/5 p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="应用数" value={apps.length} />
          <Metric label="发布单" value={orders.length} />
          <Metric label="进行中" value={orders.length - statusCounts.released} />
          <Metric label="已上线" value={statusCounts.released} />
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            Object.entries(statusCounts) as Array<[ReleaseOrderStatus, number]>
          ).map(([status, count]) => (
            <span
              key={status}
              className="rounded-full border border-white/10 bg-slate-950/35 px-3 py-1 text-xs text-slate-300"
            >
              {formatReleaseOrderStatus(status)} · {count}
            </span>
          ))}
        </div>
      </section>
      </BorderGlow>

      {!authenticated ? (
        <p className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          当前为游客模式：可浏览发布单。登录 admin 后可创建应用、构建、发布。
        </p>
      ) : null}

      {loadError ? (
        <p className="rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
          {loadError}
        </p>
      ) : null}

      {feedback ? (
        <p
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedback.kind === "success"
              ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
              : "border-cyan-300/20 bg-cyan-300/10 text-cyan-100"
          }`}
        >
          {feedback.text}
        </p>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <BorderGlow className="rounded-4xl" glowColor="rgba(103, 232, 249, 0.18)">
        <div className="grid gap-3 rounded-4xl border border-white/10 bg-slate-950/35 p-6">
          <p className="text-sm font-semibold text-white">
            <BlurText text="1) 添加应用" animateBy="words" />
          </p>
          <Input
            placeholder="应用名，如 ai-my-home-web"
            value={appForm.name}
            onChange={(event) =>
              setAppForm((current) => ({ ...current, name: event.target.value }))
            }
          />
          <Input
            placeholder="仓库地址"
            value={appForm.repo}
            onChange={(event) =>
              setAppForm((current) => ({ ...current, repo: event.target.value }))
            }
          />
          <Input
            placeholder="构建命令"
            value={appForm.buildCommand}
            onChange={(event) =>
              setAppForm((current) => ({
                ...current,
                buildCommand: event.target.value,
              }))
            }
          />
          <Input
            placeholder="测试命令"
            value={appForm.testCommand}
            onChange={(event) =>
              setAppForm((current) => ({
                ...current,
                testCommand: event.target.value,
              }))
            }
          />
          <Button disabled={!authenticated} onClick={() => void createApp()}>
              新增应用
            </Button>
        </div>
        </BorderGlow>

        <BorderGlow className="rounded-4xl" glowColor="rgba(167, 139, 250, 0.18)">
        <div className="grid gap-3 rounded-4xl border border-white/10 bg-slate-950/35 p-6">
          <p className="text-sm font-semibold text-white">
            <BlurText text="2) 创建发布单" animateBy="words" />
          </p>
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
            onChange={(event) =>
              setOrderForm((current) => ({ ...current, version: event.target.value }))
            }
          />
          <Input
            placeholder="分支，如 main / release/2026.06"
            value={orderForm.branch}
            onChange={(event) =>
              setOrderForm((current) => ({ ...current, branch: event.target.value }))
            }
          />
          <Input
            placeholder="变更单号，如 CR-2026-0612"
            value={orderForm.changeTicket}
            onChange={(event) =>
              setOrderForm((current) => ({
                ...current,
                changeTicket: event.target.value,
              }))
            }
          />
          <Button
              disabled={!authenticated || !orderForm.appId || !orderForm.changeTicket.trim()}
              onClick={() => void createOrder()}
            >
              创建发布单
            </Button>
        </div>
        </BorderGlow>
      </section>

      <section className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
            <DecryptedText text="3) 发布流水线执行" revealOnHover speed={16} />
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs text-slate-500">
              显示 {filteredOrders.length} / {orders.length} 张发布单
            </p>
            <Button
              size="sm"
              variant="outline"
              disabled={loading}
              onClick={() => void loadData()}
            >
              刷新
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await navigator.clipboard.writeText(filterShareUrl);
                setLinkCopied(true);
                window.setTimeout(() => setLinkCopied(false), 1800);
              }}
            >
              {linkCopied ? "已复制筛选链接" : "复制筛选链接"}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((item) => {
            const count =
              item.key === "all" ? orders.length : statusCounts[item.key];
            const active = statusFilter === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setStatusFilter(item.key)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  active
                    ? "border-cyan-300/35 bg-cyan-300/10 text-cyan-100"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20"
                }`}
              >
                {item.label} ({count})
              </button>
            );
          })}
        </div>

        {apps.length ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setAppFilter("all")}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                appFilter === "all"
                  ? "border-violet-300/35 bg-violet-300/10 text-violet-100"
                  : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20"
              }`}
            >
              全部应用 ({orders.length})
            </button>
            {apps.map((app) => {
              const count = appOrderCounts.get(app.id) ?? 0;
              const active = appFilter === app.id;
              return (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => setAppFilter(app.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    active
                      ? "border-violet-300/35 bg-violet-300/10 text-violet-100"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20"
                  }`}
                >
                  {app.name} ({count})
                </button>
              );
            })}
          </div>
        ) : null}

        <Input
          placeholder="搜索版本 / 应用 / 分支 / 变更单"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />

        {loading ? (
          <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
            <DecryptedText text="加载中..." speed={20} />
          </p>
        ) : (
          <>
            <BorderGlow className="rounded-xl" glowColor="rgba(103, 232, 249, 0.16)">
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-slate-500">
                已选 {selectedOrderIds.size} / {filteredOrders.length}
              </p>
              <Button
                size="sm"
                variant="outline"
                disabled={filteredOrders.length === 0}
                onClick={selectAllFiltered}
              >
                全选筛选结果
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={selectedOrderIds.size === 0}
                onClick={() => setSelectedOrderIds(new Set())}
              >
                清除选择
              </Button>
              <Button
                size="sm"
                disabled={
                  !authenticated || batchBusy || batchBuildCount === 0
                }
                onClick={() => void runBatchBuild()}
              >
                批量构建 ({batchBuildCount})
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={
                  !authenticated || batchBusy || batchTestDeployCount === 0
                }
                onClick={() => void runBatchDeployTest()}
              >
                批量部署测试 ({batchTestDeployCount})
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={filteredOrders.length === 0}
                onClick={expandAllFiltered}
              >
                展开全部
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={openOrderIds.size === 0}
                onClick={collapseAllOrders}
              >
                折叠全部
              </Button>
            </div>
            </BorderGlow>

            {filteredOrders.length ? (
              <AnimatedList
                items={filteredOrders}
                className="grid gap-4"
                getKey={(order) => order.id}
                renderItem={(order) => (
            <details
              open={openOrderIds.has(order.id)}
              onToggle={(event) => {
                const details = event.currentTarget;
                setOpenOrderIds((current) => {
                  const next = new Set(current);
                  if (details.open) {
                    next.add(order.id);
                  } else {
                    next.delete(order.id);
                  }
                  return next;
                });
              }}
              className="group rounded-3xl border border-white/10 bg-slate-950/40 open:border-cyan-300/20"
            >
              <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-5 marker:content-none [&::-webkit-details-marker]:hidden">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedOrderIds.has(order.id)}
                    disabled={!authenticated || batchBusy}
                    onChange={(event) =>
                      toggleOrderSelection(order.id, event.target.checked)
                    }
                    onClick={(event) => event.stopPropagation()}
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-950 accent-cyan-300"
                    aria-label={`选择发布单 ${order.version}`}
                  />
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      {order.appName}
                    </p>
                    <h3 className="text-lg font-semibold text-white">
                      {order.version} · {order.branch}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">{order.changeTicket}</p>
                  </div>
                </div>
                <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
                  {formatReleaseOrderStatus(order.status)}
                </span>
              </summary>

              <div className="grid gap-4 border-t border-white/10 p-5 pt-4">
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
                  onChange={(event) =>
                    setApprovalDraft((current) => ({
                      ...current,
                      [order.id]: {
                        approver: event.target.value,
                        reason: current[order.id]?.reason ?? order.approval.reason ?? "",
                      },
                    }))
                  }
                />
                <Input
                  placeholder="审批理由，如 低峰窗口+回滚验证完成"
                  value={approvalDraft[order.id]?.reason ?? order.approval.reason ?? ""}
                  onChange={(event) =>
                    setApprovalDraft((current) => ({
                      ...current,
                      [order.id]: {
                        approver:
                          current[order.id]?.approver ?? order.approval.approver ?? "",
                        reason: event.target.value,
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
              </div>
            </details>
                )}
              />
        ) : orders.length ? (
          <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
            <DecryptedText
              text="没有符合筛选条件的发布单，试试调整状态或搜索关键词。"
              speed={12}
            />
          </p>
        ) : (
          <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
            <DecryptedText text="暂无发布单，先创建一个应用和发布单。" speed={12} />
          </p>
        )}
          </>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">
        <CountUp to={value} duration={1.4} separator="," />
      </p>
    </article>
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
    <StarBorder className="rounded-xl" color="rgba(103, 232, 249, 0.22)" speed="10s">
      <div className={`rounded-xl border px-3 py-2 text-xs ${colorClass}`}>
      <p className="font-semibold uppercase tracking-[0.2em]">{title}</p>
      <p className="mt-1 truncate">{detail}</p>
      </div>
    </StarBorder>
  );
}
