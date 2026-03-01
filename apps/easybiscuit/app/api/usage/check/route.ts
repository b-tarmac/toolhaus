import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkUsage, EASYBISCUIT_LIMITS } from "@portfolio/usage";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { userId } = await auth();

  let body: { toolSlug: string; sessionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { toolSlug, sessionId: sessionIdFromBody } = body;
  if (!toolSlug) {
    return NextResponse.json(
      { error: "toolSlug required" },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  let sessionId = sessionIdFromBody;
  if (!sessionId) {
    sessionId = cookieStore.get("eb_session_id")?.value;
    if (!sessionId) {
      sessionId = `anon_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      cookieStore.set("eb_session_id", sessionId, {
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
        httpOnly: true,
        sameSite: "lax",
      });
    }
  }

  const limits = EASYBISCUIT_LIMITS[toolSlug];
  if (!limits) {
    return NextResponse.json({
      allowed: true,
      used: 0,
      limit: null,
      remaining: null,
      shouldPrompt: false,
      tier: userId ? "free" : "anonymous",
    });
  }

  const result = await checkUsage({
    db,
    toolSlug,
    limits,
    userId: userId ?? null,
    sessionId,
    isPro: (await checkProStatus(userId)) ?? false,
    limitPeriod: "day",
  });

  return NextResponse.json(result);
}

async function checkProStatus(clerkId: string | null): Promise<boolean> {
  if (!clerkId) return false;
  try {
    const result = await db.execute({
      sql: "SELECT plan FROM users WHERE clerk_id = ?",
      args: [clerkId],
    });
    return (result.rows[0]?.plan as string) === "pro";
  } catch {
    return false;
  }
}
