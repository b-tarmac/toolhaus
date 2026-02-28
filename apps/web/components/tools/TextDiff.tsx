"use client";

import { useMemo } from "react";
import { parseAsStringLiteral, parseAsString, useQueryState } from "nuqs";
import type { ToolProps } from "@toolhaus/tool-sdk";
import { computeDiff } from "@/lib/tools/text-diff";
import * as Diff from "diff";

const viewParser = parseAsStringLiteral(["split", "unified"]).withDefault("split");
const oldParser = parseAsString.withDefault("");
const newParser = parseAsString.withDefault("");

export default function TextDiff(_props: ToolProps) {
  const [view, setView] = useQueryState("view", viewParser);
  const [oldText, setOldText] = useQueryState("old", oldParser);
  const [newText, setNewText] = useQueryState("new", newParser);

  const result = useMemo(() => computeDiff(oldText, newText), [oldText, newText]);

  const diffLines = useMemo(() => {
    return Diff.diffLines(oldText || "\n", newText || "\n");
  }, [oldText, newText]);

  const stats = result.metadata?.stats;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setView("split")}
            className={`rounded-md px-3 py-1.5 text-sm ${
              view === "split" ? "bg-primary text-primary-foreground" : "border"
            }`}
          >
            Split
          </button>
          <button
            type="button"
            onClick={() => setView("unified")}
            className={`rounded-md px-3 py-1.5 text-sm ${
              view === "unified" ? "bg-primary text-primary-foreground" : "border"
            }`}
          >
            Unified
          </button>
        </div>
        {stats && (
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span className="text-green-600 dark:text-green-400">+{stats.added}</span>
            <span className="text-red-600 dark:text-red-400">−{stats.removed}</span>
            <span>{stats.unchanged} unchanged</span>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Original</label>
          <textarea
            value={oldText}
            onChange={(e) => setOldText(e.target.value)}
            className="h-64 w-full rounded-md border bg-muted/30 p-3 font-mono text-sm"
            placeholder="Paste original text..."
            spellCheck={false}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Modified</label>
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            className="h-64 w-full rounded-md border bg-muted/30 p-3 font-mono text-sm"
            placeholder="Paste modified text..."
            spellCheck={false}
          />
        </div>
      </div>

      {(oldText || newText) && (
        <div>
          <label className="mb-1 block text-sm font-medium">Diff result</label>
          {view === "split" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-64 overflow-auto rounded-md border bg-muted/30 p-3 font-mono text-sm">
                <DiffView parts={diffLines} side="old" />
              </div>
              <div className="h-64 overflow-auto rounded-md border bg-muted/30 p-3 font-mono text-sm">
                <DiffView parts={diffLines} side="new" />
              </div>
            </div>
          ) : (
            <pre className="h-64 overflow-auto rounded-md border bg-muted/30 p-3 font-mono text-xs whitespace-pre-wrap break-words">
              {result.output || "No changes"}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

function DiffView({
  parts,
  side,
}: {
  parts: Diff.Change[];
  side: "old" | "new";
}) {
  const lines: { text: string; type: "add" | "remove" | "unchanged" }[] = [];
  for (const part of parts) {
    const raw = part.value.split("\n");
    const lineList = raw[raw.length - 1] === "" ? raw.slice(0, -1) : raw;
    const type = part.added ? "add" : part.removed ? "remove" : "unchanged";
    for (const line of lineList) {
      if (side === "old" && part.added) continue;
      if (side === "new" && part.removed) continue;
      lines.push({ text: line, type });
    }
  }

  return (
    <div>
      {lines.map((l, i) => (
        <div
          key={i}
          className={`${
            l.type === "add"
              ? "bg-green-500/20 text-green-800 dark:text-green-200"
              : l.type === "remove"
                ? "bg-red-500/20 text-red-800 dark:text-red-200"
                : ""
          }`}
        >
          <span className="select-none w-6 inline-block text-muted-foreground">
            {l.type === "add" ? "+" : l.type === "remove" ? "−" : " "}
          </span>
          {l.text || " "}
        </div>
      ))}
    </div>
  );
}
