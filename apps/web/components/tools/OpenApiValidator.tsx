"use client";

import { useEffect, useState } from "react";
import { parseAsString, useQueryState } from "nuqs";
import type { ToolProps } from "@toolhaus/tool-sdk";
import { validateOpenApi } from "@/lib/tools/openapi";

const inputParser = parseAsString.withDefault("");

export default function OpenApiValidator(_props: ToolProps) {
  const [input, setInput] = useQueryState("input", inputParser);
  const [result, setResult] = useState<Awaited<ReturnType<typeof validateOpenApi>> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!input.trim()) {
      setResult(null);
      return;
    }
    setLoading(true);
    validateOpenApi(input)
      .then(setResult)
      .finally(() => setLoading(false));
  }, [input]);

  const errors = result?.metadata?.errors ?? [];

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">OpenAPI / JSON Schema (JSON or YAML)</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-80 w-full rounded-md border bg-muted/30 p-3 font-mono text-sm"
          placeholder='{"openapi": "3.0.0", "info": {...}, "paths": {...}}'
          spellCheck={false}
        />
      </div>

      {loading && <p className="text-sm text-muted-foreground">Validating...</p>}

      {result && !loading && (
        <>
          {result.isValid ? (
            <p className="text-sm text-green-600 dark:text-green-400">{result.output}</p>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-medium text-destructive">
                Errors ({errors.length})
              </label>
              <ul className="space-y-1 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
                {errors.map((e, idx) => (
                  <li key={idx} className="cursor-pointer hover:underline">
                    {e.path && <span className="font-mono text-muted-foreground">{e.path}: </span>}
                    {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
