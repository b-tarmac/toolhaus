"use client";

import { useMemo } from "react";
import { parseAsStringLiteral, parseAsString, useQueryState } from "nuqs";
import type { ToolProps } from "@portfolio/tool-sdk";
import { processJson } from "@/lib/tools/json";
import { Button } from "@/components/ui/button";

const modeParser = parseAsStringLiteral(["format", "minify", "validate", "tree"])
  .withDefault("format");
const indentParser = parseAsStringLiteral(["2", "4", "tab"]).withDefault("2");
const inputParser = parseAsString.withDefault("");

export default function JsonFormatter(props: ToolProps) {
  const [input, setInput] = useQueryState("input", inputParser);
  const [mode, setMode] = useQueryState("mode", modeParser);
  const [indent, setIndent] = useQueryState("indent", indentParser);

  const result = useMemo(() => {
    if (!input.trim()) return { output: "", isValid: true as boolean };
    return processJson(input, {
      mode: mode === "tree" ? "format" : mode,
      indent,
    });
  }, [input, mode, indent]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["format", "minify", "validate", "tree"] as const).map((m) => (
          <Button
            key={m}
            variant={mode === m ? "default" : "outline"}
            size="sm"
            onClick={() => setMode(m)}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </Button>
        ))}
        {mode !== "tree" && (
          <select
            value={indent}
            onChange={(e) => setIndent(e.target.value as "2" | "4" | "tab")}
            className="rounded-md border px-2 py-1 text-sm"
          >
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="tab">Tab</option>
          </select>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-64 w-full rounded-md border bg-muted/30 p-3 font-mono text-sm"
            placeholder='{"key": "value"}'
            spellCheck={false}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Output</label>
          <div className="h-64 w-full overflow-auto rounded-md border bg-muted/30 p-3 font-mono text-sm">
            {mode === "tree" && result.isValid && result.output ? (
              <JsonTree data={JSON.parse(result.output)} />
            ) : result.error ? (
              <span className="text-destructive">{result.error.message}</span>
            ) : (
              <pre className="whitespace-pre-wrap break-words">
                {result.output || (result.isValid && mode === "validate" ? "✓ Valid JSON" : "")}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function JsonTree({ data, depth = 0 }: { data: unknown; depth?: number }) {
  const pad = "  ".repeat(depth);
  if (data === null) return <span className="text-muted-foreground">null</span>;
  if (typeof data === "boolean")
    return <span className="text-orange-600">{String(data)}</span>;
  if (typeof data === "number")
    return <span className="text-blue-600">{String(data)}</span>;
  if (typeof data === "string")
    return <span className="text-green-600">&quot;{data}&quot;</span>;
  if (Array.isArray(data)) {
    return (
      <div>
        <span className="text-muted-foreground">[</span>
        {data.map((item, i) => (
          <div key={i} className="pl-4">
            {pad}
            <JsonTree data={item} depth={depth + 1} />
            {i < data.length - 1 && ","}
          </div>
        ))}
        <span className="text-muted-foreground">]</span>
      </div>
    );
  }
  return (
    <div>
      <span className="text-muted-foreground">{"{"}</span>
      {Object.entries(data as Record<string, unknown>).map(([k, v], i, arr) => (
        <div key={k} className="pl-4">
          <span className="text-purple-600">&quot;{k}&quot;</span>
          <span className="text-muted-foreground">: </span>
          <JsonTree data={v} depth={depth + 1} />
          {i < arr.length - 1 && ","}
        </div>
      ))}
      <span className="text-muted-foreground">{"}"}</span>
    </div>
  );
}
