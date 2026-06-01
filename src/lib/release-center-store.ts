import { randomUUID } from "node:crypto";

export type ReleaseEnvironment = "test" | "pre" | "prod";
export type ReleaseStageStatus = "pending" | "running" | "success" | "failed";
export type ReleaseOperator = "system" | "admin";
export type ReleaseActionType =
  | "create_order"
  | "run_build"
  | "set_checks"
  | "deploy_test"
  | "deploy_pre"
  | "deploy_prod"
  | "rollback_prod";

export type ReleaseApp = {
  id: string;
  name: string;
  repo: string;
  buildCommand: string;
  testCommand: string;
  createdAt: string;
};

export type ReleaseChecks = {
  unitPassed: boolean;
  e2ePassed: boolean;
  securityPassed: boolean;
  approved: boolean;
};

export type ReleaseOrder = {
  id: string;
  appId: string;
  appName: string;
  version: string;
  branch: string;
  createdAt: string;
  status: "draft" | "built" | "testing" | "staging" | "released";
  build: {
    status: ReleaseStageStatus;
    durationMs: number | null;
    artifact: string | null;
    logs: string[];
  };
  checks: ReleaseChecks;
  environments: Record<
    ReleaseEnvironment,
    {
      status: ReleaseStageStatus;
      deployedAt: string | null;
    }
  >;
  lock: {
    locked: boolean;
    by: ReleaseOperator | null;
    reason: string | null;
    lockedAt: string | null;
  };
  auditLogs: Array<{
    id: string;
    at: string;
    operator: ReleaseOperator;
    action: ReleaseActionType;
    detail: string;
  }>;
};

const releaseApps: ReleaseApp[] = [
  {
    id: randomUUID(),
    name: "ai-my-home-web",
    repo: "github.com/jiaxiantao/ai-my-home",
    buildCommand: "pnpm build",
    testCommand: "pnpm lint && pnpm test:e2e",
    createdAt: new Date().toISOString(),
  },
];

const releaseOrders: ReleaseOrder[] = [];
const orderLocks = new Set<string>();

function nowIso() {
  return new Date().toISOString();
}

export function listReleaseApps() {
  return [...releaseApps].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createReleaseApp(input: {
  name: string;
  repo: string;
  buildCommand: string;
  testCommand: string;
}) {
  const app: ReleaseApp = {
    id: randomUUID(),
    name: input.name.trim(),
    repo: input.repo.trim(),
    buildCommand: input.buildCommand.trim(),
    testCommand: input.testCommand.trim(),
    createdAt: nowIso(),
  };
  releaseApps.unshift(app);
  return app;
}

export function listReleaseOrders() {
  return [...releaseOrders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createReleaseOrder(input: {
  appId: string;
  version: string;
  branch: string;
}) {
  const app = releaseApps.find((item) => item.id === input.appId);
  if (!app) {
    throw new Error("Application not found");
  }

  const order: ReleaseOrder = {
    id: randomUUID(),
    appId: app.id,
    appName: app.name,
    version: input.version.trim(),
    branch: input.branch.trim(),
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
    environments: {
      test: { status: "pending", deployedAt: null },
      pre: { status: "pending", deployedAt: null },
      prod: { status: "pending", deployedAt: null },
    },
    lock: {
      locked: false,
      by: null,
      reason: null,
      lockedAt: null,
    },
    auditLogs: [],
  };
  appendAuditLog(order, {
    operator: "admin",
    action: "create_order",
    detail: `创建发布单 ${order.version} (${order.branch})`,
  });
  releaseOrders.unshift(order);
  return order;
}

export function updateReleaseChecks(
  orderId: string,
  checks: Partial<ReleaseChecks>,
  operator: ReleaseOperator = "admin",
) {
  return withOrderLock(orderId, operator, "更新质量门禁", (order) => {
    order.checks = { ...order.checks, ...checks };
    appendAuditLog(order, {
      operator,
      action: "set_checks",
      detail: `更新门禁：${JSON.stringify(checks)}`,
    });
    return order;
  });
}

export function runReleaseBuild(
  orderId: string,
  operator: ReleaseOperator = "admin",
) {
  return withOrderLock(orderId, operator, "触发构建", (order) => {
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
    appendAuditLog(order, {
      operator,
      action: "run_build",
      detail: `构建成功，产物 ${order.build.artifact}`,
    });
    return order;
  });
}

export function deployReleaseEnvironment(
  orderId: string,
  environment: ReleaseEnvironment,
  operator: ReleaseOperator = "admin",
) {
  return withOrderLock(orderId, operator, `发布 ${environment}`, (order) => {
    if (order.build.status !== "success") {
      throw new Error("Build must succeed before deployment");
    }

    if (environment === "test") {
      order.environments.test.status = "success";
      order.environments.test.deployedAt = nowIso();
      order.status = "testing";
      appendAuditLog(order, {
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
      appendAuditLog(order, {
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
    order.environments.prod.status = "success";
    order.environments.prod.deployedAt = nowIso();
    order.status = "released";
    appendAuditLog(order, {
      operator,
      action: "deploy_prod",
      detail: "发布到生产环境",
    });
    return order;
  });
}

export function rollbackReleaseProduction(
  orderId: string,
  operator: ReleaseOperator = "admin",
) {
  return withOrderLock(orderId, operator, "生产回滚", (order) => {
    if (order.environments.prod.status !== "success") {
      throw new Error("Production has not been deployed, rollback is unavailable");
    }
    order.environments.prod.status = "failed";
    order.status = "staging";
    order.checks.approved = false;
    appendAuditLog(order, {
      operator,
      action: "rollback_prod",
      detail: "生产环境回滚至预发版本，需重新审批后再发版",
    });
    return order;
  });
}

function getReleaseOrderOrThrow(orderId: string) {
  const order = releaseOrders.find((item) => item.id === orderId);
  if (!order) {
    throw new Error("Release order not found");
  }
  return order;
}

function withOrderLock<T>(
  orderId: string,
  operator: ReleaseOperator,
  reason: string,
  runner: (order: ReleaseOrder) => T,
) {
  const order = getReleaseOrderOrThrow(orderId);
  if (orderLocks.has(orderId)) {
    throw new Error("Another pipeline action is running, please retry later");
  }
  orderLocks.add(orderId);
  order.lock = {
    locked: true,
    by: operator,
    reason,
    lockedAt: nowIso(),
  };
  try {
    return runner(order);
  } finally {
    orderLocks.delete(orderId);
    order.lock = {
      locked: false,
      by: null,
      reason: null,
      lockedAt: null,
    };
  }
}

function appendAuditLog(
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
