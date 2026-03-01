import type { ToolResult } from "@portfolio/tool-sdk";

function extractLineFromError(msg: string): number | undefined {
  const m = msg.match(/line (\d+)/i);
  return m ? Number(m[1]) : undefined;
}

export function processJson(
  input: string,
  options: {
    mode: "format" | "minify" | "validate";
    indent: "2" | "4" | "tab";
  }
): ToolResult {
  if (!input.trim()) return { output: "", isValid: true };
  try {
    const parsed = JSON.parse(input);
    if (options.mode === "minify")
      return { output: JSON.stringify(parsed), isValid: true };
    if (options.mode === "validate")
      return {
        output: "✓ Valid JSON",
        isValid: true,
        metadata: { type: typeof parsed },
      };
    const indentChar = options.indent === "tab" ? "\t" : Number(options.indent);
    return {
      output: JSON.stringify(parsed, null, indentChar),
      isValid: true,
    };
  } catch (e: unknown) {
    const err = e as Error;
    return {
      output: "",
      isValid: false,
      error: {
        message: err.message,
        line: extractLineFromError(err.message),
      },
    };
  }
}
