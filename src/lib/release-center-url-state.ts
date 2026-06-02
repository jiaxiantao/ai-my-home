import type { ReleaseOrderStatus } from "@/lib/release-center-types";

export type ReleaseStatusFilter = ReleaseOrderStatus | "all";

export type ReleaseCenterUrlState = {
  status: ReleaseStatusFilter;
  app: string;
  q: string;
};

const validStatuses = new Set<ReleaseOrderStatus>([
  "draft",
  "built",
  "testing",
  "staging",
  "released",
]);

export function parseReleaseCenterState(
  searchParams: Pick<URLSearchParams, "get">,
): ReleaseCenterUrlState {
  const rawStatus = searchParams.get("status");
  const status =
    rawStatus === "all" || !rawStatus
      ? "all"
      : validStatuses.has(rawStatus as ReleaseOrderStatus)
        ? (rawStatus as ReleaseOrderStatus)
        : "all";

  return {
    status,
    app: searchParams.get("app")?.trim() || "all",
    q: searchParams.get("q")?.trim() || "",
  };
}

export function buildReleaseCenterQuery(state: ReleaseCenterUrlState) {
  const params = new URLSearchParams();

  if (state.status !== "all") {
    params.set("status", state.status);
  }
  if (state.app !== "all") {
    params.set("app", state.app);
  }
  if (state.q) {
    params.set("q", state.q);
  }

  return params.toString();
}

export function buildReleaseCenterShareUrl(state: ReleaseCenterUrlState) {
  const query = buildReleaseCenterQuery(state);
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return query
    ? `${origin}/release-center?${query}`
    : `${origin}/release-center`;
}
