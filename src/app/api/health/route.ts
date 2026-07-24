import { NextResponse } from "next/server";

import { getReadyDb, isDbMarkedUnavailable, probeDbConnection } from "@/lib/db";
import { getLlmLabel, isLlmConfigured } from "@/lib/llm-config";
import { isPgTrgmEnabled } from "@/lib/pg-trgm";
import { probeReleaseStoreMode } from "@/lib/release-service";

export async function GET() {
  const started = performance.now();
  let dbOk = false;
  let dbMs = 0;
  let pgTrgm = false;

  const dbStarted = performance.now();
  dbOk = await probeDbConnection(true);
  dbMs = Math.round(performance.now() - dbStarted);
  const db = dbOk ? await getReadyDb() : null;

  if (db) {
    pgTrgm = await isPgTrgmEnabled();
  }

  const llmConfigured = isLlmConfigured();
  let llmLabel = "unconfigured";

  try {
    llmLabel = getLlmLabel();
  } catch {
    llmLabel = "misconfigured";
  }

  const totalMs = Math.round(performance.now() - started);
  const releaseStore = await probeReleaseStoreMode();
  const ready = dbOk && llmConfigured;
  // CI / 探活：ok 表示 DB 可用即可启动 smoke；ready 表示全栈（含 LLM 配置）
  const ok = dbOk;

  return NextResponse.json({
    ok,
    ready,
    db: {
      connected: Boolean(db) && !isDbMarkedUnavailable(),
      ok: dbOk,
      latencyMs: dbMs,
    },
    llm: { configured: llmConfigured, label: llmLabel },
    search: { pgTrgm },
    release: { store: releaseStore },
    server: {
      node: process.version,
      totalMs,
    },
    timestamp: new Date().toISOString(),
  });
}
