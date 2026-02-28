"use client";

import { useMemo } from "react";
import { parseAsStringLiteral, parseAsString, useQueryState } from "nuqs";
import type { ToolProps } from "@toolhaus/tool-sdk";
import { markdownToHtml } from "@/lib/tools/markdown";
import DOMPurify from "dompurify";

const viewParser = parseAsStringLiteral(["preview", "html"]).withDefault("preview");
const inputParser = parseAsString.withDefault("");

export default function MarkdownPreview(_props: ToolProps) {
  const [input, setInput] = useQueryState("input", inputParser);
  const [view, setView] = useQueryState("view", viewParser);

  const { output, isValid } = useMemo(() => markdownToHtml(input), [input]);
  const sanitized = useMemo(
    () => (output ? DOMPurify.sanitize(output) : ""),
    [output]
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setView("preview")}
          className={`rounded-md px-3 py-1.5 text-sm ${
            view === "preview" ? "bg-primary text-primary-foreground" : "border"
          }`}
        >
          Preview
        </button>
        <button
          type="button"
          onClick={() => setView("html")}
          className={`rounded-md px-3 py-1.5 text-sm ${
            view === "html" ? "bg-primary text-primary-foreground" : "border"
          }`}
        >
          HTML
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Markdown</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-96 w-full rounded-md border bg-muted/30 p-3 font-mono text-sm"
            placeholder="# Hello"
            spellCheck={false}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            {view === "preview" ? "Preview" : "HTML"}
          </label>
          <div className="h-96 overflow-auto rounded-md border bg-muted/30 p-3">
            {view === "preview" ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitized }}
              />
            ) : (
              <pre className="whitespace-pre-wrap break-words font-mono text-xs">
                {output || (isValid ? "" : "Invalid")}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
