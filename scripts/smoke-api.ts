/**
 * API smoke checks — run against a live server:
 *   pnpm dev   # terminal 1
 *   pnpm smoke # terminal 2
 *
 * CI sets SMOKE_BASE_URL after `pnpm start`.
 */

const base = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";

type Check = {
  name: string;
  path: string;
  assert: (status: number, body: unknown) => void;
};

type CheckMethod = "GET" | "POST";

type CheckRequest = {
  method?: CheckMethod;
  body?: unknown;
};

const checks: Array<Check & CheckRequest> = [
  {
    name: "health",
    path: "/api/health",
    assert: (status, body) => {
      if (status !== 200) {
        throw new Error(`expected 200, got ${status}`);
      }

      const data = body as {
        ok?: boolean;
        db?: { connected?: boolean; ok?: boolean };
        release?: { store?: string };
      };

      if (typeof data.ok !== "boolean") {
        throw new Error("missing ok flag");
      }

      if (!data.db?.connected || !data.db?.ok) {
        throw new Error(
          `database unhealthy (connected=${String(data.db?.connected)}, ok=${String(data.db?.ok)})`,
        );
      }

      if (!data.release?.store) {
        throw new Error("missing release.store in health payload");
      }
    },
  },
  {
    name: "profile",
    path: "/api/profile",
    assert: (status, body) => {
      if (status !== 200) {
        throw new Error(`expected 200, got ${status}`);
      }

      const data = body as { profile?: { name?: string } };

      if (!data.profile?.name) {
        throw new Error("missing profile.name");
      }
    },
  },
  {
    name: "dashboard",
    path: "/api/dashboard",
    assert: (status, body) => {
      if (status !== 200) {
        throw new Error(`expected 200, got ${status}`);
      }

      const data = body as {
        overview?: { domainsCount?: number };
        capabilityProfile?: { fullstackApi?: number };
        knowledge?: { externalUrl?: string };
        release?: {
          orderCount?: number;
          byStatus?: Record<string, number>;
          recentOrders?: unknown[];
        };
        intelligence?: {
          samplePrompts?: unknown[];
          llmLabel?: string;
        };
      };

      if (typeof data.overview?.domainsCount !== "number") {
        throw new Error("missing overview.domainsCount");
      }

      if (typeof data.capabilityProfile?.fullstackApi !== "number") {
        throw new Error("missing capabilityProfile.fullstackApi");
      }

      if (!data.knowledge?.externalUrl) {
        throw new Error("missing knowledge.externalUrl");
      }

      if (typeof data.release?.orderCount !== "number") {
        throw new Error("missing release.orderCount");
      }

      if (!Array.isArray(data.release?.recentOrders)) {
        throw new Error("missing release.recentOrders array");
      }

      if (!Array.isArray(data.intelligence?.samplePrompts)) {
        throw new Error("missing intelligence.samplePrompts");
      }
    },
  },
  {
    name: "intelligence-analyze",
    path: "/api/intelligence/analyze",
    method: "POST",
    body: {
      input: "首页性能慢，请给优化步骤和 p95 目标",
    },
    assert: (status, body) => {
      if (status !== 200) {
        throw new Error(`expected 200, got ${status}`);
      }

      const data = body as {
        intelligence?: { intents?: Array<{ label: string }> };
        engine?: string;
      };

      if (!data.engine?.includes("front-intelligence")) {
        throw new Error("missing front-intelligence engine marker");
      }

      if (!data.intelligence?.intents?.length) {
        throw new Error("missing intelligence.intents");
      }
    },
  },
  {
    name: "intelligence-analyze",
    path: "/api/release/apps",
    assert: (status, body) => {
      if (status !== 200) {
        throw new Error(`expected 200, got ${status}`);
      }

      const data = body as { apps?: unknown[] };
      if (!Array.isArray(data.apps)) {
        throw new Error("missing apps array");
      }
    },
  },
  {
    name: "release-orders",
    path: "/api/release/orders",
    assert: (status, body) => {
      if (status !== 200) {
        throw new Error(`expected 200, got ${status}`);
      }

      const data = body as { orders?: unknown[] };
      if (!Array.isArray(data.orders)) {
        throw new Error("missing orders array");
      }
    },
  },
];

async function runCheck(check: Check) {
  const url = `${base.replace(/\/$/, "")}${check.path}`;
  const method = (check as Check & CheckRequest).method ?? "GET";
  const response = await fetch(url, {
    method,
    headers:
      method === "POST" ? { "Content-Type": "application/json" } : undefined,
    body:
      method === "POST"
        ? JSON.stringify((check as Check & CheckRequest).body ?? {})
        : undefined,
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("text/event-stream")) {
    const text = await response.text();

    if (!text.includes("event:")) {
      throw new Error(`${check.name}: empty SSE body`);
    }

    try {
      check.assert(response.status, { stream: true, text });
    } catch (error) {
      const detail = text.slice(0, 400);
      throw new Error(
        `${error instanceof Error ? error.message : error} · ${check.name} HTTP ${response.status} · ${detail}`,
      );
    }

    console.log(`✓ ${check.name} ${check.path} (SSE)`);
    return;
  }

  const text = await response.text();
  let body: unknown = null;

  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`${check.name}: invalid JSON (${response.status})`);
  }

  try {
    check.assert(response.status, body);
  } catch (error) {
    const detail =
      typeof body === "object" && body !== null
        ? JSON.stringify(body).slice(0, 400)
        : String(body).slice(0, 200);
    throw new Error(
      `${error instanceof Error ? error.message : error} · ${check.name} HTTP ${response.status} · ${detail}`,
    );
  }

  console.log(`✓ ${check.name} ${check.path}`);
}

async function main() {
  console.log(`Smoke base: ${base}`);

  for (const check of checks) {
    await runCheck(check);
  }

  console.log(`\n${checks.length} checks passed`);
}

main().catch((error) => {
  console.error("\nSmoke failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
