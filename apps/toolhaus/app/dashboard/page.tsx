"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/shell/Navbar";
import { Footer } from "@/components/shell/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  History,
  FileText,
  Key,
  Share2,
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

export default function DashboardPage() {
  const { user, isLoaded } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
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
    ])
      .then(([h, s]) => {
        if (h.entries) setHistory(h.entries);
        if (s.snippets) setSnippets(s.snippets);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isLoaded, user, isPro]);

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
        <main id="main-content" className="max-w-2xl mx-auto px-6 lg:px-8 py-16 text-center">
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
        <main id="main-content" className="max-w-2xl mx-auto px-6 lg:px-8 py-16">
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
      <main id="main-content" className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Pro Dashboard</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          </div>
        ) : (
          <div className="space-y-8">
            <Card className="tool-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Key className="h-4 w-4" />
                  API Keys
                </CardTitle>
                <p className="text-sm text-slate-500">
                  Create and manage API keys for programmatic access. Rate limit: 1,000 requests/day.
                </p>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/dashboard/api-keys">
                    Manage API keys
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="tool-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Share2 className="h-4 w-4" />
                  Share Links
                </CardTitle>
                <p className="text-sm text-slate-500">
                  Persistent links you can share. Anyone with the link can view the tool state.
                </p>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline">
                  <Link href="/dashboard/share-links">
                    Manage share links
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
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
