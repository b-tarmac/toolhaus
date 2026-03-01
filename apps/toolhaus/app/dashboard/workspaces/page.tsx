"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useUserTier } from "@/lib/auth/use-user-tier";
import { Navbar } from "@/components/shell/Navbar";
import { Footer } from "@/components/shell/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getToolBySlug } from "@/lib/tools-registry";
import { FolderOpen, Loader2, Trash2, ExternalLink } from "lucide-react";

interface Workspace {
  id: string;
  toolSlug: string;
  name: string;
  stateJson: string;
  createdAt: number;
  updatedAt: number;
}

export default function WorkspacesPage() {
  const { user, isLoaded } = useAuth();
  const tier = useUserTier();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user) return;
    fetch("/api/workspaces")
      .then((r) => r.json())
      .then((data) => {
        if (data.workspaces) setWorkspaces(data.workspaces);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isLoaded, user]);

  const deleteWorkspace = async (id: string) => {
    const res = await fetch(`/api/workspaces/${id}`, { method: "DELETE" });
    if (res.ok) {
      setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    }
  };

  const grouped = workspaces.reduce<Record<string, Workspace[]>>((acc, w) => {
    if (!acc[w.toolSlug]) acc[w.toolSlug] = [];
    acc[w.toolSlug].push(w);
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
          <p className="text-slate-500">Sign in to access your workspaces.</p>
          <Button asChild className="mt-4">
            <Link href="/sign-in">Sign In</Link>
          </Button>
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
            Your Workspaces
          </h1>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">← Dashboard</Link>
          </Button>
        </div>

        {tier === "free" && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              Free accounts can save 1 workspace per tool.{" "}
              <Link href="/pricing" className="font-medium underline">
                Upgrade to Pro for unlimited workspaces →
              </Link>
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          </div>
        ) : workspaces.length === 0 ? (
          <Card className="tool-card">
            <CardContent className="py-12 text-center">
              <FolderOpen className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-slate-500">
                No saved workspaces yet. Use the &quot;Save Workspace&quot; button on any tool to save your configuration.
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
              const limitText =
                tier === "free" ? ` (${items.length} / 1 per tool)` : "";

              return (
                <Card key={toolSlug} className="tool-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FolderOpen className="h-4 w-4" />
                      {toolName}
                      {limitText}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {items.map((w) => (
                        <li
                          key={w.id}
                          className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3"
                        >
                          <span className="font-medium">{w.name}</span>
                          <div className="flex items-center gap-2">
                            <Button asChild size="sm" variant="outline">
                              <Link
                                href={`/tools/${toolSlug}?workspace=${w.id}`}
                                className="flex items-center gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Open
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => deleteWorkspace(w.id)}
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
