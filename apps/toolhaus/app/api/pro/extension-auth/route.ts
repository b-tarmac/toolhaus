import { NextResponse } from "next/server";
import { getProUser } from "@/lib/pro-auth";
import { db } from "@/lib/db";
import { hashApiKey, generateApiKey } from "@/lib/pro-auth";

const EXTENSION_KEY_NAME = "Browser Extension";

export async function POST(req: Request) {
  const auth = await getProUser();
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.status === 401 ? "Sign in required" : "Pro subscription required" },
      { status: auth.status }
    );
  }

  let body: { redirect_uri?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const redirectUri = body.redirect_uri;
  if (!redirectUri || !redirectUri.startsWith("chrome-extension://")) {
    return NextResponse.json(
      { error: "Invalid redirect_uri" },
      { status: 400 }
    );
  }

  const isPro = true;

  const plainKey = generateApiKey();
  const keyHash = hashApiKey(plainKey);

  try {
    await db.execute({
      sql: "DELETE FROM api_keys WHERE clerk_id = ? AND name = ?",
      args: [auth.clerkId, EXTENSION_KEY_NAME],
    });

    await db.execute({
      sql: "INSERT INTO api_keys (clerk_id, key_hash, name) VALUES (?, ?, ?)",
      args: [auth.clerkId, keyHash, EXTENSION_KEY_NAME],
    });

    return NextResponse.json({
      token: plainKey,
      isPro,
    });
  } catch (err) {
    console.error("Extension auth error:", err);
    return NextResponse.json(
      { error: "Failed to create extension token" },
      { status: 500 }
    );
  }
}
