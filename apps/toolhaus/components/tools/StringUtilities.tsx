"use client";

import { useMemo } from "react";
import { parseAsStringLiteral, parseAsString, useQueryState } from "nuqs";
import type { ToolProps } from "@portfolio/tool-sdk";
import { operations } from "@/lib/tools/string-utils";
import { Card, CardContent } from "@/components/ui/card";

const opParser = parseAsString.withDefault("word-count");
const inputParser = parseAsString.withDefault("");

export default function StringUtilities(_props: ToolProps) {
  const [input, setInput] = useQueryState("input", inputParser);
  const [operation, setOperation] = useQueryState("operation", opParser);

  const result = useMemo(() => {
    const fn = operations[operation];
    if (!fn) return "";
    const r = fn(input);
    return typeof r === "object" ? JSON.stringify(r, null, 2) : r;
  }, [input, operation]);

  const isWordCount = operation === "word-count";
  const wordCountData =
    isWordCount && typeof operations["word-count"](input) === "object"
      ? (operations["word-count"](input) as {
          words: number;
          chars: number;
          lines: number;
        })
      : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(operations) as (keyof typeof operations)[]).map((op) => (
          <button
            key={op}
            type="button"
            onClick={() => setOperation(op)}
            className={`rounded-md px-3 py-1.5 text-sm ${
              operation === op ? "bg-primary text-primary-foreground" : "border"
            }`}
          >
            {op.replace(/-/g, " ")}
          </button>
        ))}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Input</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-32 w-full rounded-md border bg-muted/30 p-3 font-mono text-sm"
          placeholder="Enter text"
        />
      </div>
      {wordCountData ? (
        <div className="grid gap-2 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold">{wordCountData.words}</p>
              <p className="text-sm text-muted-foreground">Words</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold">{wordCountData.chars}</p>
              <p className="text-sm text-muted-foreground">Characters</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold">{wordCountData.lines}</p>
              <p className="text-sm text-muted-foreground">Lines</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div>
          <label className="mb-1 block text-sm font-medium">Output</label>
          <textarea
            value={result}
            readOnly
            className="h-32 w-full rounded-md border bg-muted/30 p-3 font-mono text-sm"
          />
        </div>
      )}
    </div>
  );
}
