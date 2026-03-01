import yaml from "js-yaml";
import * as TOML from "@iarna/toml";
import type { ToolResult } from "@portfolio/tool-sdk";

export type Format = "json" | "yaml" | "toml";

export function convertFormat(
  input: string,
  from: Format,
  to: Format
): ToolResult {
  if (!input.trim()) return { output: "", isValid: true };

  try {
    let obj: unknown;
    if (from === "json") {
      obj = JSON.parse(input);
    } else if (from === "yaml") {
      obj = yaml.load(input);
    } else {
      obj = TOML.parse(input);
    }

    if (to === "json") {
      return { output: JSON.stringify(obj, null, 2), isValid: true };
    }
    if (to === "yaml") {
      return { output: yaml.dump(obj, { indent: 2 }), isValid: true };
    }
    return { output: TOML.stringify(obj as Record<string, unknown>), isValid: true };
  } catch (e) {
    const err = e as Error;
    return {
      output: "",
      isValid: false,
      error: { message: err.message },
    };
  }
}

export function detectFormat(input: string): Format {
  const t = input.trim();
  if (t.startsWith("{") || t.startsWith("[")) return "json";
  if (t.includes("=") && /^[a-zA-Z0-9_-]+\s*=/.test(t)) return "toml";
  return "yaml";
}
