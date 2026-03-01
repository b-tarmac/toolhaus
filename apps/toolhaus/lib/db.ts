import { createDbClient } from "@portfolio/database";

export const db = createDbClient(
  process.env.TURSO_DATABASE_URL || "libsql://placeholder.turso.io",
  process.env.TURSO_AUTH_TOKEN || ""
);
