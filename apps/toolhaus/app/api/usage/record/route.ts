import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { TOOLHAUS_LIMITS } from "@/lib/usage/limits";

export async function POST(req: Request) {
  let body: { toolSlug?: string; sessionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { toolSlug, sessionId } = body;
  if (!toolSlug || typeof toolSlug !== "string") {
    return NextResponse.json(
      { error: "toolSlug required" },
      { status: 400 }
    );
  }

  const limits = TOOLHAUS_LIMITS[toolSlug];
  if (!limits) {
    return NextResponse.json({ ok: true });
  }

  const { userId } = await auth();

  if (!sessionId || typeof sessionId !== "string") {
    return NextResponse.json(
      { error: "sessionId required" },
      { status: 400 }
    );
  }

  try {
    await db.execute({
      sql: `INSERT INTO usage_events (clerk_id, session_id, tool_slug) VALUES (?, ?, ?)`,
      args: [userId ?? null, sessionId, toolSlug],
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Usage record error:", err);
    return NextResponse.json(
      { error: "Failed to record usage" },
      { status: 500 }
    );
  }
}
