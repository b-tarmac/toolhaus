"use client";

import { useCallback, useState } from "react";
import { parseAsStringLiteral, parseAsString, useQueryState } from "nuqs";
import type { ToolProps } from "@portfolio/tool-sdk";
import { hashAll, hashFile } from "@/lib/tools/hash";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

const inputTypeParser = parseAsStringLiteral(["text", "file"]).withDefault("text");
const uppercaseParser = parseAsStringLiteral(["true", "false"]).withDefault("false");
const inputParser = parseAsString.withDefault("");

const MAX_FILE_FREE = 5 * 1024 * 1024;
const MAX_FILE_PRO = 50 * 1024 * 1024;

export default function HashGenerator(_props: ToolProps) {
  const { user } = useAuth();
  const isPro = user?.publicMetadata?.plan === "pro";
  const maxFile = isPro ? MAX_FILE_PRO : MAX_FILE_FREE;

  const [input, setInput] = useQueryState("input", inputParser);
  const [inputType, setInputType] = useQueryState("inputType", inputTypeParser);
  const [uppercase, setUppercase] = useQueryState("uppercase", uppercaseParser);
  const [hashes, setHashes] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(false);

  const computeText = useCallback(async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const h = await hashAll(input);
      setHashes(
        uppercase === "true"
          ? Object.fromEntries(
              Object.entries(h).map(([k, v]) => [k, v.toUpperCase()])
            )
          : h
      );
    } finally {
      setLoading(false);
    }
  }, [input, uppercase]);

  const handleFile = useCallback(
    async (file: File) => {
      if (file.size > maxFile) return;
      setLoading(true);
      try {
        const h = await hashFile(file);
        setHashes(
          uppercase === "true"
            ? Object.fromEntries(
                Object.entries(h).map(([k, v]) => [k, v.toUpperCase()])
              )
            : h
        );
      } finally {
        setLoading(false);
      }
    },
    [maxFile, uppercase]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={inputType === "text" ? "default" : "outline"}
          size="sm"
          onClick={() => setInputType("text")}
        >
          Text
        </Button>
        <Button
          variant={inputType === "file" ? "default" : "outline"}
          size="sm"
          onClick={() => setInputType("file")}
        >
          File
        </Button>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={uppercase === "true"}
            onChange={(e) =>
              setUppercase(e.target.checked ? "true" : "false")
            }
          />
          Uppercase
        </label>
      </div>

      {inputType === "text" ? (
        <>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onBlur={computeText}
            className="h-32 w-full rounded-md border bg-muted/30 p-3 font-mono text-sm"
            placeholder="Enter text to hash"
          />
          <Button onClick={computeText} disabled={loading}>
            Compute
          </Button>
        </>
      ) : (
        <div
          className="rounded-lg border-2 border-dashed p-8 text-center"
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            type="file"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <p className="mt-2 text-sm text-muted-foreground">
            Max {isPro ? "50MB" : "5MB"}
          </p>
        </div>
      )}

      {hashes && (
        <div className="space-y-2">
          {Object.entries(hashes).map(([algo, hash]) => (
            <div
              key={algo}
              className="flex items-center justify-between rounded-md border p-2"
            >
              <span className="text-sm font-medium">{algo}</span>
              <div className="flex items-center gap-2">
                <code className="break-all text-xs">{hash}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigator.clipboard.writeText(hash)}
                >
                  Copy
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
