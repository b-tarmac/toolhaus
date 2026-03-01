import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export type UserTier = "anonymous" | "free" | "pro";

/**
 * Server-side: get the current user's tier from DB.
 * Use in API routes and server components.
 */
export async function getUserTier(): Promise<UserTier> {
  const { userId } = await auth();

  if (!userId) return "anonymous";

  try {
    const result = await db.execute({
      sql: "SELECT plan, plan_expires_at FROM users WHERE clerk_id = ?",
      args: [userId],
    });

    const row = result.rows[0];
    if (!row) return "free"; // Signed in but not in DB yet

    const plan = row.plan as string;
    const planExpiresAt = row.plan_expires_at as number | null;

    if (plan !== "pro") return "free";
    if (planExpiresAt && Date.now() / 1000 > Number(planExpiresAt))
      return "free";

    return "pro";
  } catch {
    return "free";
  }
}
