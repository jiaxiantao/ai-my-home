import { randomUUID } from "node:crypto";

import type {
  ReleaseActionType,
  ReleaseApp,
  ReleaseChecks,
  ReleaseEnvironment,
  ReleaseOperator,
  ReleaseOrder,
  ReleaseOrderStatus,
  ReleaseStageStatus,
} from "@/lib/release-center-types";
import { getDb } from "@/lib/db";

const orderLocks = new Set<string>();
const runtimeLocks = new Map<
  string,
  ReleaseOrder["lock"]
>();

const memoryApps: ReleaseApp[] = [
  {
    id: randomUUID(),
    name: "ai-my-home-web",
    repo: "github.com/jiaxiantao/ai-my-home",
    buildCommand: "pnpm build",
    testCommand: "pnpm lint && pnpm test:e2e",
    createdAt: new Date().toISOString(),
  },
];

const memoryOrders: ReleaseOrder[] = [];

function nowIso() {
  return new Date().toISOString();
}

function emptyLock(): ReleaseOrder["lock"] {
  return { locked: false, by: null, reason: null, lockedAt: null };
}

function applyRuntimeLock(order: ReleaseOrder): ReleaseOrder {
  const lock = runtimeLocks.get(order.id) ?? emptyLock();
  return { ...order, lock };
}

function mapDbApp(app: {
  id: string;
  name: string;
  repo: string;
  buildCommand: string;
  testCommand: string;
  createdAt: Date;
}): ReleaseApp {
  return {
    id: app.id,
    name: app.name,
    repo: app.repo,
    buildCommand: app.buildCommand,
    testCommand: app.testCommand,
    createdAt: app.createdAt.toISOString(),
  };
}

function mapDbOrder(
  row: {
    id: string;
    appId: string;
    appName: string;
    version: string;
    branch: string;
    changeTicket: string;
    status: string;
    buildStatus: string;
    buildDurationMs: number | null;
    buildArtifact: string | null;
    buildLogs: string[];
    unitPassed: boolean;
    e2ePassed: boolean;
    securityPassed: boolean;
    approved: boolean;
    approver: string | null;
    approvalReason: string | null;
    approvedAt: Date | null;
    testStatus: string;
    testDeployedAt: Date | null;
    preStatus: string;
    preDeployedAt: Date | null;
    prodStatus: string;
    prodDeployedAt: Date | null;
    createdAt: Date;
    auditLogs: Array<{
      id: string;
      operator: string;
      action: string;
      detail: string;
      createdAt: Date;
    }>;
  },
): ReleaseOrder {
  return {
    id: row.id,
    appId: row.appId,
    appName: row.appName,
    version: row.version,
    branch: row.branch,
    changeTicket: row.changeTicket,
    createdAt: row.createdAt.toISOString(),
    status: row.status as ReleaseOrderStatus,
    build: {
      status: row.buildStatus as ReleaseStageStatus,
      durationMs: row.buildDurationMs,
      artifact: row.buildArtifact,
      logs: row.buildLogs,
    },
    checks: {
      unitPassed: row.unitPassed,
      e2ePassed: row.e2ePassed,
      securityPassed: row.securityPassed,
      approved: row.approved,
    },
    approval: {
      approver: row.approver,
      reason: row.approvalReason,
      approvedAt: row.approvedAt?.toISOString() ?? null,
    },
    environments: {
      test: {
        status: row.testStatus as ReleaseStageStatus,
        deployedAt: row.testDeployedAt?.toISOString() ?? null,
      },
      pre: {
        status: row.preStatus as ReleaseStageStatus,
        deployedAt: row.preDeployedAt?.toISOString() ?? null,
      },
      prod: {
        status: row.prodStatus as ReleaseStageStatus,
        deployedAt: row.prodDeployedAt?.toISOString() ?? null,
      },
    },
    lock: emptyLock(),
    auditLogs: row.auditLogs.map((log) => ({
      id: log.id,
      at: log.createdAt.toISOString(),
      operator: log.operator as ReleaseOperator,
      action: log.action as ReleaseActionType,
      detail: log.detail,
    })),
  };
}

