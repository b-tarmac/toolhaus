import { createClient, type Client } from "@libsql/client";

export type { Client as DbClient };

export function createDbClient(url: string, authToken: string): Client {
  return createClient({ url, authToken });
}

/**
 * The minimal users table shared by both Toolhaus and EasyBiscuit.
 * Each app extends this with its own app-specific tables.
 */
export const BASE_USERS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS users (
  clerk_id               TEXT    PRIMARY KEY,
  plan                   TEXT    NOT NULL DEFAULT 'free',
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  plan_expires_at        INTEGER,
  created_at             INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at             INTEGER NOT NULL DEFAULT (unixepoch())
);
`.trim();
