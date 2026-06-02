export type ReleaseEnvironment = "test" | "pre" | "prod";
export type ReleaseStageStatus = "pending" | "running" | "success" | "failed";
export type ReleaseOperator = "system" | "admin";
export type ReleaseOrderStatus = "draft" | "built" | "testing" | "staging" | "released";
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
  changeTicket: string;
  createdAt: string;
  status: ReleaseOrderStatus;
  build: {
    status: ReleaseStageStatus;
    durationMs: number | null;
    artifact: string | null;
    logs: string[];
  };
  checks: ReleaseChecks;
  approval: {
    approver: string | null;
    reason: string | null;
    approvedAt: string | null;
  };
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
