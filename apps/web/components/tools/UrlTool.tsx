"use client";

import { useMemo } from "react";
import { parseAsStringLiteral, parseAsString, useQueryState } from "nuqs";
import type { ToolProps } from "@toolhaus/tool-sdk";
import { encodeUrl, decodeUrl, parseUrl } from "@/lib/tools/url";
import { Card, CardContent } from "@/components/ui/card";

const modeParser = parseAsStringLiteral(["encode", "decode", "parse"]).withDefault("encode");
const fullParser = parseAsStringLiteral(["true", "false"]).withDefault("false");
const inputParser = parseAsString.withDefault("");

export default function UrlTool(_props: ToolProps) {
  const [input, setInput] = useQueryState("input", inputParser);
  const [mode, setMode] = useQueryState("mode", modeParser);
  const [full, setFull] = useQueryState("full", fullParser);

  const output = useMemo(() => {
    if (!input.trim()) return "";
    if (mode === "encode")
      return encodeUrl(input, full === "true").output;
    if (mode === "decode") return decodeUrl(input).output;
    return "";
  }, [input, mode, full]);

  const parsed = useMemo(() => {
    if (mode !== "parse" || !input.trim()) return null;
    return parseUrl(input);
  }, [input, mode]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["encode", "decode", "parse"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-md px-3 py-1.5 text-sm ${
              mode === m ? "bg-primary text-primary-foreground" : "border"
            }`}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
        {mode === "encode" && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={full === "true"}
              onChange={(e) => setFull(e.target.checked ? "true" : "false")}
            />
            Full encode
          </label>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Input</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-24 w-full rounded-md border bg-muted/30 p-3 font-mono text-sm"
          placeholder="URL or text"
        />
      </div>

      {mode === "parse" && parsed ? (
        <Card>
          <CardContent className="pt-4">
            {parsed.isValid ? (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Protocol:</span>{" "}
                  {parsed.protocol}
                </p>
                <p>
                  <span className="text-muted-foreground">Hostname:</span>{" "}
                  {parsed.hostname}
                </p>
                <p>
                  <span className="text-muted-foreground">Path:</span>{" "}
                  {parsed.pathname}
                </p>
                {Object.keys(parsed.params).length > 0 && (
                  <p>
                    <span className="text-muted-foreground">Params:</span>{" "}
                    {JSON.stringify(parsed.params)}
                  </p>
                )}
                {parsed.hash && (
                  <p>
                    <span className="text-muted-foreground">Hash:</span>{" "}
                    {parsed.hash}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-destructive">{parsed.error}</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div>
          <label className="mb-1 block text-sm font-medium">Output</label>
          <textarea
            value={output}
            readOnly
            className="h-24 w-full rounded-md border bg-muted/30 p-3 font-mono text-sm"
          />
        </div>
      )}
    </div>
  );
}
