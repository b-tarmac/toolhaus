import type { ToolResult } from "@toolhaus/tool-sdk";

export interface EnvIssue {
  type: "duplicate" | "invalid_case" | "invalid_format";
  key: string;
  line?: number;
  message: string;
}

export interface EnvResult extends ToolResult {
  metadata?: {
    valid: boolean;
    issues: EnvIssue[];
    entries: Array<{ key: string; value: string; masked: string }>;
  };
}

const UPPER_SNAKE = /^[A-Z][A-Z0-9_]*$/;

function parseEnv(content: string): Array<{ key: string; value: string; line: number }> {
  const entries: Array<{ key: string; value: string; line: number }> = [];
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (key) entries.push({ key, value, line: i + 1 });
  }
  return entries;
}

export function validateEnv(content: string): EnvResult {
  if (!content.trim()) {
    return {
      output: "✓ No issues found",
      isValid: true,
      metadata: { valid: true, issues: [], entries: [] },
    };
  }

  const entries = parseEnv(content);
  const issues: EnvIssue[] = [];
  const seen = new Map<string, number>();

  for (const e of entries) {
    if (seen.has(e.key)) {
      issues.push({
        type: "duplicate",
        key: e.key,
        line: e.line,
        message: `Duplicate key "${e.key}" (first at line ${seen.get(e.key)})`,
      });
    } else {
      seen.set(e.key, e.line);
    }
    if (!UPPER_SNAKE.test(e.key)) {
      issues.push({
        type: "invalid_case",
        key: e.key,
        line: e.line,
        message: `Key "${e.key}" should be UPPER_SNAKE_CASE`,
      });
    }
  }

  const maskedEntries = entries.map((e) => ({
    key: e.key,
    value: e.value,
    masked: e.value ? "****" : "(empty)",
  }));

  const valid = issues.length === 0;
  const output = valid
    ? "✓ No issues found"
    : issues.map((i) => `Line ${i.line}: ${i.message}`).join("\n");

  return {
    output,
    isValid: valid,
    metadata: { valid, issues, entries: maskedEntries },
  };
}
