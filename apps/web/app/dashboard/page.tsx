"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/shell/Navbar";
import { Footer } from "@/components/shell/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  History,
  FileText,
  Key,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  Lock,
} from "lucide-react";

interface HistoryEntry {
  id: string;
  toolSlug: string;
  input: string;
  createdAt: number;
}

interface Snippet {
  id: string;
  toolSlug: string;
  name: string;
  input: string;
  createdAt: number;
}

interface ApiKey {
  id: string;
  name: string;
  createdAt: number;
}

export default function DashboardPage() {
  const { user, isLoaded } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingKey, setCreatingKey] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const isPro = (user?.publicMetadata?.plan as string) === "pro";

  useEffect(() => {
    if (!isLoaded || !user) return;
    if (!isPro) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetch("/api/pro/history").then((r) => r.json()),
      fetch("/api/pro/snippets").then((r) => r.json()),
      fetch("/api/pro/api-keys").then((r) => r.json()),
    ])
      .then(([h, s, k]) => {
        if (h.entries) setHistory(h.entries);
        if (s.snippets) setSnippets(s.snippets);
        if (k.keys) setApiKeys(k.keys);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isLoaded, user, isPro]);

  const createApiKey = async () => {
    setCreatingKey(true);
    try {
      const res = await fetch("/api/pro/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Default" }),
      });
      const data = await res.json();
      if (data.key) {
        setNewKey(data.key);
        setApiKeys((prev) => [
          ...prev,
          { id: data.id, name: data.name, createdAt: data.createdAt },
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingKey(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (!isLoaded) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen gradient-bg">
        <Navbar />
        <main className="max-w-2xl mx-auto px-6 lg:px-8 py-16 text-center">
          <p className="text-slate-500">Sign in to access your dashboard.</p>
          <Button asChild className="mt-4">
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="min-h-screen gradient-bg">
        <Navbar />
        <main className="max-w-2xl mx-auto px-6 lg:px-8 py-16">
          <Card className="tool-card border-2 border-[#4f46e5]/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-[#9333ea]" />
                <CardTitle className="text-slate-900">Pro Dashboard</CardTitle>
              </div>
              <p className="text-slate-500">
                Upgrade to Pro to access tool history, saved snippets, and API keys.
              </p>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/pricing">Upgrade to Pro</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Pro Dashboard</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          </div>
        ) : (
          <div className="space-y-8">
            <Card className="tool-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Key className="h-4 w-4" />
                    API Key
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={createApiKey}
                    disabled={creatingKey || !!newKey}
                  >
                    {creatingKey ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Create Key"
                    )}
                  </Button>
                </div>
                <p className="text-sm text-slate-500">
                  Use your API key to access tools programmatically. Rate limit: 1,000 requests/day.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {newKey && (
                  <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                    <p className="text-sm font-medium text-amber-600 dark:text-amber-500">
                      Save this key now. You won&apos;t be able to see it again.
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        readOnly
                        value={newKey}
                        className="font-mono text-sm"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => copyToClipboard(newKey, "newkey")}
                      >
                        {copied === "newkey" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                {apiKeys.length > 0 && !newKey && (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500">
                      {apiKeys.length} API key(s) created. Use the key you saved when you created it.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {apiKeys.map((k) => (
                        <span
                          key={k.id}
                          className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-sm"
                        >
                          {k.name}
                          <span className="text-slate-500">
                            ({formatDate(k.createdAt)})
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-xs text-slate-500">
                  Example: <code className="rounded bg-muted px-1">curl -H &quot;Authorization: Bearer YOUR_KEY&quot; -X POST https://toolhaus.dev/api/pro/tools/json-formatter -d &apos;{`{"input":"{}","options":{"mode":"format"}}`}&apos;</code>
                </p>
              </CardContent>
            </Card>

            <Card className="tool-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                  <History className="h-4 w-4" />
                  Tool History
                </CardTitle>
                <p className="text-sm text-slate-500">
                  Last 50 tool runs. History is saved when you use tools while signed in.
                </p>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No history yet. Use any tool to get started.
                  </p>
                ) : (
                  <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {history.map((e) => (
                      <li
                        key={e.id}
                        className="flex items-center justify-between rounded-md border p-2 text-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/tools/${e.toolSlug}`}
                            className="font-medium hover:underline"
                          >
                            {e.toolSlug}
                          </Link>
                          <p className="truncate text-slate-500 text-xs mt-0.5">
                            {e.input.slice(0, 80)}
                            {e.input.length > 80 ? "…" : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-slate-500">
                            {formatDate(e.createdAt)}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            asChild
                          >
                            <Link href={`/tools/${e.toolSlug}`}>
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="tool-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                  <FileText className="h-4 w-4" />
                  Saved Snippets
                </CardTitle>
                <p className="text-sm text-slate-500">
                  Save tool inputs for quick access. Use the API to add snippets.
                </p>
              </CardHeader>
              <CardContent>
                {snippets.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No snippets yet. Use POST /api/pro/snippets to save.
                  </p>
                ) : (
                  <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {snippets.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between rounded-md border p-2 text-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-medium">{s.name}</span>
                          <span className="text-slate-500 mx-1">·</span>
                          <Link
                            href={`/tools/${s.toolSlug}`}
                            className="text-[#4f46e5] hover:underline"
                          >
                            {s.toolSlug}
                          </Link>
                          <p className="truncate text-slate-500 text-xs mt-0.5">
                            {s.input.slice(0, 80)}
                            {s.input.length > 80 ? "…" : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-slate-500">
                            {formatDate(s.createdAt)}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              copyToClipboard(s.input, s.id)
                            }
                          >
                            {copied === s.id ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button size="icon" variant="ghost" asChild>
                            <Link href={`/tools/${s.toolSlug}`}>
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
