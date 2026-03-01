"use client";

import { useMemo } from "react";
import { parseAsString, useQueryState } from "nuqs";
import type { ToolProps } from "@portfolio/tool-sdk";
import { convertBase } from "@/lib/tools/number-base";
import { Input } from "@/components/ui/input";

const valueParser = parseAsString.withDefault("0");

export default function NumberBaseConverter(_props: ToolProps) {
  const [decimalStr, setDecimalStr] = useQueryState("value", valueParser);

  const result = useMemo(() => {
    const d = parseInt(decimalStr, 10);
    if (isNaN(d) || decimalStr.trim() === "") return null;
    return convertBase(decimalStr, 10);
  }, [decimalStr]);

  const updateFromBase = (base: number, val: string) => {
    const num = parseInt(val, base);
    if (!isNaN(num) || val === "") setDecimalStr(val === "" ? "0" : num.toString(10));
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Binary</label>
          <Input
            value={result?.binary ?? ""}
            onChange={(e) => updateFromBase(2, e.target.value)}
            className="font-mono"
            placeholder="0"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Octal</label>
          <Input
            value={result?.octal ?? ""}
            onChange={(e) => updateFromBase(8, e.target.value)}
            className="font-mono"
            placeholder="0"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Decimal</label>
          <Input
            value={decimalStr}
            onChange={(e) => setDecimalStr(e.target.value)}
            className="font-mono"
            placeholder="0"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Hexadecimal</label>
          <Input
            value={result?.hex ?? ""}
            onChange={(e) => updateFromBase(16, e.target.value)}
            className="font-mono"
            placeholder="0"
          />
        </div>
      </div>
      {result && (
        <p className="text-sm text-muted-foreground">
          {result.binary.length}-bit binary representation
        </p>
      )}
    </div>
  );
}
