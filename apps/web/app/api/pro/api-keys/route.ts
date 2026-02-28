import { NextResponse } from "next/server";
import { getProUser } from "@/lib/pro-auth";
import { db } from "@/lib/db";
import { hashApiKey, generateApiKey } from "@/lib/pro-auth";

export async function GET() {
  const auth = await getProUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const result = await db.execute({
      sql: "SELECT id, name, created_at FROM api_keys WHERE clerk_id = ? ORDER BY created_at DESC",
      args: [auth.clerkId],
    });

    const keys = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      createdAt: Number(row.created_at) * 1000,
    }));

    return NextResponse.json({ keys });
  } catch (err) {
    console.error("API keys GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const auth = await getProUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const name = (body.name as string)?.trim() || "Default";

  if (name.length > 100) {
    return NextResponse.json(
      { error: "Name too long" },
      { status: 400 }
    );
  }

  const plainKey = generateApiKey();
  const keyHash = hashApiKey(plainKey);

  try {
    await db.execute({
      sql: "INSERT OR IGNORE INTO users (clerk_id, plan, created_at, updated_at) VALUES (?, 'pro', unixepoch(), unixepoch())",
      args: [auth.clerkId],
    });

    const result = await db.execute({
      sql: "INSERT INTO api_keys (clerk_id, key_hash, name) VALUES (?, ?, ?) RETURNING id, name, created_at",
      args: [auth.clerkId, keyHash, name],
    });

    const row = result.rows[0];
    if (!row) {
      return NextResponse.json(
        { error: "Failed to create API key" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: row.id,
      name: row.name,
      key: plainKey,
      createdAt: Number(row.created_at) * 1000,
      warning: "Save this key now. You won't be able to see it again.",
    });
  } catch (err) {
    console.error("API key create error:", err);
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }
}
