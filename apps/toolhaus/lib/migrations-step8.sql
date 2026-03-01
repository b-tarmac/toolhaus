-- Step 8: Persistent Share Links — run once if share_links doesn't exist
-- turso db shell toolhaus < lib/migrations-step8.sql

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
