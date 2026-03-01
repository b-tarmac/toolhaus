#!/usr/bin/env npx tsx
/**
 * Run all Toolhaus database migrations.
 * Uses TURSO_DATABASE_URL and TURSO_AUTH_TOKEN from .env.local (or env).
 *
 * Usage (from repo root): pnpm exec tsx apps/toolhaus/scripts/run-migrations.ts
 * Or: cd apps/toolhaus && npx tsx scripts/run-migrations.ts
 */

import { createClient } from "@libsql/client";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDir = join(__dirname, "..");

// Load .env.local from app dir if it exists (Next.js convention)
for (const envFile of [".env.local", ".env"]) {
  const envPath = join(appDir, envFile);
  if (!existsSync(envPath)) continue;
  try {
    const env = readFileSync(envPath, "utf-8");
    for (const line of env.split("\n")) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const val = match[2].trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = val;
      }
    }
    break;
  } catch {
    continue;
  }
}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  process.exit(1);
}

const db = createClient({ url, authToken });

// Order: schema first (base tables), then incremental migrations
const migrations = [
  { name: "schema.sql", path: "lib/schema.sql" },
  { name: "migrations-step2.sql", path: "lib/migrations-step2.sql" },
  { name: "migrations-step7.sql", path: "lib/migrations-step7.sql" },
  { name: "migrations-step8.sql", path: "lib/migrations-step8.sql" },
  { name: "migrations-step10.sql", path: "lib/migrations-step10.sql" },
];

async function run() {
  console.log("Running Toolhaus migrations...\n");

  for (const m of migrations) {
    const fullPath = join(appDir, m.path);
    try {
      const sql = readFileSync(fullPath, "utf-8");
      // Remove single-line comments, split by semicolon
      const cleaned = sql
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n");
      const statements = cleaned
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const stmt of statements) {
        try {
          await db.execute(stmt + ";");
        } catch (err) {
          // Ignore "duplicate column" / "already exists" - migrations are idempotent
          const msg = (err as Error).message;
          if (
            msg.includes("duplicate column") ||
            msg.includes("already exists") ||
            msg.includes("UNIQUE constraint failed")
          ) {
            console.log(`  (skipped: ${msg.slice(0, 60)}...)`);
          } else {
            throw err;
          }
        }
      }
      console.log(`✓ ${m.name}`);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        console.log(`  (skipped: ${m.name} not found)`);
      } else {
        console.error(`✗ ${m.name}:`, err);
        process.exit(1);
      }
    }
  }

  console.log("\nDone.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
