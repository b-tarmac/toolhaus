"use client";

import { useMemo } from "react";
import { parseAsStringLiteral, parseAsString, useQueryState } from "nuqs";
import type { ToolProps } from "@toolhaus/tool-sdk";
import { generateLorem } from "@/lib/tools/lorem";
import { Button } from "@/components/ui/button";

const typeParser = parseAsStringLiteral(["paragraphs", "sentences", "words", "bytes"]).withDefault("paragraphs");
const countParser = parseAsString.withDefault("3");
const modeParser = parseAsStringLiteral(["classic", "developer"]).withDefault("classic");
const startWithLoremParser = parseAsStringLiteral(["true", "false"]).withDefault("true");

export default function LoremIpsumGenerator(_props: ToolProps) {
  const [type, setType] = useQueryState("type", typeParser);
  const [count, setCount] = useQueryState("count", countParser);
  const [mode, setMode] = useQueryState("mode", modeParser);
  const [startWithLorem, setStartWithLorem] = useQueryState("startWithLorem", startWithLoremParser);

  const countNum = Math.min(Math.max(1, parseInt(count, 10) || 1), 100);
  const output = useMemo(
    () =>
      generateLorem({
        type,
        count: countNum,
        mode,
        startWithLorem: startWithLorem === "true",
      }),
    [type, countNum, mode, startWithLorem]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["paragraphs", "sentences", "words", "bytes"] as const).map((t) => (
          <Button
            key={t}
            variant={type === t ? "default" : "outline"}
            size="sm"
            onClick={() => setType(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Button>
        ))}
        <input
          type="number"
          min={1}
          max={100}
          value={count}
          onChange={(e) => setCount(e.target.value)}
          className="w-16 rounded-md border px-2 py-1 text-sm"
        />
        <Button
          variant={mode === "classic" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("classic")}
        >
          Classic
        </Button>
        <Button
          variant={mode === "developer" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("developer")}
        >
          Developer
        </Button>
        {mode === "classic" && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={startWithLorem === "true"}
              onChange={(e) =>
                setStartWithLorem(e.target.checked ? "true" : "false")
              }
            />
            Start with Lorem ipsum
          </label>
        )}
      </div>
      <div>
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigator.clipboard.writeText(output)}
          >
            Copy
          </Button>
        </div>
        <textarea
          value={output}
          readOnly
          className="mt-2 h-64 w-full rounded-md border bg-muted/30 p-3 text-sm"
        />
      </div>
    </div>
  );
}
