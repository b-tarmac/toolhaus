import type { Client as DbClient } from "@libsql/client";
import type { ToolLimits } from "@portfolio/tool-sdk";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UsageTier = "anonymous" | "free" | "pro";

export interface UsageCheckResult {
  allowed: boolean;
  used: number;
  limit: number | null;
  remaining: number | null;
  /** True when the user has ≤1 use left — triggers a soft upgrade prompt */
  shouldPrompt: boolean;
  tier: UsageTier;
}

// ─── Core check / record functions ───────────────────────────────────────────

/**
 * Checks whether a user is allowed to run a tool given their tier and
 * today's usage count. Reads from the `usage_events` table.
 *
 * Pass `isPro: true` to short-circuit the DB query for Pro users.
 */
export async function checkUsage(params: {
  db: DbClient;
  toolSlug: string;
  limits: ToolLimits;
  userId: string | null;
  sessionId: string;
  isPro?: boolean;
  limitPeriod?: "day" | "month";
}): Promise<UsageCheckResult> {
  const { db, toolSlug, limits, userId, sessionId, isPro = false, limitPeriod = "day" } = params;

  if (isPro || limits.pro !== null) {
    // Pro users (or tools that cap Pro too) — check pro limit
    const limit = limits.pro;
    if (limit === null) {
      return { allowed: true, used: 0, limit: null, remaining: null, shouldPrompt: false, tier: "pro" };
    }
  }

  if (isPro) {
    return { allowed: true, used: 0, limit: null, remaining: null, shouldPrompt: false, tier: "pro" };
  }

  const tier: UsageTier = userId ? "free" : "anonymous";
  const limit = limits[tier];

  if (limit === null) {
    return { allowed: true, used: 0, limit: null, remaining: null, shouldPrompt: false, tier };
  }

  const periodStart = getPeriodStart(limitPeriod);
  const identifier = userId ?? sessionId;

  const result = await db.execute({
    sql: `SELECT COUNT(*) as count FROM usage_events
          WHERE tool_slug = ?
          AND (clerk_id = ? OR session_id = ?)
          AND created_at >= ?`,
    args: [toolSlug, identifier, identifier, periodStart],
  });

  const used = Number(result.rows[0]?.count ?? 0);
  const remaining = Math.max(0, limit - used);
  const allowed = used < limit;

  return {
    allowed,
    used,
    limit,
    remaining,
    shouldPrompt: remaining <= 1,
    tier,
  };
}

/**
 * Records a tool usage event. Call this after a successful tool run.
 */
export async function recordUsage(params: {
  db: DbClient;
  toolSlug: string;
  userId: string | null;
  sessionId: string;
}): Promise<void> {
  const { db, toolSlug, userId, sessionId } = params;
  await db.execute({
    sql: `INSERT INTO usage_events (id, clerk_id, session_id, tool_slug, created_at)
          VALUES (lower(hex(randomblob(8))), ?, ?, ?, unixepoch())`,
    args: [userId ?? null, sessionId, toolSlug],
  });
}

// ─── EasyBiscuit limits config ────────────────────────────────────────────────

export const EASYBISCUIT_LIMITS: Record<string, ToolLimits> = {
  // Business tools
  "invoice-generator":          { anonymous: 2,    free: 5,    pro: null },
  "invoice-parser":             { anonymous: 2,    free: 3,    pro: null },
  "receipt-scanner":            { anonymous: 2,    free: 5,    pro: null },
  "quote-generator":            { anonymous: 2,    free: 5,    pro: null },
  "esign-pdf":                  { anonymous: 1,    free: 3,    pro: null },

  // QR code & email signature — fully free (lead gen / SEO tools)
  "qr-code-generator":          { anonymous: null, free: null, pro: null },
  "email-signature-generator":  { anonymous: null, free: null, pro: null },

  // Calculators — all fully free
  "vat-calculator":             { anonymous: null, free: null, pro: null },
  "profit-margin-calculator":   { anonymous: null, free: null, pro: null },
  "markup-calculator":          { anonymous: null, free: null, pro: null },
  "discount-calculator":        { anonymous: null, free: null, pro: null },
  "break-even-calculator":      { anonymous: null, free: null, pro: null },
  "hourly-rate-calculator":     { anonymous: null, free: null, pro: null },
  "currency-converter":         { anonymous: null, free: null, pro: null },
  "late-payment-calculator":    { anonymous: null, free: null, pro: null },

  // PDF tools
  "pdf-merger":                 { anonymous: 2,    free: 5,    pro: null },
  "pdf-splitter":               { anonymous: 2,    free: 5,    pro: null },
  "pdf-compressor":             { anonymous: 2,    free: 5,    pro: null },
  "image-to-pdf":               { anonymous: 2,    free: 5,    pro: null },
  "pdf-to-images":              { anonymous: 2,    free: 5,    pro: null },
  "pdf-form-filler":            { anonymous: 1,    free: 3,    pro: null },

  // Image tools
  "heic-to-jpg":                { anonymous: 3,    free: 10,   pro: null },
  "image-compressor":           { anonymous: 3,    free: 10,   pro: null },
  "image-resizer":              { anonymous: 3,    free: 10,   pro: null },
  "social-media-resizer":       { anonymous: 3,    free: 10,   pro: null },
  "watermark-tool":             { anonymous: 2,    free: 5,    pro: null },
  "favicon-generator":          { anonymous: null, free: null, pro: null },
  "color-palette-extractor":    { anonymous: null, free: null, pro: null },
  "webp-converter":             { anonymous: 3,    free: 10,   pro: null },

  // Writing — fully free
  "word-counter":               { anonymous: null, free: null, pro: null },
  "readability-checker":        { anonymous: null, free: null, pro: null },
  "text-cleaner":               { anonymous: null, free: null, pro: null },
  "case-converter":             { anonymous: null, free: null, pro: null },
};

/**
 * Toolhaus currently has no per-tool usage limits (all tools are free or Pro-gated
 * by subscription, not by daily count). This config is here for future use.
 */
export const TOOLHAUS_LIMITS: Record<string, ToolLimits> = {};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPeriodStart(period: "day" | "month"): number {
  const now = new Date();
  if (period === "month") {
    return Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000);
  }
  return Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000);
}
