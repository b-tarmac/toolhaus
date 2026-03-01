-- Turso schema for Toolhaus Pro
-- Run with: turso db shell toolhaus < lib/schema.sql

CREATE TABLE IF NOT EXISTS users (
  clerk_id           TEXT PRIMARY KEY,
  plan               TEXT NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at         INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at         INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS tool_history (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  clerk_id   TEXT NOT NULL,
  tool_slug  TEXT NOT NULL,
  input      TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
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
  name       TEXT NOT NULL DEFAULT 'Default',
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
