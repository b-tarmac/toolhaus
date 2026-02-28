"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { tools } from "@/lib/tools-registry";
import { CATEGORY_LABELS } from "@toolhaus/tool-sdk";
import { Search } from "lucide-react";

const fuse = new Fuse(tools, {
  keys: ["name", "shortName", "description", "tags", "keywordsForSeo"],
  threshold: 0.3,
});

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const results = query.trim()
    ? fuse.search(query).map((r) => r.item)
    : tools;

  const selectTool = useCallback(
    (tool: (typeof tools)[0]) => {
      router.push(`/tools/${tool.slug}`);
      onOpenChange(false);
      setQuery("");
      setSelectedIndex(0);
    },
    [router, onOpenChange]
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        selectTool(results[selectedIndex]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, results, selectedIndex, selectTool]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose={true} className="max-w-xl p-0 gap-0">
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle className="sr-only">Search tools</DialogTitle>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tools..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
          </div>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No tools found
            </p>
          ) : (
            <ul className="space-y-0.5">
              {results.map((tool, i) => (
                <li key={tool.slug}>
                  <button
                    type="button"
                    onClick={() => selectTool(tool)}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      i === selectedIndex
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <span className="font-medium">{tool.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {CATEGORY_LABELS[tool.category] ?? tool.category}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
