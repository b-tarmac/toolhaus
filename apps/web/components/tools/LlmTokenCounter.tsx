"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { parseAsString, useQueryState } from "nuqs";
import type { ToolProps } from "@toolhaus/tool-sdk";
import { Card, CardContent } from "@/components/ui/card";

const inputParser = parseAsString.withDefault("");
const modelParser = parseAsString.withDefault("gpt-4.1-mini");

interface ModelInfo {
  id: string;
  encoding: string;
  contextWindow: number;
  inputPer1M: number;
  outputPer1M: number;
}

interface ModelPricing {
  lastUpdated: string;
  models: ModelInfo[];
}

const PROVIDER_ORDER = ["OpenAI", "Anthropic", "Google"] as const;

function getProvider(id: string): string {
  if (id.startsWith("gpt-") || id.startsWith("o1") || id.startsWith("o3") || id.startsWith("o4")) return "OpenAI";
  if (id.startsWith("claude-")) return "Anthropic";
  if (id.startsWith("gemini-")) return "Google";
  return "Other";
}

function formatContextWindow(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

const DEBOUNCE_MS = 150;

export default function LlmTokenCounter(_props: ToolProps) {
  const [input, setInput] = useQueryState("input", inputParser);
  const [modelId, setModelId] = useQueryState("model", modelParser);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [tokenCount, setTokenCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    fetch("/data/model-pricing.json")
      .then((r) => r.json())
      .then((data: ModelPricing) => setModels(data.models))
      .catch(() => setModels([]));
  }, []);

  const countTokens = useCallback((text: string, encoding: string) => {
    if (!text.trim()) {
      setTokenCount(null);
      setError(null);
      return;
    }

    if (!workerRef.current) {
      try {
        workerRef.current = new Worker(
          new URL("../../lib/tools/ai-tokens/worker.ts", import.meta.url)
        );
      } catch (err) {
        setError("Worker failed to load. Token counting unavailable.");
        return;
      }
    }

    const id = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    workerRef.current.onmessage = (e: MessageEvent) => {
      if (e.data.requestId !== id) return;
      setLoading(false);
      if (e.data.success) {
        setTokenCount(e.data.tokenCount);
      } else {
        setError(e.data.error ?? "Token count failed");
      }
    };

    workerRef.current.postMessage({
      text,
      encoding,
      requestId: id,
    });
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!input.trim()) {
      setTokenCount(null);
      setError(null);
      setLoading(false);
      return;
    }

    const model = models.find((m) => m.id === modelId) ?? models[0];
    const encoding = model?.encoding ?? "cl100k_base";

    debounceRef.current = setTimeout(() => {
      countTokens(input, encoding);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, modelId, models, countTokens]);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const selectedModel = models.find((m) => m.id === modelId) ?? models[0];
  const groupedModels = models.reduce<Record<string, ModelInfo[]>>((acc, m) => {
    const p = getProvider(m.id);
    if (!acc[p]) acc[p] = [];
    acc[p].push(m);
    return acc;
  }, {});

  const sortedGroups = PROVIDER_ORDER.filter((p) => groupedModels[p]?.length);

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Model</label>
        <select
          value={modelId}
          onChange={(e) => setModelId(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          {sortedGroups.map((provider) => (
            <optgroup key={provider} label={provider}>
              {groupedModels[provider]?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id} ({formatContextWindow(m.contextWindow)} ctx)
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Text</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-40 w-full rounded-md border bg-muted/30 p-3 font-mono text-sm"
          placeholder="Paste or type text to count tokens..."
          spellCheck={false}
        />
      </div>

      {selectedModel && input.trim() && (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tokens</span>
                <span className="font-mono text-lg">
                  {loading ? "…" : error ? "—" : tokenCount?.toLocaleString() ?? "—"}
                </span>
              </div>

              {selectedModel && (
                <div>
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>Context window</span>
                    <span>
                      {(tokenCount ?? 0).toLocaleString()} /{" "}
                      {formatContextWindow(selectedModel.contextWindow)}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          ((tokenCount ?? 0) / selectedModel.contextWindow) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {models.length > 0 && input.trim() && !loading && !error && tokenCount != null && (
        <Card>
          <CardContent className="pt-4">
            <h3 className="mb-3 text-sm font-medium">Cross-model comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4">Model</th>
                    <th className="pb-2 pr-4">Context</th>
                    <th className="pb-2">% used</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((m) => {
                    const pct =
                      (tokenCount / m.contextWindow) * 100;
                    return (
                      <tr key={m.id} className="border-b last:border-0">
                        <td className="py-2 pr-4 font-mono">{m.id}</td>
                        <td className="py-2 pr-4 text-muted-foreground">
                          {formatContextWindow(m.contextWindow)}
                        </td>
                        <td className="py-2">
                          {pct < 100 ? (
                            <span>{pct.toFixed(1)}%</span>
                          ) : (
                            <span className="text-destructive">
                              Exceeds ({pct.toFixed(0)}%)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
