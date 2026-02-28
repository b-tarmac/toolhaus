import { NextResponse } from "next/server";
import { getProUserFromRequest } from "@/lib/pro-auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const auth = await getProUserFromRequest(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const result = await db.execute({
      sql: `SELECT id, tool_slug, name, input, created_at FROM saved_snippets
            WHERE clerk_id = ? ORDER BY created_at DESC`,
      args: [auth.clerkId],
    });

    const snippets = result.rows.map((row) => ({
      id: row.id,
      toolSlug: row.tool_slug,
      name: row.name,
      input: row.input,
      createdAt: Number(row.created_at) * 1000,
    }));

    return NextResponse.json({ snippets });
  } catch (err) {
    console.error("Snippets GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch snippets" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const auth = await getProUserFromRequest(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: { toolSlug?: string; name?: string; input?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { toolSlug, name, input } = body;
  if (!toolSlug || !name || typeof input !== "string") {
    return NextResponse.json(
      { error: "toolSlug, name and input required" },
      { status: 400 }
    );
  }

  if (name.length > 200 || input.length > 100_000) {
    return NextResponse.json(
      { error: "Name or input too large" },
      { status: 400 }
    );
  }

  try {
    const result = await db.execute({
      sql: `INSERT INTO saved_snippets (clerk_id, tool_slug, name, input)
            VALUES (?, ?, ?, ?) RETURNING id, tool_slug, name, created_at`,
      args: [auth.clerkId, toolSlug, name, input],
    });

    const row = result.rows[0];
    if (!row) {
      return NextResponse.json(
        { error: "Failed to save" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: row.id,
      toolSlug: row.tool_slug,
      name: row.name,
      createdAt: Number(row.created_at) * 1000,
    });
  } catch (err) {
    console.error("Snippets POST error:", err);
    return NextResponse.json(
      { error: "Failed to save snippet" },
      { status: 500 }
    );
  }
}
