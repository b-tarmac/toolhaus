import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getUserTier } from "@/lib/auth/tier";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const toolSlug = searchParams.get("toolSlug");

  try {
    const result = toolSlug
      ? await db.execute({
          sql: `SELECT id, tool_slug, name, state_json, created_at, updated_at
                FROM workspaces
                WHERE clerk_id = ? AND tool_slug = ?
                ORDER BY updated_at DESC`,
          args: [userId, toolSlug],
        })
      : await db.execute({
          sql: `SELECT id, tool_slug, name, state_json, created_at, updated_at
                FROM workspaces
                WHERE clerk_id = ?
                ORDER BY tool_slug, updated_at DESC`,
          args: [userId],
        });

    const workspaces = result.rows.map((row) => ({
      id: row.id,
      toolSlug: row.tool_slug,
      name: row.name,
      stateJson: row.state_json,
      createdAt: Number(row.created_at) * 1000,
      updatedAt: Number(row.updated_at) * 1000,
    }));

    return NextResponse.json({ workspaces });
  } catch (err) {
    console.error("Workspaces GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch workspaces" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { toolSlug?: string; name?: string; stateJson?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { toolSlug, name, stateJson } = body;
  if (!toolSlug || !name || typeof stateJson !== "string") {
    return NextResponse.json(
      { error: "toolSlug, name, and stateJson required" },
      { status: 400 }
    );
  }

  if (stateJson.length > 500_000) {
    return NextResponse.json(
      { error: "State too large" },
      { status: 400 }
    );
  }

  const tier = await getUserTier();
  if (tier === "anonymous") {
    return NextResponse.json({ error: "Sign in to save workspaces" }, { status: 401 });
  }

  if (tier === "free") {
    const existing = await db.execute({
      sql: "SELECT COUNT(*) as count FROM workspaces WHERE clerk_id = ? AND tool_slug = ?",
      args: [userId, toolSlug],
    });
    if (Number(existing.rows[0]?.count ?? 0) >= 1) {
      return NextResponse.json(
        {
          error:
            "Free accounts are limited to 1 workspace per tool. Upgrade to Pro for unlimited workspaces.",
        },
        { status: 403 }
      );
    }
  }

  try {
    const result = await db.execute({
      sql: `INSERT INTO workspaces (clerk_id, tool_slug, name, state_json)
            VALUES (?, ?, ?, ?)
            RETURNING id, name, created_at`,
      args: [userId, toolSlug, name, stateJson],
    });

    const row = result.rows[0];
    if (!row) {
      return NextResponse.json(
        { error: "Failed to create workspace" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: row.id,
      name: row.name,
      createdAt: Number(row.created_at) * 1000,
    });
  } catch (err) {
    console.error("Workspaces POST error:", err);
    return NextResponse.json(
      { error: "Failed to create workspace" },
      { status: 500 }
    );
  }
}