function mapOrderToDbData(order: ReleaseOrder) {
  return {
    appId: order.appId,
    appName: order.appName,
    version: order.version,
    branch: order.branch,
    changeTicket: order.changeTicket,
    status: order.status,
    buildStatus: order.build.status,
    buildDurationMs: order.build.durationMs,
    buildArtifact: order.build.artifact,
    buildLogs: order.build.logs,
    unitPassed: order.checks.unitPassed,
    e2ePassed: order.checks.e2ePassed,
    securityPassed: order.checks.securityPassed,
    approved: order.checks.approved,
    approver: order.approval.approver,
    approvalReason: order.approval.reason,
    approvedAt: order.approval.approvedAt ? new Date(order.approval.approvedAt) : null,
    testStatus: order.environments.test.status,
    testDeployedAt: order.environments.test.deployedAt
      ? new Date(order.environments.test.deployedAt)
      : null,
    preStatus: order.environments.pre.status,
    preDeployedAt: order.environments.pre.deployedAt
      ? new Date(order.environments.pre.deployedAt)
      : null,
    prodStatus: order.environments.prod.status,
    prodDeployedAt: order.environments.prod.deployedAt
      ? new Date(order.environments.prod.deployedAt)
      : null,
  };
}

async function persistDbOrder(order: ReleaseOrder) {
  const db = getDb();
  if (!db) {
    return;
  }

  await db.releaseOrder.update({
    where: { id: order.id },
    data: mapOrderToDbData(order),
  });
}

async function appendDbAuditLog(
  orderId: string,
  input: {
    operator: ReleaseOperator;
    action: ReleaseActionType;
    detail: string;
  },
) {
  const db = getDb();
  if (!db) {
    return;
  }

  await db.releaseAuditLog.create({
    data: {
      orderId,
      operator: input.operator,
      action: input.action,
      detail: input.detail,
    },
  });

  const overflow = await db.releaseAuditLog.findMany({
    where: { orderId },
    orderBy: { createdAt: "desc" },
    skip: 20,
    select: { id: true },
  });

  if (overflow.length) {
    await db.releaseAuditLog.deleteMany({
      where: { id: { in: overflow.map((item) => item.id) } },
    });
  }
}

