-- Step 7: Pro REST API — run once if api_usage doesn't exist
-- turso db shell toolhaus < lib/migrations-step7.sql

CREATE TABLE IF NOT EXISTS api_usage (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  clerk_id   TEXT NOT NULL,
  tool_slug  TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_api_usage_daily ON api_usage(clerk_id, created_at);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);
