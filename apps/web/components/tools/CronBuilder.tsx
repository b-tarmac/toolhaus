"use client";

import { useMemo } from "react";
import { parseAsString, useQueryState } from "nuqs";
import type { ToolProps } from "@toolhaus/tool-sdk";
import { parseCron } from "@/lib/tools/cron";

const exprParser = parseAsString.withDefault("0 9 * * 1-5");

export default function CronBuilder(_props: ToolProps) {
  const [expression, setExpression] = useQueryState("expr", exprParser);

  const result = useMemo(() => parseCron(expression), [expression]);

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Cron expression</label>
        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          className="w-full rounded-md border bg-muted/30 px-3 py-2 font-mono text-sm"
          placeholder="0 9 * * 1-5"
          spellCheck={false}
        />
      </div>

      {expression && (
        <>
          {result.error ? (
            <p className="text-sm text-destructive">{result.error.message}</p>
          ) : (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium">Human-readable</label>
                <p className="rounded-md border bg-muted/30 p-3 text-sm">
                  {result.metadata?.description || "—"}
                </p>
              </div>

              {result.metadata?.nextRuns && result.metadata.nextRuns.length > 0 && (
                <div>
                  <label className="mb-1 block text-sm font-medium">Next 5 runs</label>
                  <ul className="space-y-1 rounded-md border bg-muted/30 p-3 text-sm font-mono">
                    {result.metadata.nextRuns.map((r, i) => (
                      <li key={i}>
                        {new Date(r).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
