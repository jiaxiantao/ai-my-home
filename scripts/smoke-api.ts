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

const checks: Check[] = [
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
];

async function runCheck(check: Check) {
  const url = `${base.replace(/\/$/, "")}${check.path}`;
  const response = await fetch(url, { cache: "no-store" });
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
