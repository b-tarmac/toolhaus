import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Workspace ID required" }, { status: 400 });
  }

  try {
    const result = await db.execute({
      sql: `SELECT id, tool_slug, name, state_json, created_at, updated_at
            FROM workspaces
            WHERE id = ? AND clerk_id = ?`,
      args: [id, userId],
    });

    const row = result.rows[0];
    if (!row) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: row.id,
      toolSlug: row.tool_slug,
      name: row.name,
      stateJson: row.state_json,
      createdAt: Number(row.created_at) * 1000,
      updatedAt: Number(row.updated_at) * 1000,
    });
  } catch (err) {
    console.error("Workspace GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch workspace" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Workspace ID required" }, { status: 400 });
  }

  let body: { name?: string; stateJson?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const updates: string[] = [];
  const args: (string | number)[] = [];

  if (body.name !== undefined) {
    updates.push("name = ?");
    args.push(body.name);
  }
  if (body.stateJson !== undefined) {
    if (typeof body.stateJson !== "string" || body.stateJson.length > 500_000) {
      return NextResponse.json(
        { error: "Invalid or too large stateJson" },
        { status: 400 }
      );
    }
    updates.push("state_json = ?");
    args.push(body.stateJson);
  }

  if (updates.length === 0) {
    return NextResponse.json(
      { error: "name or stateJson required" },
      { status: 400 }
    );
  }

  updates.push("updated_at = unixepoch()");
  args.push(id, userId);

  try {
    const sql = `UPDATE workspaces SET ${updates.join(", ")}
      WHERE id = ? AND clerk_id = ?
      RETURNING id, updated_at`;
    const result = await db.execute({ sql, args });

    const row = result.rows[0];
    if (!row) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: row.id,
      updatedAt: Number(row.updated_at) * 1000,
    });
  } catch (err) {
    console.error("Workspace PUT error:", err);
    return NextResponse.json(
      { error: "Failed to update workspace" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Workspace ID required" }, { status: 400 });
  }

  try {
    const result = await db.execute({
      sql: "DELETE FROM workspaces WHERE id = ? AND clerk_id = ? RETURNING id",
      args: [id, userId],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Workspace DELETE error:", err);
    return NextResponse.json(
      { error: "Failed to delete workspace" },
      { status: 500 }
    );
  }
}
