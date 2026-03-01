"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/shell/Navbar";
import { Footer } from "@/components/shell/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_TOOL_SLUGS } from "@/lib/tools-api";
import { getToolBySlug } from "@/lib/tools-registry";
import { Key, Copy, Check, Loader2, Lock } from "lucide-react";

const BASE_URL = typeof window !== "undefined" ? window.location.origin : "https://toolhaus.dev";

function ExampleBlock({
  title,
  code,
  lang,
}: {
  title: string;
  code: string;
  lang: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-2"
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
      <pre className="overflow-x-auto rounded-md border bg-muted/50 p-3 text-xs">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function ApiDocsPage() {
  const { user, isLoaded } = useAuth();
  const isPro = (user?.publicMetadata?.plan as string) === "pro";
  const [usage, setUsage] = useState<{
    used: number;
    remaining: number;
    limit: number;
    resetAt: number;
  } | null>(null);

  useEffect(() => {
    if (isPro && user) {
      fetch("/api/pro/api-usage")
        .then((r) => r.json())
        .then((d) => setUsage(d))
        .catch(() => {});
    }
  }, [isPro, user]);

  const exampleKey = "th_live_your_api_key_here";

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <main id="main-content" className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          Toolhaus API
        </h1>
        <p className="text-slate-600 mb-8">
          Access Toolhaus tools programmatically. Pro subscription required. Rate limit: 1,000 requests/day.
        </p>

        {!isLoaded ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          </div>
        ) : !isPro ? (
          <Card className="border-2 border-[#4f46e5]/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-[#9333ea]" />
                <CardTitle>Pro required</CardTitle>
              </div>
              <p className="text-slate-500">
                Upgrade to Pro to access the API and create API keys.
              </p>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/pricing">Upgrade to Pro</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {usage && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Key className="h-4 w-4" />
                    API usage
                  </CardTitle>
                  <p className="text-sm text-slate-500">
                    {usage.used} / {usage.limit} requests used today. Resets at{" "}
                    {new Date(usage.resetAt).toUTCString().slice(0, 25)} UTC.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${Math.min(100, (usage.used / usage.limit) * 100)}%`,
                      }}
                    />
                  </div>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <Link href="/dashboard/api-keys">Manage API keys</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-4">Authentication</h2>
                <p className="text-slate-600 mb-4">
                  Include your API key in the <code className="rounded bg-muted px-1">Authorization</code> header:
                </p>
                <ExampleBlock
                  title="cURL"
                  code={`curl -X POST ${BASE_URL}/api/v1/json-formatter \\
  -H "Authorization: Bearer ${exampleKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"input":"{\\"foo\\":1}","options":{"mode":"format","indent":"2"}}'`}
                  lang="bash"
                />
                <ExampleBlock
                  title="JavaScript"
                  code={`const res = await fetch('${BASE_URL}/api/v1/json-formatter', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${process.env.TOOLHAUS_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: '{"foo":1}',
    options: { mode: 'format', indent: '2' },
  }),
});
const data = await res.json();
console.log(data.output);`}
                  lang="javascript"
                />
                <ExampleBlock
                  title="Python"
                  code={`import requests

res = requests.post(
    "${BASE_URL}/api/v1/json-formatter",
    headers={
        "Authorization": f"Bearer {process.env.get('TOOLHAUS_API_KEY')}",
        "Content-Type": "application/json",
    },
    json={
        "input": '{"foo":1}',
        "options": {"mode": "format", "indent": "2"},
    },
)
data = res.json()
print(data["output"])`}
                  lang="python"
                />
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">Request format</h2>
                <p className="text-slate-600 mb-2">
                  POST <code className="rounded bg-muted px-1">/api/v1/[tool]</code>
                </p>
                <pre className="rounded-md border bg-muted/50 p-4 text-sm overflow-x-auto">
{`{
  "input": "string",      // Required: tool input
  "options": {            // Optional: tool-specific options
    "mode": "format",
    "indent": "2"
  }
}`}
                </pre>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">Response format</h2>
                <pre className="rounded-md border bg-muted/50 p-4 text-sm overflow-x-auto">
{`{
  "output": "string",     // Tool output
  "isValid": true,        // Whether the operation succeeded
  "error": null,         // Error message if isValid is false
  "metadata": {}         // Optional tool-specific metadata
}`}
                </pre>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">Available tools</h2>
                <div className="space-y-4">
                  {API_TOOL_SLUGS.map((slug) => {
                    const tool = getToolBySlug(slug);
                    return (
                      <Card key={slug}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-medium">
                            {tool?.name ?? slug}
                          </CardTitle>
                          <p className="text-sm text-slate-500">
                            POST {BASE_URL}/api/v1/{slug}
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm text-slate-600">
                            {tool?.description ?? ""}
                          </p>
                          <ExampleBlock
                            title="Example"
                            code={`curl -X POST ${BASE_URL}/api/v1/${slug} \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"input":"your input here","options":{}}'`}
                            lang="bash"
                          />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
