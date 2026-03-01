import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getUserTier } from "@/lib/auth/tier";
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
    return NextResponse.json({ allowed: true, remaining: null });
  }

  const { userId } = await auth();

  if (userId) {
    const tier = await getUserTier();
    if (tier === "pro") {
      return NextResponse.json({ allowed: true, remaining: null });
    }
  }

  const tier = userId ? "free" : "anonymous";
  const limit = limits[tier];
  if (limit === null) {
    return NextResponse.json({ allowed: true, remaining: null });
  }

  const todayStart = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
  const identifier = userId ?? sessionId;
  if (!identifier) {
    return NextResponse.json(
      { error: "sessionId required for anonymous users" },
      { status: 400 }
    );
  }

  try {
    const result = await db.execute({
      sql: `
        SELECT COUNT(*) as count FROM usage_events
        WHERE tool_slug = ?
        AND (clerk_id = ? OR session_id = ?)
        AND created_at >= ?
      `,
      args: [toolSlug, identifier, identifier, todayStart],
    });

    const used = Number(result.rows[0]?.count ?? 0);
    const remaining = Math.max(0, limit - used);
    const allowed = used < limit;

    return NextResponse.json({
      allowed,
      used,
      limit,
      remaining,
      tier,
    });
  } catch (err) {
    console.error("Usage check error:", err);
    return NextResponse.json(
      { error: "Failed to check usage" },
      { status: 500 }
    );
  }
}
