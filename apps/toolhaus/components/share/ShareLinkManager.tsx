"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useWorkspace } from "@/components/workspaces/WorkspaceContext";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Share2, Loader2, Copy, Check, Trash2 } from "lucide-react";

interface ShareLink {
  id: string;
  toolSlug: string;
  name: string;
  slug: string;
  createdAt: number;
  updatedAt: number;
}

export function ShareLinkManager() {
  const ctx = useWorkspace();
  const { user } = useAuth();
  const isPro = (user?.publicMetadata?.plan as string) === "pro";

  const [links, setLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!ctx || !user || !isPro) return;
    setLoading(true);
    fetch(`/api/share-links?toolSlug=${encodeURIComponent(ctx.toolSlug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.links) setLinks(data.links);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [ctx?.toolSlug, user, isPro]);

  const handleCreate = async () => {
    if (!ctx || !name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/share-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: ctx.toolSlug,
          name: name.trim(),
          slug: slug.trim() || undefined,
          stateJson: JSON.stringify(ctx.currentState),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLinks((prev) => [
        ...prev,
        {
          id: data.id,
          toolSlug: ctx.toolSlug,
          name: data.name,
          slug: data.slug,
          createdAt: data.createdAt,
          updatedAt: data.createdAt,
        },
      ]);
      setOpen(false);
      setName("");
      setSlug("");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!ctx) return;
    try {
      await fetch(`/api/share-links/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stateJson: JSON.stringify(ctx.currentState),
        }),
      });
      setLinks((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, updatedAt: Date.now() } : l
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this share link?")) return;
    try {
      const res = await fetch(`/api/share-links/${id}`, {
        method: "DELETE",
      });
      if (res.ok) setLinks((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const copyLink = (s: string) => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/s/${s}`;
    navigator.clipboard.writeText(url);
    setCopied(s);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!ctx || !isPro) return null;

  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "https://toolhaus.dev";

  return (
    <>
      <div className="mt-4 flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          <Share2 className="mr-2 h-4 w-4" />
          Share link
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Persistent share link</DialogTitle>
            <DialogDescription>
              Create a link that never breaks. Anyone with the link can view this tool state.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <Input
                placeholder="e.g. Production API Schema"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                URL slug (optional)
              </label>
              <div className="flex gap-2">
                <span className="flex items-center text-sm text-slate-500">
                  {baseUrl}/s/
                </span>
                <Input
                  placeholder="my-link"
                  value={slug}
                  onChange={(e) =>
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, "-")
                        .replace(/-+/g, "-")
                    )
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!name.trim() || saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create link"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {links.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-slate-600">
            Your share links for this tool
          </p>
          <ul className="space-y-2">
            {links.map((link) => (
              <li
                key={link.id}
                className="flex items-center justify-between rounded-md border p-2 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-medium">{link.name}</span>
                  <span className="ml-2 text-slate-500">/s/{link.slug}</span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyLink(link.slug)}
                  >
                    {copied === link.slug ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleUpdate(link.id)}
                  >
                    Update
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(link.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
