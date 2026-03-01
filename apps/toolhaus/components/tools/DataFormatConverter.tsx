"use client";

import { useMemo } from "react";
import { parseAsStringLiteral, parseAsString, useQueryState } from "nuqs";
import type { ToolProps } from "@portfolio/tool-sdk";
import { convertFormat, detectFormat, type Format } from "@/lib/tools/data-format";

const fromParser = parseAsStringLiteral(["json", "yaml", "toml"]).withDefault("json");
const toParser = parseAsStringLiteral(["json", "yaml", "toml"]).withDefault("yaml");
const inputParser = parseAsString.withDefault('{"name": "example", "count": 42}');

export default function DataFormatConverter(_props: ToolProps) {
  const [input, setInput] = useQueryState("input", inputParser);
  const [from, setFrom] = useQueryState("from", fromParser);
  const [to, setTo] = useQueryState("to", toParser);

  const result = useMemo(
    () => convertFormat(input, from, to),
    [input, from, to]
  );

  const swapFormats = () => {
    setFrom(to);
    setTo(from);
    if (result.isValid && result.output) {
      setInput(result.output);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={from}
          onChange={(e) => setFrom(e.target.value as Format)}
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="json">JSON</option>
          <option value="yaml">YAML</option>
          <option value="toml">TOML</option>
        </select>
        <span className="text-muted-foreground">→</span>
        <select
          value={to}
          onChange={(e) => setTo(e.target.value as Format)}
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="json">JSON</option>
          <option value="yaml">YAML</option>
          <option value="toml">TOML</option>
        </select>
        <button
          type="button"
          onClick={swapFormats}
          className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
        >
          Swap
        </button>
        <button
          type="button"
          onClick={() => setFrom(detectFormat(input))}
          className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
        >
          Auto-detect
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Input ({from.toUpperCase()})</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-80 w-full rounded-md border bg-muted/30 p-3 font-mono text-sm"
            placeholder="Paste JSON, YAML or TOML..."
            spellCheck={false}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Output ({to.toUpperCase()})</label>
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
