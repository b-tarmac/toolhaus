"use client";

import { useMemo } from "react";
import { parseAsString, useQueryState } from "nuqs";
import type { ToolProps } from "@portfolio/tool-sdk";
import { conversions } from "@/lib/tools/case";
import { Button } from "@/components/ui/button";

const inputParser = parseAsString.withDefault("");

export default function CaseConverter(_props: ToolProps) {
  const [input, setInput] = useQueryState("input", inputParser);

  const results = useMemo(() => {
    return Object.entries(conversions).map(([name, fn]) => ({
      name,
      value: fn(input),
    }));
  }, [input]);

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Input</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-24 w-full rounded-md border bg-muted/30 p-3 font-mono text-sm"
          placeholder="Enter text to convert"
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {results.map(({ name, value }) => (
          <div
            key={name}
            className="flex items-center justify-between rounded-md border p-2"
          >
            <span className="text-xs text-muted-foreground">{name}</span>
            <div className="flex items-center gap-2">
              <code className="truncate text-sm">{value}</code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigator.clipboard.writeText(value)}
              >
                Copy
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
