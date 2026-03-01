"use client";

import { useMemo } from "react";
import { parseAsString, parseAsBoolean, useQueryState } from "nuqs";
import type { ToolProps } from "@portfolio/tool-sdk";
import { generateTypeScript } from "@/lib/tools/json-to-ts";

const inputParser = parseAsString.withDefault('{"name": "Alice", "age": 30}');
const rootParser = parseAsString.withDefault("Root");
const optionalParser = parseAsBoolean.withDefault(false);

export default function JsonToTypescript(_props: ToolProps) {
  const [input, setInput] = useQueryState("input", inputParser);
  const [rootName, setRootName] = useQueryState("root", rootParser);
  const [optional, setOptional] = useQueryState("optional", optionalParser);

  const result = useMemo(
    () => generateTypeScript(input, rootName, optional),
    [input, rootName, optional]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Root interface name</label>
          <input
            type="text"
            value={rootName}
            onChange={(e) => setRootName(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm font-mono"
            placeholder="Root"
          />
        </div>
        <label className="flex items-center gap-2 self-end">
          <input
            type="checkbox"
            checked={optional}
            onChange={(e) => setOptional(e.target.checked)}
          />
          <span className="text-sm">Optional fields</span>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">JSON input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-80 w-full rounded-md border bg-muted/30 p-3 font-mono text-sm"
            placeholder='{"key": "value"}'
            spellCheck={false}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">TypeScript output</label>
          <div className="h-80 overflow-auto rounded-md border bg-muted/30 p-3 font-mono text-sm">
            {result.error ? (
              <span className="text-destructive">{result.error.message}</span>
            ) : (
              <pre className="whitespace-pre-wrap break-words">{result.output || ""}</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
