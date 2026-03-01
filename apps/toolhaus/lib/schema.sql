-- Turso schema for Toolhaus Pro
-- Run with: turso db shell toolhaus < lib/schema.sql

CREATE TABLE IF NOT EXISTS users (
  clerk_id           TEXT PRIMARY KEY,
  plan               TEXT NOT NULL DEFAULT 'free',
  plan_expires_at    INTEGER,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at         INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at         INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS tool_history (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  clerk_id      TEXT NOT NULL,
  tool_slug     TEXT NOT NULL,
  input         TEXT NOT NULL,
  input_summary  TEXT,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_history_clerk_created ON tool_history(clerk_id, created_at DESC);

CREATE TABLE IF NOT EXISTS saved_snippets (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  clerk_id   TEXT NOT NULL,
  tool_slug  TEXT NOT NULL,
  name       TEXT NOT NULL,
  input      TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_snippets_clerk ON saved_snippets(clerk_id);

CREATE TABLE IF NOT EXISTS api_keys (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  clerk_id   TEXT NOT NULL,
  key_hash   TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL DEFAULT '',
  name       TEXT NOT NULL DEFAULT 'Default',
  last_used  INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);

-- Migrations for existing databases (run once if tables already exist):
-- turso db shell toolhaus < lib/migrations-step2.sql
-- turso db shell toolhaus < lib/migrations-step7.sql
-- turso db shell toolhaus < lib/migrations-step8.sql
-- turso db shell toolhaus < lib/migrations-step10.sql

-- Usage tracking (Step 2)
CREATE TABLE IF NOT EXISTS usage_events (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  clerk_id   TEXT,
  session_id TEXT NOT NULL,
  tool_slug  TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_usage_lookup
  ON usage_events(tool_slug, clerk_id, session_id, created_at);

-- Saved workspaces (Step 5)
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

-- API usage (Step 7 — Pro REST API)
CREATE TABLE IF NOT EXISTS api_usage (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  clerk_id   TEXT NOT NULL,
  tool_slug  TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_api_usage_daily ON api_usage(clerk_id, created_at);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);

-- Persistent share links (Step 8)
CREATE TABLE IF NOT EXISTS share_links (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  clerk_id   TEXT NOT NULL,
  tool_slug  TEXT NOT NULL,
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  state_json TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_share_links_slug ON share_links(slug);
CREATE INDEX IF NOT EXISTS idx_share_links_clerk ON share_links(clerk_id, tool_slug);

-- API rate limit email notifications (Step 10)
CREATE TABLE IF NOT EXISTS api_rate_limit_notifications (
  clerk_id     TEXT PRIMARY KEY,
  notified_at  INTEGER NOT NULL DEFAULT (unixepoch())
);
