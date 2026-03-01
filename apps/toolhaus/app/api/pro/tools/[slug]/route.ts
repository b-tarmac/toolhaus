import { NextResponse } from "next/server";
import { getProUserFromRequest } from "@/lib/pro-auth";
import { runTool } from "@/lib/tools-api";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await getProUserFromRequest(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ error: "Slug required" }, { status: 400 });
  }

  let body: { input?: string; options?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const input = typeof body.input === "string" ? body.input : "";
  const options = (body.options as Record<string, unknown>) ?? {};

  if (input.length > 500_000) {
    return NextResponse.json(
      { error: "Input too large" },
      { status: 400 }
    );
  }

  try {
    const result = await runTool(slug, input, options);
    return NextResponse.json({
      output: result.output,
      isValid: result.isValid,
      error: result.error,
      metadata: result.metadata,
    });
  } catch (err) {
    console.error(`Tool ${slug} error:`, err);
    return NextResponse.json(
      { error: "Tool execution failed" },
      { status: 500 }
    );
  }
}
