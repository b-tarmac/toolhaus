import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export type ProAuthResult =
  | { ok: true; clerkId: string }
  | { ok: false; status: number; error: string };

export async function getProUser(): Promise<ProAuthResult> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }
  const isPro = await checkProStatus(userId);
  if (isPro) return { ok: true, clerkId: userId };
  return { ok: false, status: 403, error: "Pro subscription required" };
}

async function checkProStatus(clerkId: string): Promise<boolean> {
  try {
    const result = await db.execute({
      sql: "SELECT plan FROM users WHERE clerk_id = ?",
      args: [clerkId],
    });
    if (result.rows.length > 0 && (result.rows[0].plan as string) === "pro") {
      return true;
    }
    const clerk = await (await clerkClient()).users.getUser(clerkId);
    return (clerk.publicMetadata?.plan as string) === "pro";
  } catch {
    return false;
  }
}