async function loadDbOrder(orderId: string) {
  const db = getDb();
  if (!db) {
    return null;
  }

  const row = await db.releaseOrder.findUnique({
    where: { id: orderId },
    include: {
      auditLogs: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!row) {
    return null;
  }

  return applyRuntimeLock(mapDbOrder(row));
}

export async function listReleaseApps(): Promise<ReleaseApp[]> {
  const db = getDb();
  if (!db) {
    return [...memoryApps].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const apps = await db.releaseApp.findMany({ orderBy: { createdAt: "desc" } });
  return apps.map(mapDbApp);
}

export async function createReleaseApp(input: {
  name: string;
  repo: string;
  buildCommand: string;
  testCommand: string;
}): Promise<ReleaseApp> {
  const db = getDb();
  if (!db) {
    const app: ReleaseApp = {
      id: randomUUID(),
      name: input.name.trim(),
      repo: input.repo.trim(),
      buildCommand: input.buildCommand.trim(),
      testCommand: input.testCommand.trim(),
      createdAt: nowIso(),
    };
    memoryApps.unshift(app);
    return app;
  }

  const app = await db.releaseApp.create({
    data: {
      name: input.name.trim(),
      repo: input.repo.trim(),
      buildCommand: input.buildCommand.trim(),
      testCommand: input.testCommand.trim(),
    },
  });

  return mapDbApp(app);
}

export async function listReleaseOrders(): Promise<ReleaseOrder[]> {
  const db = getDb();
  if (!db) {
    return [...memoryOrders]
      .map(applyRuntimeLock)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const rows = await db.releaseOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      auditLogs: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  return rows.map((row) => applyRuntimeLock(mapDbOrder(row)));
}

export async function createReleaseOrder(input: {
  appId: string;
  version: string;
  branch: string;
  changeTicket: string;
}): Promise<ReleaseOrder> {
  const apps = await listReleaseApps();
  const app = apps.find((item) => item.id === input.appId);
  if (!app) {
    throw new Error("Application not found");
  }

  const db = getDb();
  if (!db) {
    const order: ReleaseOrder = {
      id: randomUUID(),
      appId: app.id,
      appName: app.name,
      version: input.version.trim(),
      branch: input.branch.trim(),
      changeTicket: input.changeTicket.trim(),
      createdAt: nowIso(),
      status: "draft",
      build: {
        status: "pending",
        durationMs: null,
        artifact: null,
        logs: [],
      },
      checks: {
        unitPassed: false,
        e2ePassed: false,
        securityPassed: false,
        approved: false,
      },
      approval: { approver: null, reason: null, approvedAt: null },
      environments: {
        test: { status: "pending", deployedAt: null },
        pre: { status: "pending", deployedAt: null },
        prod: { status: "pending", deployedAt: null },
      },
      lock: emptyLock(),
      auditLogs: [],
    };
    appendMemoryAuditLog(order, {
      operator: "admin",
      action: "create_order",
      detail: `创建发布单 ${order.version} (${order.branch}) · ${order.changeTicket}`,
    });
    memoryOrders.unshift(order);
    return applyRuntimeLock(order);
  }

  const row = await db.releaseOrder.create({
    data: {
      appId: app.id,
      appName: app.name,
      version: input.version.trim(),
      branch: input.branch.trim(),
      changeTicket: input.changeTicket.trim(),
    },
    include: { auditLogs: true },
  });

  await appendDbAuditLog(row.id, {
    operator: "admin",
    action: "create_order",
    detail: `创建发布单 ${row.version} (${row.branch}) · ${row.changeTicket}`,
  });

  const loaded = await loadDbOrder(row.id);
  if (!loaded) {
    throw new Error("Failed to load created release order");
  }
  return loaded;
}

export async function updateReleaseChecks(
  orderId: string,
  checks: Partial<ReleaseChecks>,
  approvalInput?: { approver?: string; reason?: string },
  operator: ReleaseOperator = "admin",
) {
  return withOrderLock(orderId, operator, "更新质量门禁", async (order) => {
    const nextApproved =
      checks.approved === undefined ? order.checks.approved : checks.approved;

    if (nextApproved) {
      const approver = approvalInput?.approver?.trim() ?? order.approval.approver ?? "";
      const reason = approvalInput?.reason?.trim() ?? order.approval.reason ?? "";
      if (!approver || !reason) {
        throw new Error("Approver and approval reason are required before approval");
      }
      order.approval.approver = approver;
      order.approval.reason = reason;
      order.approval.approvedAt = nowIso();
    } else if (checks.approved === false) {
      order.approval.approvedAt = null;
    }

    order.checks = { ...order.checks, ...checks };
    await appendAudit(order, {
      operator,
      action: "set_checks",
      detail: `更新门禁：${JSON.stringify(checks)}${
        approvalInput ? ` · 审批信息：${JSON.stringify(approvalInput)}` : ""
      }`,
    });
    return order;
  });
}

export async function runReleaseBuild(orderId: string, operator: ReleaseOperator = "admin") {
  return withOrderLock(orderId, operator, "触发构建", async (order) => {
    order.build.status = "running";
    order.build.logs.push(`[${nowIso()}] checkout ${order.branch}`);
    order.build.logs.push(`[${nowIso()}] install dependencies`);
    order.build.logs.push(`[${nowIso()}] execute build pipeline`);

    const durationMs = 120000 + Math.round(Math.random() * 45000);
    order.build.durationMs = durationMs;
    order.build.status = "success";
    order.build.artifact = `${order.appName}-${order.version}.tar.gz`;
    order.build.logs.push(
      `[${nowIso()}] build success, artifact: ${order.build.artifact}`,
    );
    order.status = "built";
    await appendAudit(order, {
      operator,
      action: "run_build",
      detail: `构建成功，产物 ${order.build.artifact}`,
    });
    return order;
  });
}

export async function deployReleaseEnvironment(
  orderId: string,
  environment: ReleaseEnvironment,
  operator: ReleaseOperator = "admin",
) {
  return withOrderLock(orderId, operator, `发布 ${environment}`, async (order) => {
    if (order.build.status !== "success") {
      throw new Error("Build must succeed before deployment");
    }

    if (environment === "test") {
      order.environments.test.status = "success";
      order.environments.test.deployedAt = nowIso();
      order.status = "testing";
      await appendAudit(order, {
        operator,
        action: "deploy_test",
        detail: "发布到测试环境",
      });
      return order;
    }

    if (environment === "pre") {
      if (order.environments.test.status !== "success") {
        throw new Error("Test environment must be deployed first");
      }
      if (!(order.checks.unitPassed && order.checks.e2ePassed)) {
        throw new Error("Unit and E2E checks must pass before pre-release");
      }
      order.environments.pre.status = "success";
      order.environments.pre.deployedAt = nowIso();
      order.status = "staging";
      await appendAudit(order, {
        operator,
        action: "deploy_pre",
        detail: "发布到预发环境",
      });
      return order;
    }

    if (order.environments.pre.status !== "success") {
      throw new Error("Pre-release environment must be deployed first");
    }
    if (!(order.checks.securityPassed && order.checks.approved)) {
      throw new Error(
        "Security gate and manual approval are required for production",
      );
    }
    if (!order.approval.approver || !order.approval.reason) {
      throw new Error("Approver and reason are required for production deployment");
    }
    assertProdReleaseWindow();
    order.environments.prod.status = "success";
    order.environments.prod.deployedAt = nowIso();
    order.status = "released";
    await appendAudit(order, {
      operator,
      action: "deploy_prod",
      detail: `发布到生产环境 · approver=${order.approval.approver}`,
    });
    return order;
  });
}

export async function rollbackReleaseProduction(
  orderId: string,
  operator: ReleaseOperator = "admin",
) {
  return withOrderLock(orderId, operator, "生产回滚", async (order) => {
    if (order.environments.prod.status !== "success") {
      throw new Error("Production has not been deployed, rollback is unavailable");
    }
    order.environments.prod.status = "failed";
    order.status = "staging";
    order.checks.approved = false;
    order.approval.approvedAt = null;
    await appendAudit(order, {
      operator,
      action: "rollback_prod",
      detail: "生产环境回滚至预发版本，需重新审批后再发版",
    });
    return order;
  });
}

function assertProdReleaseWindow(date = new Date()) {
  const start = Number(process.env.RELEASE_PROD_WINDOW_START_HOUR ?? "10");
  const end = Number(process.env.RELEASE_PROD_WINDOW_END_HOUR ?? "22");
  const hour = date.getHours();
  const inWindow = start < end ? hour >= start && hour < end : hour >= start || hour < end;
  if (!inWindow) {
    throw new Error(
      `Production release window is ${String(start).padStart(2, "0")}:00-${String(end).padStart(2, "0")}:00`,
    );
  }
}

async function getReleaseOrderOrThrow(orderId: string) {
  const db = getDb();
  if (!db) {
    const order = memoryOrders.find((item) => item.id === orderId);
    if (!order) {
      throw new Error("Release order not found");
    }
    return applyRuntimeLock(order);
  }

  const order = await loadDbOrder(orderId);
  if (!order) {
    throw new Error("Release order not found");
  }
  return order;
}

async function withOrderLock<T>(
  orderId: string,
  operator: ReleaseOperator,
  reason: string,
  runner: (order: ReleaseOrder) => Promise<T> | T,
) {
  if (orderLocks.has(orderId)) {
    throw new Error("Another pipeline action is running, please retry later");
  }

  orderLocks.add(orderId);
  const lockState: ReleaseOrder["lock"] = {
    locked: true,
    by: operator,
    reason,
    lockedAt: nowIso(),
  };
  runtimeLocks.set(orderId, lockState);

  try {
    const order = await getReleaseOrderOrThrow(orderId);
    order.lock = lockState;
    await runner(order);
    await persistOrder(order);
    return getReleaseOrderOrThrow(orderId);
  } finally {
    orderLocks.delete(orderId);
    runtimeLocks.delete(orderId);
  }
}

async function persistOrder(order: ReleaseOrder) {
  const db = getDb();
  if (!db) {
    const index = memoryOrders.findIndex((item) => item.id === order.id);
    if (index >= 0) {
      memoryOrders[index] = { ...order, lock: emptyLock() };
    }
    return;
  }

  await persistDbOrder(order);
}

async function appendAudit(
  order: ReleaseOrder,
  input: {
    operator: ReleaseOperator;
    action: ReleaseActionType;
    detail: string;
  },
) {
  const db = getDb();
  if (!db) {
    appendMemoryAuditLog(order, input);
    return;
  }

  await appendDbAuditLog(order.id, input);
  const entry = {
    id: randomUUID(),
    at: nowIso(),
    operator: input.operator,
    action: input.action,
    detail: input.detail,
  };
  order.auditLogs = [entry, ...order.auditLogs].slice(0, 20);
}

export type ReleaseSummary = {
  appCount: number;
  orderCount: number;
  byStatus: Record<ReleaseOrderStatus, number>;
  recentOrders: Array<{
    id: string;
    appName: string;
    version: string;
    status: ReleaseOrderStatus;
    changeTicket: string;
    createdAt: string;
  }>;
};

function emptyStatusCounts(): Record<ReleaseOrderStatus, number> {
  return {
    draft: 0,
    built: 0,
    testing: 0,
    staging: 0,
    released: 0,
  };
}

export async function getReleaseSummary(): Promise<ReleaseSummary> {
  const apps = await listReleaseApps();
  const orders = await listReleaseOrders();
  const byStatus = emptyStatusCounts();

  for (const order of orders) {
    byStatus[order.status] += 1;
  }

  return {
    appCount: apps.length,
    orderCount: orders.length,
    byStatus,
    recentOrders: orders.slice(0, 5).map((order) => ({
      id: order.id,
      appName: order.appName,
      version: order.version,
      status: order.status,
      changeTicket: order.changeTicket,
      createdAt: order.createdAt,
    })),
  };
}

function appendMemoryAuditLog(
  order: ReleaseOrder,
  input: {
    operator: ReleaseOperator;
    action: ReleaseActionType;
    detail: string;
  },
) {
  order.auditLogs.unshift({
    id: randomUUID(),
    at: nowIso(),
    operator: input.operator,
    action: input.action,
    detail: input.detail,
  });
  order.auditLogs = order.auditLogs.slice(0, 20);
}
