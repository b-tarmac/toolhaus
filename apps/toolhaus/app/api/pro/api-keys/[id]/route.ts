import { NextResponse } from "next/server";
import { getProUser } from "@/lib/pro-auth";
import { db } from "@/lib/db";

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
    return NextResponse.json({ error: "Key ID required" }, { status: 400 });
  }

  try {
    const result = await db.execute({
      sql: "DELETE FROM api_keys WHERE id = ? AND clerk_id = ? RETURNING id",
      args: [id, auth.clerkId],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "API key not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("API key delete error:", err);
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 }
    );
  }
}
