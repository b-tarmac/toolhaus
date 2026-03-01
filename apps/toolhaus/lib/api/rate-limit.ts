import { db } from "@/lib/db";

const DAILY_LIMIT = 1000;

export interface RateLimitResult {
  allowed: boolean;
  used: number;
  remaining: number;
  limit: number;
  resetAt: number;
}

/**
 * Checks API usage for the given clerk_id. Resets at midnight UTC.
 */
export async function checkApiRateLimit(clerkId: string): Promise<RateLimitResult> {
  const now = new Date();
  const todayStart = Math.floor(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).getTime() / 1000
  );
  const resetAt = todayStart + 86400; // midnight UTC next day

  const result = await db.execute({
    sql: "SELECT COUNT(*) as count FROM api_usage WHERE clerk_id = ? AND created_at >= ?",
    args: [clerkId, todayStart],
  });

  const used = Number(result.rows[0]?.count ?? 0);
  const remaining = Math.max(0, DAILY_LIMIT - used - 1); // -1 for this request
  return {
    allowed: used < DAILY_LIMIT,
    used,
    remaining,
    limit: DAILY_LIMIT,
    resetAt,
  };
}

/**
 * Records an API usage event.
 */
export async function recordApiUsage(clerkId: string, toolSlug: string): Promise<void> {
  await db.execute({
    sql: "INSERT INTO api_usage (clerk_id, tool_slug) VALUES (?, ?)",
    args: [clerkId, toolSlug],
  });
}
