import { NextResponse } from "next/server";
import { z } from "zod";

import { AdminAuthError, assertAdminTokenFromRequest } from "@/lib/admin-auth";
import {
  deployReleaseEnvironment,
  rollbackReleaseProduction,
  runReleaseBuild,
  updateReleaseChecks,
} from "@/lib/release-center-store";

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("run_build") }),
  z.object({
    action: z.literal("set_checks"),
    checks: z
      .object({
        unitPassed: z.boolean().optional(),
        e2ePassed: z.boolean().optional(),
        securityPassed: z.boolean().optional(),
        approved: z.boolean().optional(),
      })
      .default({}),
    approval: z
      .object({
        approver: z.string().trim().optional(),
        reason: z.string().trim().optional(),
      })
      .optional(),
  }),
  z.object({
    action: z.literal("deploy"),
    environment: z.enum(["test", "pre", "prod"]),
  }),
  z.object({
    action: z.literal("rollback_prod"),
  }),
]);

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    assertAdminTokenFromRequest(request);
    const payload = actionSchema.parse(await request.json());
    const { id } = await context.params;

    if (payload.action === "run_build") {
      const order = await runReleaseBuild(id, "admin");
      return NextResponse.json({ order });
    }
    if (payload.action === "set_checks") {
      const order = await updateReleaseChecks(
        id,
        payload.checks,
        payload.approval,
        "admin",
      );
      return NextResponse.json({ order });
    }
    if (payload.action === "rollback_prod") {
      const order = await rollbackReleaseProduction(id, "admin");
      return NextResponse.json({ order });
    }
    const order = await deployReleaseEnvironment(id, payload.environment, "admin");
    return NextResponse.json({ order });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid action payload", details: error.flatten() },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Action failed" },
      { status: 400 },
    );
  }
}
