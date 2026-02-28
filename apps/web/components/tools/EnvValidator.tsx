"use client";

import { useMemo } from "react";
import { parseAsString, useQueryState } from "nuqs";
import type { ToolProps } from "@toolhaus/tool-sdk";
import { validateEnv } from "@/lib/tools/env-validator";

const inputParser = parseAsString.withDefault("API_KEY=your_key_here\nDATABASE_URL=postgres://localhost");

export default function EnvValidator(_props: ToolProps) {
  const [input, setInput] = useQueryState("input", inputParser);

  const result = useMemo(() => validateEnv(input), [input]);

  const entries = result.metadata?.entries ?? [];
  const issues = result.metadata?.issues ?? [];

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">.env content</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-48 w-full rounded-md border bg-muted/30 p-3 font-mono text-sm"
          placeholder="API_KEY=secret\nDATABASE_URL=..."
          spellCheck={false}
        />
      </div>

      {result.isValid && entries.length > 0 && (
        <div>
          <label className="mb-1 block text-sm font-medium">Parsed (values masked)</label>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-2 text-left font-medium">Key</th>
                  <th className="px-3 py-2 text-left font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-3 py-2 font-mono">{e.key}</td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">{e.masked}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {issues.length > 0 && (
        <div>
          <label className="mb-1 block text-sm font-medium text-destructive">Issues</label>
          <ul className="space-y-1 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
            {issues.map((i, idx) => (
              <li key={idx}>
                {i.type === "duplicate" && "Duplicate key: "}
                {i.type === "invalid_case" && "Invalid case: "}
                {i.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.isValid && !result.error && (
        <p className="text-sm text-green-600 dark:text-green-400">{result.output}</p>
      )}
    </div>
  );
}
