"use client";

import { useEffect, useMemo, useState } from "react";
import {
  parseAsString,
  parseAsInteger,
  useQueryState,
} from "nuqs";
import type { ToolProps } from "@toolhaus/tool-sdk";
import {
  calculateCost,
  calculateBudgetReverse,
  type ModelConfig,
} from "@/lib/tools/ai-cost";
import { Card, CardContent } from "@/components/ui/card";

const modelParser = parseAsString.withDefault("gpt-4o-mini");
const inputTokensParser = parseAsInteger.withDefault(1000);
const outputTokensParser = parseAsInteger.withDefault(250);
const requestsParser = parseAsInteger.withDefault(100);
const budgetParser = parseAsInteger.withDefault(50);

interface ModelPricing {
  lastUpdated: string;
  models: ModelConfig[];
}

const PROVIDER_ORDER = ["OpenAI", "Anthropic", "Google"] as const;

function getProvider(id: string): string {
  if (id.startsWith("gpt-") || id.startsWith("o1") || id.startsWith("o3"))
    return "OpenAI";
  if (id.startsWith("claude-")) return "Anthropic";
  if (id.startsWith("gemini-")) return "Google";
  return "Other";
}

function formatCost(c: number): string {
  if (c >= 1) return `$${c.toFixed(2)}`;
  if (c >= 0.01) return `$${c.toFixed(4)}`;
  if (c >= 0.0001) return `$${c.toFixed(6)}`;
  return c > 0 ? `$${c.toExponential(2)}` : "$0.00";
}

export default function AiCostCalculator(_props: ToolProps) {
  const [modelId, setModelId] = useQueryState("model", modelParser);
  const [inputTokens, setInputTokens] = useQueryState(
    "input",
    inputTokensParser
  );
  const [outputTokens, setOutputTokens] = useQueryState(
    "output",
    outputTokensParser
  );
  const [requestsPerDay, setRequestsPerDay] = useQueryState(
    "requests",
    requestsParser
  );
  const [budgetPerMonth, setBudgetPerMonth] = useQueryState(
    "budget",
    budgetParser
  );
  const [models, setModels] = useState<ModelConfig[]>([]);

  useEffect(() => {
    fetch("/data/model-pricing.json")
      .then((r) => r.json())
      .then((data: ModelPricing) => setModels(data.models))
      .catch(() => setModels([]));
  }, []);

  const selectedModel = models.find((m) => m.id === modelId) ?? models[0];
  const costResult = useMemo(() => {
    if (!selectedModel || inputTokens < 0 || outputTokens < 0 || requestsPerDay < 0)
      return null;
    return calculateCost({
      inputTokens,
      outputTokens,
      model: selectedModel,
      requests: requestsPerDay,
    });
  }, [selectedModel, inputTokens, outputTokens, requestsPerDay]);

  const budgetResult = useMemo(() => {
    if (!selectedModel || budgetPerMonth <= 0) return null;
    return calculateBudgetReverse({
      model: selectedModel,
      budgetPerMonth,
      inputTokensPerRequest: inputTokens,
      outputTokensPerRequest: outputTokens,
    });
  }, [selectedModel, budgetPerMonth, inputTokens, outputTokens]);

  const groupedModels = models.reduce<Record<string, ModelConfig[]>>(
    (acc, m) => {
      const p = getProvider(m.id);
      if (!acc[p]) acc[p] = [];
      acc[p].push(m);
      return acc;
    },
    {}
  );
  const sortedGroups = PROVIDER_ORDER.filter((p) => groupedModels[p]?.length);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
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
                    {m.id}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          <h3 className="mb-4 text-sm font-medium">Cost calculator</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Input tokens
              </label>
              <input
                type="number"
                min={0}
                value={inputTokens}
                onChange={(e) =>
                  setInputTokens(Math.max(0, parseInt(e.target.value, 10) || 0))
                }
                className="w-full rounded-md border px-3 py-2 font-mono text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Output tokens
              </label>
              <input
                type="number"
                min={0}
                value={outputTokens}
                onChange={(e) =>
                  setOutputTokens(Math.max(0, parseInt(e.target.value, 10) || 0))
                }
                className="w-full rounded-md border px-3 py-2 font-mono text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Requests per day
              </label>
              <input
                type="number"
                min={0}
                value={requestsPerDay}
                onChange={(e) =>
                  setRequestsPerDay(
                    Math.max(0, parseInt(e.target.value, 10) || 0)
                  )
                }
                className="w-full rounded-md border px-3 py-2 font-mono text-sm"
              />
            </div>
          </div>

          {costResult && (
            <div className="mt-4 grid gap-4 rounded-lg bg-muted/30 p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Per request</p>
                <p className="font-mono text-lg">
                  {formatCost(costResult.perRequest.total)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Per day</p>
                <p className="font-mono text-lg">
                  {formatCost(costResult.perDay.total)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Per month (30d)</p>
                <p className="font-mono text-lg">
                  {formatCost(costResult.perMonth.total)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <h3 className="mb-4 text-sm font-medium">Budget reverse calculator</h3>
          <p className="mb-3 text-xs text-muted-foreground">
            How many requests can you afford with your monthly budget?
          </p>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[120px]">
              <label className="mb-1 block text-xs text-muted-foreground">
                Monthly budget ($)
              </label>
              <input
                type="number"
                min={1}
                value={budgetPerMonth}
                onChange={(e) =>
                  setBudgetPerMonth(
                    Math.max(1, parseInt(e.target.value, 10) || 1)
                  )
                }
                className="w-full rounded-md border px-3 py-2 font-mono text-sm"
              />
            </div>
          </div>

          {budgetResult && (
            <div className="mt-4 space-y-2 rounded-lg bg-muted/30 p-4">
              <p className="text-sm">
                With{" "}
                <span className="font-mono">
                  {inputTokens.toLocaleString()} in / {outputTokens.toLocaleString()}{" "}
                  out
                </span>{" "}
                per request:
              </p>
              <p className="font-mono text-lg">
                ~{budgetResult.requestsPerMonth.toLocaleString()} requests/month
              </p>
              <p className="text-xs text-muted-foreground">
                Cost per request: {formatCost(budgetResult.costPerRequest)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
