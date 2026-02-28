"use client";

import { useCallback, useState } from "react";
import { parseAsStringLiteral, parseAsString, useQueryState } from "nuqs";
import type { ToolProps } from "@toolhaus/tool-sdk";
import { generateIds, type IdType } from "@/lib/tools/uuid";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

const typeParser = parseAsStringLiteral(["uuid-v4", "ulid", "nanoid"]).withDefault("uuid-v4");
const countParser = parseAsString.withDefault("1");
const uppercaseParser = parseAsStringLiteral(["true", "false"]).withDefault("false");

const MAX_FREE = 100;
const MAX_PRO = 10000;

export default function UuidGenerator(props: ToolProps) {
  const { user } = useAuth();
  const isPro = user?.publicMetadata?.plan === "pro";
  const maxCount = isPro ? MAX_PRO : MAX_FREE;

  const [type, setType] = useQueryState("type", typeParser);
  const [count, setCount] = useQueryState("count", countParser);
  const [uppercase, setUppercase] = useQueryState("uppercase", uppercaseParser);

  const countNum = Math.min(Math.max(1, parseInt(count, 10) || 1), maxCount);
  const genIds = useCallback(
    () =>
      generateIds(type as IdType, {
        count: countNum,
        uppercase: uppercase === "true",
      }),
    [type, countNum, uppercase]
  );

  const [currentIds, setCurrentIds] = useState<string[]>([]);

  const refresh = useCallback(() => {
    setCurrentIds(genIds());
  }, [genIds]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["uuid-v4", "ulid", "nanoid"] as const).map((t) => (
          <Button
            key={t}
            variant={type === t ? "default" : "outline"}
            size="sm"
            onClick={() => setType(t)}
          >
            {t === "uuid-v4" ? "UUID v4" : t === "ulid" ? "ULID" : "NanoID"}
          </Button>
        ))}
        <input
          type="number"
          min={1}
          max={maxCount}
          value={count}
          onChange={(e) => setCount(e.target.value)}
          className="w-20 rounded-md border px-2 py-1 text-sm"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={uppercase === "true"}
            onChange={(e) => setUppercase(e.target.checked ? "true" : "false")}
          />
          Uppercase
        </label>
        <Button size="sm" onClick={refresh}>
          {currentIds.length ? "Regenerate" : "Generate"}
        </Button>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Output</label>
        <textarea
          value={currentIds.join("\n")}
          readOnly
          className="h-48 w-full rounded-md border bg-muted/30 p-3 font-mono text-sm"
        />
        <Button
          size="sm"
          variant="outline"
          className="mt-2"
          onClick={() => navigator.clipboard.writeText(currentIds.join("\n"))}
        >
          Copy all
        </Button>
      </div>
    </div>
  );
}
