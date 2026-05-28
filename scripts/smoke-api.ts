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
      };

      if (typeof data.ok !== "boolean") {
        throw new Error("missing ok flag");
      }

      if (!data.db?.connected || !data.db?.ok) {
        throw new Error(
          `database unhealthy (connected=${String(data.db?.connected)}, ok=${String(data.db?.ok)})`,
        );
      }
    },
  },
  {
    name: "chat",
    path: "/api/chat",
    method: "POST",
    body: { question: "smoke: hello", stream: false },
    assert: (status, body) => {
      if (status !== 200) {
        throw new Error(`expected 200, got ${status}`);
      }

      const data = body as { answer?: string; references?: unknown[] };

      if (!data.answer || typeof data.answer !== "string") {
        throw new Error("missing answer");
      }

      if (!Array.isArray(data.references)) {
        throw new Error("missing references array");
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

      const data = body as { overview?: { notesCount?: number } };

      if (typeof data.overview?.notesCount !== "number") {
        throw new Error("missing overview.notesCount");
      }
    },
  },
  {
    name: "notes-search",
    path: `/api/notes/search?q=${encodeURIComponent("架构")}&limit=3`,
    assert: (status, body) => {
      if (status !== 200) {
        throw new Error(`expected 200, got ${status}`);
      }

      const data = body as { results?: unknown[]; engine?: string };

      if (!Array.isArray(data.results)) {
        throw new Error("missing results array");
      }

      if (!data.engine) {
        throw new Error("missing engine");
      }
    },
  },
  {
    name: "agent",
    path: "/api/agent",
    method: "POST",
    body: { message: "smoke: what time is it" },
    assert: (status, body) => {
      if (status !== 200) {
        throw new Error(`expected 200, got ${status}`);
      }

      const data = body as { stream?: boolean; text?: string };
      if (!data.stream) {
        throw new Error("agent response should be SSE stream");
      }
      if (!data.text?.includes("event: done")) {
        throw new Error("agent stream missing done event");
      }
      if (!data.text?.includes("event: step_metric")) {
        throw new Error("agent stream missing step_metric event");
      }
    },
  },
  {
    name: "analytics",
    path: "/api/analytics/notes",
    assert: (status, body) => {
      if (status !== 200) {
        throw new Error(`expected 200, got ${status}`);
      }

      const data = body as { stats?: { totalNotes?: number } };

      if (typeof data.stats?.totalNotes !== "number") {
        throw new Error("missing stats.totalNotes");
      }
    },
  },
  {
    name: "status-probes",
    path: "/api/status/probes?probeKey=agent-sse&limit=5",
    assert: (status, body) => {
      if (status !== 200) {
        throw new Error(`expected 200, got ${status}`);
      }

      const data = body as { records?: unknown[] };
      if (!Array.isArray(data.records)) {
        throw new Error("missing records array");
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
