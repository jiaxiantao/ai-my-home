import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb } from "@/lib/db";

const createProbeSchema = z.object({
  probeKey: z.string().min(1),
  environment: z.string().min(1).max(32).optional(),
  p50Ms: z.number().int().nonnegative().optional(),
  p95Ms: z.number().int().nonnegative().optional(),
  avgSteps: z.number().nonnegative().optional(),
  avgToolCalls: z.number().nonnegative().optional(),
  errorRate: z.number().min(0).max(1).optional(),
  ok: z.boolean().optional(),
  detail: z.string().max(256).optional(),
});

export async function GET(request: Request) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ records: [], persisted: false });
  }
  const repository = (db as unknown as { statusProbeHistory?: typeof db.statusProbeHistory })
    .statusProbeHistory;
  if (!repository) {
    return NextResponse.json({ records: [], persisted: false });
  }

  const { searchParams } = new URL(request.url);
  const probeKey = searchParams.get("probeKey") ?? undefined;
  const environment = searchParams.get("environment") ?? undefined;
  const sinceHoursRaw = Number(searchParams.get("sinceHours") ?? 0);
  const sinceHours = Number.isFinite(sinceHoursRaw)
    ? Math.max(0, Math.min(24 * 30, Math.floor(sinceHoursRaw)))
    : 0;
  const sinceDate =
    sinceHours > 0 ? new Date(Date.now() - sinceHours * 60 * 60 * 1000) : undefined;
  const limitRaw = Number(searchParams.get("limit") ?? 20);
  const take = Number.isFinite(limitRaw)
    ? Math.max(1, Math.min(100, Math.floor(limitRaw)))
    : 20;

  const records = await repository.findMany({
    where: {
      ...(probeKey ? { probeKey } : {}),
      ...(environment ? { environment } : {}),
      ...(sinceDate ? { createdAt: { gte: sinceDate } } : {}),
    },
    orderBy: { createdAt: "asc" },
    take,
  });

  return NextResponse.json({ records, persisted: true });
}

export async function POST(request: Request) {
  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { error: "Database unavailable for status persistence" },
      { status: 503 },
    );
  }
  const repository = (db as unknown as { statusProbeHistory?: typeof db.statusProbeHistory })
    .statusProbeHistory;
  if (!repository) {
    return NextResponse.json(
      { error: "Status probe model unavailable, regenerate Prisma client" },
      { status: 503 },
    );
  }

  try {
    const payload = createProbeSchema.parse(await request.json());
    const created = await repository.create({
      data: {
        probeKey: payload.probeKey,
        environment: payload.environment ?? "local",
        p50Ms: payload.p50Ms,
        p95Ms: payload.p95Ms,
        avgSteps: payload.avgSteps,
        avgToolCalls: payload.avgToolCalls,
        errorRate: payload.errorRate,
        ok: payload.ok ?? true,
        detail: payload.detail,
      },
    });

    return NextResponse.json({ record: created }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid probe payload", details: error.flatten() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to persist probe history" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { error: "Database unavailable for status persistence" },
      { status: 503 },
    );
  }
  const repository = (db as unknown as { statusProbeHistory?: typeof db.statusProbeHistory })
    .statusProbeHistory;
  if (!repository) {
    return NextResponse.json(
      { error: "Status probe model unavailable, regenerate Prisma client" },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const probeKey = searchParams.get("probeKey");
  const environment = searchParams.get("environment");

  if (!probeKey) {
    return NextResponse.json(
      { error: "probeKey is required" },
      { status: 400 },
    );
  }

  await repository.deleteMany({
    where: {
      probeKey,
      ...(environment ? { environment } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}
