import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { createHash, randomBytes } from "crypto";

export type ProAuthResult =
  | { ok: true; clerkId: string }
  | { ok: false; status: number; error: string };

export async function getProUser(): Promise<ProAuthResult> {
  const { userId } = await auth();
  if (userId) {
    const isPro = await checkProStatus(userId);
    if (isPro) return { ok: true, clerkId: userId };
    return { ok: false, status: 403, error: "Pro subscription required" };
  }
  return { ok: false, status: 401, error: "Unauthorized" };
}

export async function getProUserFromRequest(
  req: Request
): Promise<ProAuthResult> {
  const { userId } = await auth();
  if (userId) {
    const isPro = await checkProStatus(userId);
    if (isPro) return { ok: true, clerkId: userId };
    return { ok: false, status: 403, error: "Pro subscription required" };
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const { verifyApiKey } = await import("@/lib/api/auth");
    const auth = await verifyApiKey(req);
    if (auth.valid && auth.clerkId) {
      return { ok: true, clerkId: auth.clerkId };
    }
  }

  return { ok: false, status: 401, error: "Unauthorized" };
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

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function generateApiKey(): string {
  return `th_live_${randomBytes(16).toString("hex")}`;
}
