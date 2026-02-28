import { NextResponse } from "next/server";
import { getProUserFromRequest } from "@/lib/pro-auth";
import { db } from "@/lib/db";

const MAX_HISTORY = 50;

export async function GET(req: Request) {
  const auth = await getProUserFromRequest(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const result = await db.execute({
      sql: `SELECT id, tool_slug, input, created_at FROM tool_history
            WHERE clerk_id = ? ORDER BY created_at DESC LIMIT ?`,
      args: [auth.clerkId, MAX_HISTORY],
    });

    const entries = result.rows.map((row) => ({
      id: row.id,
      toolSlug: row.tool_slug,
      input: row.input,
      createdAt: Number(row.created_at) * 1000,
    }));

    return NextResponse.json({ entries });
  } catch (err) {
    console.error("History GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const auth = await getProUserFromRequest(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: { toolSlug?: string; input?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { toolSlug, input } = body;
  if (!toolSlug || typeof input !== "string") {
    return NextResponse.json(
      { error: "toolSlug and input required" },
      { status: 400 }
    );
  }

  if (input.length > 100_000) {
    return NextResponse.json(
      { error: "Input too large" },
      { status: 400 }
    );
  }

  try {
    const result = await db.execute({
      sql: `INSERT INTO tool_history (clerk_id, tool_slug, input) VALUES (?, ?, ?)
            RETURNING id, tool_slug, created_at`,
      args: [auth.clerkId, toolSlug, input],
    });

    const row = result.rows[0];
    if (!row) {
      return NextResponse.json(
        { error: "Failed to save" },
        { status: 500 }
      );
    }

    await pruneHistory(auth.clerkId);

    return NextResponse.json({
      id: row.id,
      toolSlug: row.tool_slug,
      createdAt: Number(row.created_at) * 1000,
    });
  } catch (err) {
    console.error("History POST error:", err);
    return NextResponse.json(
      { error: "Failed to save history" },
      { status: 500 }
    );
  }
}

async function pruneHistory(clerkId: string): Promise<void> {
  await db.execute({
    sql: `DELETE FROM tool_history WHERE clerk_id = ? AND created_at < (
      SELECT created_at FROM tool_history WHERE clerk_id = ?
      ORDER BY created_at DESC LIMIT 1 OFFSET ?
    )`,
    args: [clerkId, clerkId, MAX_HISTORY - 1],
  });
}
