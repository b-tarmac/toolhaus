"use client";

import { useMemo } from "react";
import { parseAsString, useQueryState } from "nuqs";
import type { ToolProps } from "@portfolio/tool-sdk";
import { decodeJwt } from "@/lib/tools/jwt";
import { Card, CardContent } from "@/components/ui/card";

const tokenParser = parseAsString.withDefault("");

export default function JwtDecoder(_props: ToolProps) {
  const [token, setToken] = useQueryState("token", tokenParser);

  const result = useMemo(() => decodeJwt(token), [token]);

  const parts = result.metadata?.parts;

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">JWT token</label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="h-24 w-full rounded-md border bg-muted/30 p-3 font-mono text-sm"
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          spellCheck={false}
        />
      </div>

      {result.error && (
        <p className="text-sm text-destructive">{result.error.message}</p>
      )}

      {parts && token.trim() && (
        <div className="space-y-4">
          {result.metadata?.expired && (
            <div className="rounded-md border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
              Token expired
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-4">
                <h3 className="mb-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                  Header
                </h3>
                <pre className="overflow-x-auto text-xs font-mono whitespace-pre-wrap break-words">
                  {JSON.stringify(parts.header, null, 2)}
                </pre>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <h3 className="mb-2 text-sm font-medium text-green-600 dark:text-green-400">
                  Payload
                </h3>
                <pre className="overflow-x-auto text-xs font-mono whitespace-pre-wrap break-words">
                  {JSON.stringify(parts.payload, null, 2)}
                </pre>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  Signature
                </h3>
                <pre className="overflow-x-auto text-xs font-mono break-all">
                  {parts.signature || "(none)"}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
