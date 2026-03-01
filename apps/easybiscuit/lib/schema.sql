-- EasyBiscuit Turso schema
-- Run with: turso db shell easybiscuit < lib/schema.sql

-- Base schema (shared with Toolhaus pattern)
CREATE TABLE IF NOT EXISTS users (
  clerk_id               TEXT    PRIMARY KEY,
  plan                   TEXT    NOT NULL DEFAULT 'free',
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  plan_expires_at        INTEGER,
  created_at             INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at             INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS usage_events (
  id         TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  clerk_id   TEXT,
  session_id TEXT    NOT NULL,
  tool_slug  TEXT    NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_usage_events_lookup
  ON usage_events(tool_slug, clerk_id, session_id, created_at);

CREATE TABLE IF NOT EXISTS tool_history (
  id            TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  clerk_id      TEXT    NOT NULL REFERENCES users(clerk_id),
  tool_slug     TEXT    NOT NULL,
  label         TEXT,
  input_summary  TEXT,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

-- EasyBiscuit-specific tables
CREATE TABLE IF NOT EXISTS saved_clients (
  id            TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  clerk_id      TEXT    NOT NULL REFERENCES users(clerk_id),
  name          TEXT    NOT NULL,
  email         TEXT,
  address       TEXT,
  tax_id        TEXT,
  payment_terms TEXT    NOT NULL DEFAULT 'Net 30',
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS business_profile (
  clerk_id           TEXT    PRIMARY KEY REFERENCES users(clerk_id),
  name               TEXT    NOT NULL DEFAULT '',
  email              TEXT    NOT NULL DEFAULT '',
  phone              TEXT    NOT NULL DEFAULT '',
  address            TEXT    NOT NULL DEFAULT '',
  tax_id             TEXT    NOT NULL DEFAULT '',
  logo_base64        TEXT,
  invoice_prefix     TEXT    NOT NULL DEFAULT 'INV',
  next_invoice_number INTEGER NOT NULL DEFAULT 1,
  currency           TEXT    NOT NULL DEFAULT 'USD',
  tax_rate           REAL    NOT NULL DEFAULT 0,
  updated_at         INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS parsed_invoices (
  id             TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  clerk_id       TEXT    NOT NULL REFERENCES users(clerk_id),
  file_name      TEXT    NOT NULL,
  vendor_name    TEXT,
  invoice_number TEXT,
  invoice_date   TEXT,
  total_amount   REAL,
  currency       TEXT,
  confidence     INTEGER,
  parsed_data    TEXT    NOT NULL,
  created_at     INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_parsed_invoices_user
  ON parsed_invoices(clerk_id, created_at DESC);
