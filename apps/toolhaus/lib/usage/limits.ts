/**
 * Compute-heavy tools with daily usage limits for anonymous users.
 * Free and Pro have unlimited use (null).
 * Tools not in this map are unlimited for all tiers.
 */
export const TOOLHAUS_LIMITS: Record<
  string,
  { anonymous: number | null; free: number | null; pro: number | null }
> = {
  "llm-token-counter": { anonymous: 5, free: null, pro: null },
  "hash-generator": { anonymous: 5, free: null, pro: null },
  "uuid-generator": { anonymous: 5, free: null, pro: null },
  "cron-builder": { anonymous: 5, free: null, pro: null },
};
