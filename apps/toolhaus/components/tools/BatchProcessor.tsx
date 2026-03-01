"use client";

import { useCallback, useRef, useState } from "react";
import type { BatchRow, BatchToolSlug, BatchOptions } from "@/lib/tools/batch/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download } from "lucide-react";

interface BatchProcessorProps {
  toolSlug: BatchToolSlug;
  toolName: string;
  options?: BatchOptions;
  optionsForm?: React.ReactNode;
  placeholder?: string;
}

function rowsToCsv(rows: BatchRow[]): string {
  if (rows.length === 0) return "";
  const cols = Object.keys(rows[0]);
  const header = cols.join(",");
  const escape = (v: string) => {
    const s = String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const body = rows.map((r) => cols.map((c) => escape(r[c] ?? "")).join(",")).join("\n");
  return `${header}\n${body}`;
}

function rowsToJson(rows: BatchRow[]): string {
  return JSON.stringify(rows, null, 2);
}

export function BatchProcessor({
  toolSlug,
  toolName,
  options = {},
  optionsForm,
  placeholder = "Enter one item per line...",
}: BatchProcessorProps) {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<BatchRow[] | null>(null);
  const [progress, setProgress] = useState<{ processed: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  const process = useCallback(() => {
    const lines = input.split(/\r?\n/).filter((l) => l.trim() !== "");
    if (lines.length === 0) {
      setError("Enter at least one line");
      return;
    }
    setError(null);
    setResults(null);
    setRunning(true);
    setProgress({ processed: 0, total: lines.length });

    try {
      const worker = new Worker(
        new URL("../../workers/batch-processor.worker.ts", import.meta.url)
      );
      workerRef.current = worker;

      worker.onmessage = (e: MessageEvent) => {
        const msg = e.data;
        if (msg.type === "progress") {
          setProgress({ processed: msg.processed, total: msg.total });
        } else if (msg.type === "complete") {
          setResults(msg.results);
          setProgress(null);
          setRunning(false);
          worker.terminate();
          workerRef.current = null;
        } else if (msg.type === "error") {
          setError(msg.message);
          setProgress(null);
          setRunning(false);
          worker.terminate();
          workerRef.current = null;
        }
      };

      worker.onerror = (err) => {
        setError(err.message ?? "Worker error");
        setProgress(null);
        setRunning(false);
        workerRef.current = null;
      };

      worker.postMessage({
        type: "start",
        toolSlug,
        lines,
        options,
      });
    } catch (err) {
      setError((err as Error).message);
      setProgress(null);
      setRunning(false);
    }
  }, [input, toolSlug, options]);

  const downloadCsv = useCallback(() => {
    if (!results?.length) return;
    const blob = new Blob([rowsToCsv(results)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${toolName.toLowerCase().replace(/\s+/g, "-")}-batch.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [results, toolName]);

  const downloadJson = useCallback(() => {
    if (!results?.length) return;
    const blob = new Blob([rowsToJson(results)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${toolName.toLowerCase().replace(/\s+/g, "-")}-batch.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [results, toolName]);

  return (
    <div className="space-y-4">
      {optionsForm}
      <div>
        <label className="mb-1 block text-sm font-medium">Input (one per line)</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={running}
          className="h-48 w-full rounded-md border bg-muted/30 p-3 font-mono text-sm"
          placeholder={placeholder}
          spellCheck={false}
        />
      </div>
      <Button onClick={process} disabled={running || !input.trim()}>
        {running ? "Processing…" : "Process"}
      </Button>

      {progress && (
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>
              {progress.processed} / {progress.total}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{
                width: `${(progress.processed / progress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {results && results.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium">Results ({results.length} rows)</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={downloadCsv}>
                  <Download className="h-4 w-4" />
                  CSV
                </Button>
                <Button size="sm" variant="outline" onClick={downloadJson}>
                  <Download className="h-4 w-4" />
                  JSON
                </Button>
              </div>
            </div>
            <div className="max-h-80 overflow-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/80">
                  <tr>
                    {Object.keys(results[0]).map((k) => (
                      <th key={k} className="border-b px-3 py-2 text-left font-medium">
                        {k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, i) => (
                    <tr key={i} className="border-b last:border-0">
                      {Object.keys(row).map((k) => (
                        <td
                          key={k}
                          className="max-w-48 truncate px-3 py-2 font-mono text-xs"
                          title={String(row[k])}
                        >
                          {String(row[k])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
