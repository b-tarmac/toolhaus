import { NextResponse } from "next/server";
import { getProUser } from "@/lib/pro-auth";
import { db } from "@/lib/db";

export async function GET() {
  const auth = await getProUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const now = new Date();
  const todayStart = Math.floor(
    new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    ).getTime() / 1000
  );
  const resetAt = todayStart + 86400;

  try {
    const result = await db.execute({
      sql: "SELECT COUNT(*) as count FROM api_usage WHERE clerk_id = ? AND created_at >= ?",
      args: [auth.clerkId, todayStart],
    });
    const used = Number(result.rows[0]?.count ?? 0);
    const limit = 1000;
    const remaining = Math.max(0, limit - used);

    return NextResponse.json({
      used,
      remaining,
      limit,
      resetAt: resetAt * 1000,
    });
  } catch (err) {
    console.error("API usage GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch API usage" },
      { status: 500 }
    );
  }
}
