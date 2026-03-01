"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useUserTier } from "@/lib/auth/use-user-tier";
import { useWorkspace } from "./WorkspaceContext";
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
import { useUpgradePrompt } from "@/hooks/useUpgradePrompt";
import { UpgradePrompt } from "@/components/billing/UpgradePrompt";
import { FolderOpen, Loader2 } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  toolSlug: string;
  stateJson: string;
  createdAt: number;
}

export function WorkspaceSaver() {
  const ctx = useWorkspace();
  const { user } = useAuth();
  const tier = useUserTier();
  const router = useRouter();
  const { openUpgradePrompt, upgradePromptProps } = useUpgradePrompt();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    if (!ctx || !user) return;
    setLoading(true);
    fetch(`/api/workspaces?toolSlug=${encodeURIComponent(ctx.toolSlug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.workspaces) setWorkspaces(data.workspaces);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [ctx?.toolSlug, user]);

  const handleSave = async () => {
    if (!ctx || !saveName.trim()) return;
    if (tier === "anonymous") {
      router.push("/sign-up?redirect_url=" + encodeURIComponent(window.location.href));
      return;
    }
    if (tier === "free" && workspaces.length >= 1) {
      openUpgradePrompt("workspaces");
      setSaveOpen(false);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: ctx.toolSlug,
          name: saveName.trim(),
          stateJson: JSON.stringify(ctx.currentState),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setWorkspaces((prev) => [
        ...prev,
        { id: data.id, name: data.name, toolSlug: ctx.toolSlug, stateJson: "", createdAt: data.createdAt },
      ]);
      setSaveOpen(false);
      setSaveName("");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleLoad = async () => {
    if (!selectedId) return;
    const w = workspaces.find((x) => x.id === selectedId);
    if (!w) return;
    const res = await fetch(`/api/workspaces/${selectedId}`);
    const data = await res.json();
    if (data.stateJson) {
      const state = JSON.parse(data.stateJson);
      ctx?.setInitialState(state);
    }
  };

  if (!ctx) return null;

  const canSave = tier !== "anonymous";
  const atLimit = tier === "free" && workspaces.length >= 1;

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-4">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            if (!canSave) {
              router.push("/sign-up?redirect_url=" + encodeURIComponent(window.location.href));
              return;
            }
            if (atLimit) {
              openUpgradePrompt("workspaces");
              return;
            }
            setSaveOpen(true);
          }}
        >
          <FolderOpen className="mr-2 h-4 w-4" />
          Save Workspace
        </Button>

        {workspaces.length > 0 && (
          <>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="rounded-md border bg-background px-2 py-1 text-sm"
            >
              <option value="">Load workspace...</option>
              {workspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              variant="outline"
              onClick={handleLoad}
              disabled={!selectedId}
            >
              Load
            </Button>
          </>
        )}

        {tier === "free" && workspaces.length > 0 && (
          <span className="text-xs text-slate-500">
            1 / 1 per tool
          </span>
        )}
      </div>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Workspace</DialogTitle>
            <DialogDescription>
              Give this configuration a name to save and recall later.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="e.g. Production API Response"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!saveName.trim() || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UpgradePrompt {...upgradePromptProps} />
    </>
  );
}
