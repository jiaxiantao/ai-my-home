import { NextResponse } from "next/server";
import { z } from "zod";

import { AdminAuthError, assertAdminTokenFromRequest } from "@/lib/admin-auth";
import { createReleaseApp, listReleaseApps } from "@/lib/release-center-store";

const createAppSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  repo: z.string().trim().min(1, "repo is required"),
  buildCommand: z.string().trim().min(1, "buildCommand is required"),
  testCommand: z.string().trim().min(1, "testCommand is required"),
});

export async function GET() {
  return NextResponse.json({ apps: listReleaseApps() });
}

export async function POST(request: Request) {
  try {
    assertAdminTokenFromRequest(request);
    const body = createAppSchema.parse(await request.json());
    const app = createReleaseApp(body);
    return NextResponse.json({ app }, { status: 201 });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid app payload", details: error.flatten() },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Failed to create app" }, { status: 500 });
  }
}
