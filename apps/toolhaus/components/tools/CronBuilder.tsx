"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { parseAsString, useQueryState } from "nuqs";
import type { ToolProps } from "@portfolio/tool-sdk";
import { parseCron } from "@/lib/tools/cron";
import { useAuth } from "@/lib/auth-context";
import { useToolUsage } from "@/hooks/useToolUsage";
import { LimitWarningBanner } from "@/components/billing/LimitWarningBanner";

const exprParser = parseAsString.withDefault("0 9 * * 1-5");

export default function CronBuilder(_props: ToolProps) {
  const { user } = useAuth();
  const isPro = user?.publicMetadata?.plan === "pro";
  const { checkAndRecord, checkOnly } = useToolUsage("cron-builder");

  const [expression, setExpression] = useQueryState("expr", exprParser);
  const [usage, setUsage] = useState<{ remaining: number; limit: number } | null>(null);
  const lastCountedExpr = useRef<string | null>(null);

  const result = useMemo(() => parseCron(expression), [expression]);

  useEffect(() => {
    if (isPro) return;
    checkOnly().then((r) => {
      if (r.remaining !== null && r.limit !== undefined) {
        setUsage({ remaining: r.remaining, limit: r.limit });
      }
    });
  }, [isPro, checkOnly]);

  useEffect(() => {
    if (isPro) return;
    if (!expression.trim() || result.error) return;
    if (lastCountedExpr.current === expression) return;
    if (usage?.remaining === 0) return;

    lastCountedExpr.current = expression;
    checkAndRecord().then((r) => {
      if (r.remaining !== null) setUsage({ remaining: r.remaining, limit: r.limit ?? 5 });
    });
  }, [expression, result.error, isPro, checkAndRecord, usage?.remaining]);

  return (
    <div className="space-y-4">
      {!isPro && usage && usage.remaining <= 1 && (
        <LimitWarningBanner
          remaining={usage.remaining}
          limit={usage.limit}
          toolName="Cron Builder"
        />
      )}
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
