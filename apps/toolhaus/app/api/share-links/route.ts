import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProUser } from "@/lib/pro-auth";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64) || "link";
}

export async function GET(req: Request) {
  const proAuth = await getProUser();
  if (!proAuth.ok) {
    return NextResponse.json({ error: proAuth.error }, { status: proAuth.status });
  }

  const { searchParams } = new URL(req.url);
  const toolSlug = searchParams.get("toolSlug");

  try {
    const result = toolSlug
      ? await db.execute({
          sql: `SELECT id, tool_slug, name, slug, created_at, updated_at
                FROM share_links
                WHERE clerk_id = ? AND tool_slug = ?
                ORDER BY updated_at DESC`,
          args: [proAuth.clerkId, toolSlug],
        })
      : await db.execute({
          sql: `SELECT id, tool_slug, name, slug, created_at, updated_at
                FROM share_links
                WHERE clerk_id = ?
                ORDER BY tool_slug, updated_at DESC`,
          args: [proAuth.clerkId],
        });

    const links = result.rows.map((row) => ({
      id: row.id,
      toolSlug: row.tool_slug,
      name: row.name,
      slug: row.slug,
      createdAt: Number(row.created_at) * 1000,
      updatedAt: Number(row.updated_at) * 1000,
    }));

    return NextResponse.json({ links });
  } catch (err) {
    console.error("Share links GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch share links" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const auth = await getProUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: { toolSlug?: string; name?: string; slug?: string; stateJson?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
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

  const baseSlug = body.slug
    ? slugify(body.slug as string)
    : slugify(name);
  let slug = baseSlug;
  let attempts = 0;

  try {
    while (attempts < 10) {
      try {
        const result = await db.execute({
          sql: `INSERT INTO share_links (clerk_id, tool_slug, name, slug, state_json)
                VALUES (?, ?, ?, ?, ?)
                RETURNING id, name, slug, created_at`,
          args: [auth.clerkId, toolSlug, name.trim(), slug, stateJson],
        });
        const row = result.rows[0];
        if (!row) {
          return NextResponse.json(
            { error: "Failed to create share link" },
            { status: 500 }
          );
        }
        return NextResponse.json({
          id: row.id,
          name: row.name,
          slug: row.slug,
          createdAt: Number(row.created_at) * 1000,
        });
      } catch (e: unknown) {
        const msg = (e as { message?: string })?.message ?? "";
        if (msg.includes("UNIQUE") || msg.includes("unique")) {
          attempts++;
          slug = `${baseSlug}-${attempts}`;
        } else {
          throw e;
        }
      }
    }
    return NextResponse.json(
      { error: "Could not generate unique slug" },
      { status: 500 }
    );
  } catch (err) {
    console.error("Share link POST error:", err);
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    );
  }
}
