import { db } from "@/lib/db";
import { createHash } from "crypto";

export interface VerifyApiKeyResult {
  valid: boolean;
  clerkId?: string;
  error?: string;
}

/**
 * Verifies API key from Authorization: Bearer <key> header.
 * Looks up by key_prefix first for efficiency, then verifies full hash.
 */
export async function verifyApiKey(req: Request): Promise<VerifyApiKeyResult> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { valid: false, error: "Missing or invalid Authorization header" };
  }

  const key = authHeader.slice(7).trim();
  if (!key) {
    return { valid: false, error: "Empty API key" };
  }

  // New format: th_live_<32hex> — prefix is first 12 chars for lookup
  const prefix = key.length >= 12 ? key.substring(0, 12) : key;
  const keyHash = createHash("sha256").update(key).digest("hex");

  const result = await db.execute({
    sql: `SELECT ak.id, ak.clerk_id, ak.key_hash
          FROM api_keys ak
          JOIN users u ON u.clerk_id = ak.clerk_id
          WHERE ak.key_prefix = ? AND u.plan = 'pro'`,
    args: [prefix],
  });

  for (const row of result.rows) {
    const storedHash = row.key_hash as string;
    if (storedHash === keyHash) {
      // Update last_used
      await db.execute({
        sql: "UPDATE api_keys SET last_used = unixepoch() WHERE id = ?",
        args: [row.id],
      });
      return { valid: true, clerkId: row.clerk_id as string };
    }
  }

  // Fallback: try direct hash lookup (for keys with empty prefix / legacy)
  const hashResult = await db.execute({
    sql: `SELECT ak.clerk_id FROM api_keys ak
          JOIN users u ON u.clerk_id = ak.clerk_id
          WHERE ak.key_hash = ? AND u.plan = 'pro'`,
    args: [keyHash],
  });
  if (hashResult.rows.length > 0) {
    const row = hashResult.rows[0];
    return { valid: true, clerkId: row.clerk_id as string };
  }

  return { valid: false, error: "Invalid API key" };
}
