import { randomUUID } from "node:crypto";

export type ReleaseEnvironment = "test" | "pre" | "prod";
export type ReleaseStageStatus = "pending" | "running" | "success" | "failed";

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
  };
  releaseOrders.unshift(order);
  return order;
}

export function updateReleaseChecks(
  orderId: string,
  checks: Partial<ReleaseChecks>,
) {
  const order = releaseOrders.find((item) => item.id === orderId);
  if (!order) {
    throw new Error("Release order not found");
  }
  order.checks = { ...order.checks, ...checks };
  return order;
}

export function runReleaseBuild(orderId: string) {
  const order = releaseOrders.find((item) => item.id === orderId);
  if (!order) {
    throw new Error("Release order not found");
  }

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
  return order;
}

export function deployReleaseEnvironment(
  orderId: string,
  environment: ReleaseEnvironment,
) {
  const order = releaseOrders.find((item) => item.id === orderId);
  if (!order) {
    throw new Error("Release order not found");
  }

  if (order.build.status !== "success") {
    throw new Error("Build must succeed before deployment");
  }

  if (environment === "test") {
    order.environments.test.status = "success";
    order.environments.test.deployedAt = nowIso();
    order.status = "testing";
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
    return order;
  }

  if (order.environments.pre.status !== "success") {
    throw new Error("Pre-release environment must be deployed first");
  }
  if (!(order.checks.securityPassed && order.checks.approved)) {
    throw new Error("Security gate and manual approval are required for production");
  }
  order.environments.prod.status = "success";
  order.environments.prod.deployedAt = nowIso();
  order.status = "released";
  return order;
}
