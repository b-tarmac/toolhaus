"use client";

import { useMemo } from "react";
import { parseAsStringLiteral, parseAsString, useQueryState } from "nuqs";
import type { ToolProps } from "@portfolio/tool-sdk";
import {
  encodeHtmlEntities,
  decodeHtmlEntities,
} from "@/lib/tools/html-entities";

const modeParser = parseAsStringLiteral(["encode", "decode"]).withDefault("encode");
const inputParser = parseAsString.withDefault("");

export default function HtmlEntityTool(_props: ToolProps) {
  const [input, setInput] = useQueryState("input", inputParser);
  const [mode, setMode] = useQueryState("mode", modeParser);

  const output = useMemo(() => {
    if (!input) return "";
    return mode === "encode" ? encodeHtmlEntities(input) : decodeHtmlEntities(input);
  }, [input, mode]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("encode")}
          className={`rounded-md px-3 py-1.5 text-sm ${
            mode === "encode" ? "bg-primary text-primary-foreground" : "border"
          }`}
        >
          Encode
        </button>
        <button
          type="button"
          onClick={() => setMode("decode")}
          className={`rounded-md px-3 py-1.5 text-sm ${
            mode === "decode" ? "bg-primary text-primary-foreground" : "border"
          }`}
        >
          Decode
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-48 w-full rounded-md border bg-muted/30 p-3 font-mono text-sm"
            placeholder={mode === "encode" ? "<div>Hello</div>" : "&lt;div&gt;Hello&lt;/div&gt;"}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Output</label>
          <textarea
            value={output}
            readOnly
            className="h-48 w-full rounded-md border bg-muted/30 p-3 font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );
}
