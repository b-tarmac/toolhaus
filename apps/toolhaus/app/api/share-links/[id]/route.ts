import { NextResponse } from "next/server";
import { getProUser } from "@/lib/pro-auth";
import { db } from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getProUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  let body: { stateJson?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const stateJson = body.stateJson;
  if (typeof stateJson !== "string") {
    return NextResponse.json(
      { error: "stateJson required" },
      { status: 400 }
    );
  }

  if (stateJson.length > 500_000) {
    return NextResponse.json(
      { error: "State too large" },
      { status: 400 }
    );
  }

  try {
    const result = await db.execute({
      sql: `UPDATE share_links
            SET state_json = ?, updated_at = unixepoch()
            WHERE id = ? AND clerk_id = ?
            RETURNING id, name, slug, updated_at`,
      args: [stateJson, id, auth.clerkId],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Share link not found or access denied" },
        { status: 404 }
      );
    }

    const row = result.rows[0];
    return NextResponse.json({
      id: row.id,
      name: row.name,
      slug: row.slug,
      updatedAt: Number(row.updated_at) * 1000,
    });
  } catch (err) {
    console.error("Share link PUT error:", err);
    return NextResponse.json(
      { error: "Failed to update share link" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getProUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  try {
    const result = await db.execute({
      sql: "DELETE FROM share_links WHERE id = ? AND clerk_id = ? RETURNING id",
      args: [id, auth.clerkId],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Share link not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Share link DELETE error:", err);
    return NextResponse.json(
      { error: "Failed to delete share link" },
      { status: 500 }
    );
  }
}
