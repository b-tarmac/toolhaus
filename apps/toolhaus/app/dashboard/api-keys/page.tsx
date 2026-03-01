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
  Key,
  Copy,
  Check,
  Loader2,
  Lock,
  Trash2,
  ExternalLink,
} from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string | null;
  lastUsed: number | null;
  createdAt: number;
}

export default function ApiKeysPage() {
  const { user, isLoaded } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingKey, setCreatingKey] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [keyName, setKeyName] = useState("Default");
  const [usage, setUsage] = useState<{
    used: number;
    remaining: number;
    limit: number;
  } | null>(null);

  const isPro = (user?.publicMetadata?.plan as string) === "pro";

  useEffect(() => {
    if (!isLoaded || !user) return;
    if (!isPro) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetch("/api/pro/api-keys").then((r) => r.json()),
      fetch("/api/pro/api-usage").then((r) => r.json()),
    ])
      .then(([k, u]) => {
        if (k.keys) setApiKeys(k.keys);
        if (u.used !== undefined) setUsage(u);
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
        body: JSON.stringify({ name: keyName.trim() || "Default" }),
      });
      const data = await res.json();
      if (data.key) {
        setNewKey(data.key);
        setApiKeys((prev) => [
          ...prev,
          {
            id: data.id,
            name: data.name,
            keyPrefix: data.key?.substring(0, 12) + "…",
            lastUsed: null,
            createdAt: data.createdAt,
          },
        ]);
        if (usage) {
          setUsage((u) => (u ? { ...u, remaining: u.remaining } : null));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingKey(false);
    }
  };

  const deleteApiKey = async (id: string) => {
    if (!confirm("Delete this API key? It will stop working immediately.")) return;
    try {
      const res = await fetch(`/api/pro/api-keys/${id}`, { method: "DELETE" });
      if (res.ok) {
        setApiKeys((prev) => prev.filter((k) => k.id !== id));
      }
    } catch (e) {
      console.error(e);
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
        <main id="main-content" className="max-w-2xl mx-auto px-6 lg:px-8 py-16 text-center">
          <p className="text-slate-500">Sign in to access API keys.</p>
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
                <CardTitle className="text-slate-900">Pro required</CardTitle>
              </div>
              <p className="text-slate-500">
                Upgrade to Pro to create and manage API keys.
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
      <main id="main-content" className="max-w-2xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">API Keys</h1>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ExternalLink className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>

        {usage && (
          <Card className="mb-6">
            <CardContent className="pt-4">
              <p className="text-sm text-slate-600">
                <strong>{usage.used}</strong> / {usage.limit} API requests used today
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(100, (usage.used / usage.limit) * 100)}%`,
                  }}
                />
              </div>
              <Button variant="link" size="sm" className="mt-2 px-0" asChild>
                <Link href="/api-docs">View API docs</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="tool-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Key className="h-4 w-4" />
                Create API Key
              </CardTitle>
              <div className="flex gap-2">
                <Input
                  placeholder="Key name"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="w-32"
                />
                <Button
                  size="sm"
                  onClick={createApiKey}
                  disabled={creatingKey || !!newKey}
                >
                  {creatingKey ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create"
                  )}
                </Button>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Use your API key with the Toolhaus API. Rate limit: 1,000 requests/day.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {newKey && (
              <div className="rounded-lg border bg-amber-50 dark:bg-amber-950/30 p-4 space-y-2">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
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
            <p className="text-xs text-slate-500">
              Example:{" "}
              <code className="rounded bg-muted px-1">
                curl -H &quot;Authorization: Bearer YOUR_KEY&quot; -X POST
                https://toolhaus.dev/api/v1/json-formatter -d &apos;{`{"input":"{}","options":{"mode":"format"}}`}&apos;
              </code>
            </p>
          </CardContent>
        </Card>

        <Card className="tool-card mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Your API keys</CardTitle>
            <p className="text-sm text-slate-500">
              {apiKeys.length} key(s). Use the key you saved when you created it.
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
              </div>
            ) : apiKeys.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">
                No API keys yet. Create one above.
              </p>
            ) : (
              <ul className="space-y-2">
                {apiKeys.map((k) => (
                  <li
                    key={k.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <span className="font-medium">{k.name}</span>
                      {k.keyPrefix && (
                        <span className="ml-2 font-mono text-xs text-slate-500">
                          {k.keyPrefix}
                        </span>
                      )}
                      <div className="text-xs text-slate-500 mt-1">
                        Created {formatDate(k.createdAt)}
                        {k.lastUsed && (
                          <> · Last used {formatDate(k.lastUsed)}</>
                        )}
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteApiKey(k.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
