import { NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/api/auth";
import { checkApiRateLimit, recordApiUsage } from "@/lib/api/rate-limit";
import { maybeSendRateLimitEmail } from "@/lib/api/rate-limit-notify";
import { getToolHandler, runTool } from "@/lib/tools-api";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ tool: string }> }
) {
  const auth = await verifyApiKey(req);
  if (!auth.valid) {
    return NextResponse.json(
      { error: auth.error ?? "Unauthorized" },
      { status: 401 }
    );
  }

  const rateLimit = await checkApiRateLimit(auth.clerkId!);
  if (!rateLimit.allowed) {
    maybeSendRateLimitEmail(auth.clerkId!).catch(() => {});
    return NextResponse.json(
      {
        error:
          "Daily rate limit exceeded (1,000 requests/day). Resets at midnight UTC.",
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": "1000",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rateLimit.resetAt),
        },
      }
    );
  }

  const { tool: slug } = await params;
  if (!slug) {
    return NextResponse.json({ error: "Tool slug required" }, { status: 400 });
  }

  const handler = getToolHandler(slug);
  if (!handler) {
    return NextResponse.json(
      { error: `Tool '${slug}' is not available via API` },
      { status: 404 }
    );
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

    await recordApiUsage(auth.clerkId!, slug);

    return NextResponse.json(
      {
        output: result.output,
        isValid: result.isValid,
        error: result.error,
        metadata: result.metadata,
      },
      {
        headers: {
          "X-RateLimit-Limit": "1000",
          "X-RateLimit-Remaining": String(rateLimit.remaining),
          "X-RateLimit-Reset": String(rateLimit.resetAt),
        },
      }
    );
  } catch (err) {
    console.error(`Tool ${slug} error:`, err);
    return NextResponse.json(
      { error: "Tool execution failed" },
      { status: 500 }
    );
  }
}
