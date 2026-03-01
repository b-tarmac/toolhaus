"use client";

import { useMemo, useState } from "react";
import { parseAsStringLiteral, parseAsString, useQueryState } from "nuqs";
import type { ToolProps } from "@portfolio/tool-sdk";
import { csvToJson, jsonToCsv } from "@/lib/tools/csv-json";

const modeParser = parseAsStringLiteral(["csv2json", "json2csv"]).withDefault("csv2json");
const inputParser = parseAsString.withDefault("name,age,city\nAlice,30,NYC\nBob,25,LA");
const delimParser = parseAsString.withDefault(",");

export default function CsvJsonConverter(_props: ToolProps) {
  const [mode, setMode] = useQueryState("mode", modeParser);
  const [input, setInput] = useQueryState("input", inputParser);
  const [delimiter, setDelimiter] = useQueryState("delim", delimParser);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const result = useMemo(() => {
    if (mode === "csv2json") return csvToJson(input, delimiter);
    return jsonToCsv(input);
  }, [mode, input, delimiter]);

  const rows = (result.metadata?.rows ?? []) as Record<string, unknown>[];
  const headers = (result.metadata?.headers ?? []) as string[];
  const sortedRows = useMemo(() => {
    if (!sortKey || rows.length === 0) return rows;
    return [...rows].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      const cmp = String(va ?? "").localeCompare(String(vb ?? ""));
      return sortAsc ? cmp : -cmp;
    });
  }, [rows, sortKey, sortAsc]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode("csv2json")}
          className={`rounded-md px-3 py-1.5 text-sm ${
            mode === "csv2json" ? "bg-primary text-primary-foreground" : "border"
          }`}
        >
          CSV → JSON
        </button>
        <button
          type="button"
          onClick={() => setMode("json2csv")}
          className={`rounded-md px-3 py-1.5 text-sm ${
            mode === "json2csv" ? "bg-primary text-primary-foreground" : "border"
          }`}
        >
          JSON → CSV
        </button>
        {mode === "csv2json" && (
          <div className="flex items-center gap-2">
            <label className="text-sm">Delimiter:</label>
            <input
              type="text"
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              className="w-12 rounded-md border px-2 py-1 text-sm font-mono"
              maxLength={1}
            />
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">
            {mode === "csv2json" ? "CSV" : "JSON"}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-64 w-full rounded-md border bg-muted/30 p-3 font-mono text-sm"
            placeholder={mode === "csv2json" ? "name,age\nAlice,30" : '[{"name":"Alice"}]'}
            spellCheck={false}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            {mode === "csv2json" ? "JSON" : "CSV"}
          </label>
          <div className="h-64 overflow-auto rounded-md border bg-muted/30 p-3 font-mono text-sm">
            {result.error ? (
              <span className="text-destructive">{result.error.message}</span>
            ) : (
              <pre className="whitespace-pre-wrap break-words">
                {mode === "csv2json"
                  ? result.output
                  : result.output}
              </pre>
            )}
          </div>
        </div>
      </div>

      {mode === "csv2json" && sortedRows.length > 0 && (
        <div>
          <label className="mb-1 block text-sm font-medium">Table view</label>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  {headers.map((h) => (
                    <th
                      key={h}
                      className="cursor-pointer px-3 py-2 text-left font-medium"
                      onClick={() => {
                        setSortKey(sortKey === h ? null : h);
                        if (sortKey === h) setSortAsc((a) => !a);
                      }}
                    >
                      {h} {sortKey === h && (sortAsc ? "↑" : "↓")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    {headers.map((h) => (
                      <td key={h} className="px-3 py-2">
                        {String(row[h] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
