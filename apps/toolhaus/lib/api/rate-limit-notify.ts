import { db } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";
import { sendApiRateLimitHit } from "@/lib/email";

const DEBOUNCE_SECONDS = 86400; // 24 hours

/**
 * Sends API rate limit email to the user, at most once per 24 hours.
 * Call when returning 429 to the API.
 */
export async function maybeSendRateLimitEmail(clerkId: string): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const cutoff = now - DEBOUNCE_SECONDS;

  try {
    const existing = await db.execute({
      sql: "SELECT notified_at FROM api_rate_limit_notifications WHERE clerk_id = ? AND notified_at > ?",
      args: [clerkId, cutoff],
    });

    if (existing.rows.length > 0) return;

    const client = await clerkClient();
    const user = await client.users.getUser(clerkId);
    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) return;

    const firstName = user.firstName || user.username || "there";
    await sendApiRateLimitHit(email, firstName);

    await db.execute({
      sql: `INSERT INTO api_rate_limit_notifications (clerk_id, notified_at) VALUES (?, ?)
            ON CONFLICT(clerk_id) DO UPDATE SET notified_at = excluded.notified_at`,
      args: [clerkId, now],
    });
  } catch (err) {
    console.error("Rate limit email failed:", err);
  }
}
