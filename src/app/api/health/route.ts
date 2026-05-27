import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";

export async function GET() {
  const started = performance.now();
  let dbOk = false;
  let dbMs = 0;

  const db = getDb();

  if (db) {
    const dbStarted = performance.now();

    try {
      await db.$queryRaw`SELECT 1`;
      dbOk = true;
      dbMs = Math.round(performance.now() - dbStarted);
    } catch {
      dbOk = false;
    }
  }

  const totalMs = Math.round(performance.now() - started);

  return NextResponse.json({
    ok: true,
    db: { connected: Boolean(db), ok: dbOk, latencyMs: dbMs },
    server: {
      node: process.version,
      totalMs,
    },
    timestamp: new Date().toISOString(),
  });
}
