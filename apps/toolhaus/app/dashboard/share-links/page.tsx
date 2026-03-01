"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/shell/Navbar";
import { Footer } from "@/components/shell/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getToolBySlug } from "@/lib/tools-registry";
import { Share2, Loader2, Trash2, ExternalLink, Copy, Check, Lock } from "lucide-react";

interface ShareLink {
  id: string;
  toolSlug: string;
  name: string;
  slug: string;
  createdAt: number;
  updatedAt: number;
}

export default function ShareLinksPage() {
  const { user, isLoaded } = useAuth();
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const isPro = (user?.publicMetadata?.plan as string) === "pro";

  useEffect(() => {
    if (!isLoaded || !user) return;
    if (!isPro) {
      setLoading(false);
      return;
    }
    fetch("/api/share-links")
      .then((r) => r.json())
      .then((data) => {
        if (data.links) setLinks(data.links);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isLoaded, user, isPro]);

  const deleteLink = async (id: string) => {
    if (!confirm("Delete this share link? It will stop working immediately.")) return;
    try {
      const res = await fetch(`/api/share-links/${id}`, { method: "DELETE" });
      if (res.ok) setLinks((prev) => prev.filter((l) => l.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const copyLink = (slug: string) => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/s/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const grouped = links.reduce<Record<string, ShareLink[]>>((acc, l) => {
    if (!acc[l.toolSlug]) acc[l.toolSlug] = [];
    acc[l.toolSlug].push(l);
    return acc;
  }, {});

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
          <p className="text-slate-500">Sign in to access your share links.</p>
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
                Upgrade to Pro to create persistent share links that never break.
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
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Share Links
          </h1>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">← Dashboard</Link>
          </Button>
        </div>

        <p className="mb-6 text-slate-600">
          Persistent links you can share. Anyone with the link can view the tool state. Create links from the &quot;Share link&quot; button on any tool.
        </p>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
          </div>
        ) : links.length === 0 ? (
          <Card className="tool-card">
            <CardContent className="py-12 text-center">
              <Share2 className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-slate-500">
                No share links yet. Use the &quot;Share link&quot; button on any tool to create one.
              </p>
              <Button asChild className="mt-4">
                <Link href="/tools">Browse Tools</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([toolSlug, items]) => {
              const tool = getToolBySlug(toolSlug);
              const toolName = tool?.name ?? toolSlug;
              return (
                <Card key={toolSlug} className="tool-card">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Link
                        href={`/tools/${toolSlug}`}
                        className="hover:text-[#4f46e5] hover:underline"
                      >
                        {toolName}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {items.map((link) => (
                        <li
                          key={link.id}
                          className="flex items-center justify-between rounded-md border p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-medium">{link.name}</span>
                            <span className="ml-2 text-slate-500 font-mono text-sm">
                              /s/{link.slug}
                            </span>
                            <div className="text-xs text-slate-500 mt-1">
                              Updated {formatDate(link.updatedAt)}
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyLink(link.slug)}
                            >
                              {copied === link.slug ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/s/${link.slug}`} target="_blank">
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => deleteLink(link.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
