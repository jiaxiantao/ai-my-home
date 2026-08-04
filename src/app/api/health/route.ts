import { NextResponse } from "next/server";

import { getReadyDb, isDbMarkedUnavailable, probeDbConnection } from "@/lib/db";
import { getLlmLabel, isLlmConfigured } from "@/lib/llm-config";
import { probeReleaseStoreMode } from "@/lib/release-service";

export async function GET() {
  const started = performance.now();
  let dbOk = false;
  let dbMs = 0;

  const dbStarted = performance.now();
  dbOk = await probeDbConnection(true);
  dbMs = Math.round(performance.now() - dbStarted);
  const db = dbOk ? await getReadyDb() : null;

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
    release: { store: releaseStore },
    knowledgeStudio: {
      url: "https://jiaxiantao.xyz/knowledge-studio/",
      note: "Notes retrieval moved to Knowledge Studio",
    },
    server: {
      node: process.version,
      totalMs,
    },
    timestamp: new Date().toISOString(),
  });
}
