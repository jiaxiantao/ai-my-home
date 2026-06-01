import { NextResponse } from "next/server";
import { z } from "zod";

import { analyzeComposer } from "@/lib/front-intelligence";
import { defaultIntelligencePreferences } from "@/lib/front-intelligence-preferences";
import type { ChatMessage } from "@/lib/chat-types";

const requestSchema = z.object({
  input: z.string().max(4000),
  preferences: z
    .object({
      style: z.enum(["steps", "risk", "code"]),
      depth: z.enum(["brief", "detailed"]),
      includeMetrics: z.boolean(),
    })
    .optional(),
  messages: z
    .array(
      z.object({
        id: z.string(),
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .max(40)
    .optional(),
});

export async function POST(request: Request) {
  try {
    const payload = requestSchema.parse(await request.json());
    const messages = (payload.messages ?? []) as ChatMessage[];
    const preferences = payload.preferences ?? defaultIntelligencePreferences;

    return NextResponse.json({
      intelligence: analyzeComposer(payload.input, messages, preferences),
      engine: "front-intelligence-rules-v1",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid analyze payload", details: error.flatten() },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Analyze failed" }, { status: 500 });
  }
}
