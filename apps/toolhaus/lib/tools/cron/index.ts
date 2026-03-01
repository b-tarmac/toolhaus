import cronstrue from "cronstrue";
import * as cronParser from "cron-parser";
import type { ToolResult } from "@portfolio/tool-sdk";

export interface CronResult extends ToolResult {
  metadata?: {
    description: string;
    nextRuns: string[];
    error?: string;
  };
}

export function parseCron(expression: string): CronResult {
  if (!expression.trim()) {
    return {
      output: "",
      isValid: true,
      metadata: { description: "", nextRuns: [] },
    };
  }

  try {
    const desc = cronstrue.toString(expression);
    const interval = cronParser.parseExpression(expression);
    const nextRuns: string[] = [];
    for (let i = 0; i < 5; i++) {
      nextRuns.push(interval.next().toDate().toISOString());
    }

    return {
      output: desc,
      isValid: true,
      metadata: { description: desc, nextRuns },
    };
  } catch (e) {
    const err = e as Error;
    return {
      output: "",
      isValid: false,
      error: { message: err.message },
      metadata: { description: "", nextRuns: [], error: err.message },
    };
  }
}
