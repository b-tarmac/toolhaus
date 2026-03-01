"use client";

import { useMemo, useState } from "react";
import { parseAsString, useQueryState } from "nuqs";
import type { ToolProps } from "@portfolio/tool-sdk";
import { conversions } from "@/lib/tools/case";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { BatchToolLayout } from "./BatchToolLayout";

const inputParser = parseAsString.withDefault("");
const CONVERSION_NAMES = Object.keys(conversions);

export default function CaseConverter(_props: ToolProps) {
  const { user } = useAuth();
  const isPro = user?.publicMetadata?.plan === "pro";
  const [input, setInput] = useQueryState("input", inputParser);
  const [batchConversion, setBatchConversion] = useState("camelCase");

  const results = useMemo(() => {
    return Object.entries(conversions).map(([name, fn]) => ({
      name,
      value: fn(input),
    }));
  }, [input]);

  const batchOptionsForm = (
    <div className="flex flex-wrap gap-2">
      <label className="text-sm font-medium">Conversion:</label>
      <select
        value={batchConversion}
        onChange={(e) => setBatchConversion(e.target.value)}
        className="rounded-md border px-2 py-1 text-sm"
      >
        {CONVERSION_NAMES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );

  return (
    <BatchToolLayout
      toolSlug="case-converter"
      toolName="Case Converter"
      isPro={!!isPro}
      singleContent={
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
      }
      batchOptions={{ conversion: batchConversion }}
      batchOptionsForm={batchOptionsForm}
      batchPlaceholder="One line per string to convert"
    />
  );
}
