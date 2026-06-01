import { NextResponse } from "next/server";
import { z } from "zod";

import { AdminAuthError, assertAdminTokenFromRequest } from "@/lib/admin-auth";
import { createReleaseOrder, listReleaseOrders } from "@/lib/release-center-store";

const createOrderSchema = z.object({
  appId: z.string().trim().min(1, "appId is required"),
  version: z.string().trim().min(1, "version is required"),
  branch: z.string().trim().min(1, "branch is required"),
  changeTicket: z.string().trim().min(1, "changeTicket is required"),
});

export async function GET() {
  return NextResponse.json({ orders: listReleaseOrders() });
}

export async function POST(request: Request) {
  try {
    assertAdminTokenFromRequest(request);
    const body = createOrderSchema.parse(await request.json());
    const order = createReleaseOrder(body);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid release payload", details: error.flatten() },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create release order" },
      { status: 500 },
    );
  }
}
