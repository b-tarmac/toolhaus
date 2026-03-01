import type { ToolResult } from "@portfolio/tool-sdk";

function jsonToInterface(
  obj: unknown,
  rootName: string,
  optional: boolean
): string {
  if (obj === null) return "null";
  if (typeof obj === "boolean") return "boolean";
  if (typeof obj === "number") return "number";
  if (typeof obj === "string") return "string";

  if (Array.isArray(obj)) {
    const item = obj[0];
    const itemType = item !== undefined
      ? jsonToInterface(item, "Item", optional)
      : "unknown";
    return `${itemType}[]`;
  }

  if (typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, unknown>);
    const lines = entries.map(([k, v]) => {
      const opt = optional ? "?" : "";
      const type = jsonToInterface(v, k, optional);
      return `  ${k}${opt}: ${type};`;
    });
    return `{\n${lines.join("\n")}\n}`;
  }

  return "unknown";
}

export function generateTypeScript(
  json: string,
  rootName: string,
  optional: boolean
): ToolResult {
  if (!json.trim()) return { output: "", isValid: true };

  try {
    const obj = JSON.parse(json);
    const body = jsonToInterface(obj, rootName, optional);
    const output = `interface ${rootName} ${body}`;
    return { output, isValid: true };
  } catch (e) {
    const err = e as Error;
    return {
      output: "",
      isValid: false,
      error: { message: err.message },
    };
  }
}
