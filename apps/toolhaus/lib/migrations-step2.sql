-- Step 2 migrations for existing Toolhaus database
-- Run with: turso db shell toolhaus < lib/migrations-step2.sql
-- Safe to run multiple times: each ALTER will fail if column exists (ignore errors)

ALTER TABLE users ADD COLUMN plan_expires_at INTEGER;
ALTER TABLE api_keys ADD COLUMN key_prefix TEXT NOT NULL DEFAULT '';
ALTER TABLE api_keys ADD COLUMN last_used INTEGER;
ALTER TABLE tool_history ADD COLUMN input_summary TEXT;

CREATE TABLE IF NOT EXISTS usage_events (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  clerk_id   TEXT,
  session_id TEXT NOT NULL,
  tool_slug  TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_usage_lookup
  ON usage_events(tool_slug, clerk_id, session_id, created_at);

-- Step 5: workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  clerk_id   TEXT NOT NULL,
  tool_slug  TEXT NOT NULL,
  name       TEXT NOT NULL,
  state_json TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_workspaces_user ON workspaces(clerk_id, tool_slug);
