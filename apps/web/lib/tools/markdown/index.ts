import { marked } from "marked";
import type { ToolResult } from "@toolhaus/tool-sdk";

export function markdownToHtml(input: string): ToolResult {
  try {
    const html = marked.parse(input, { async: false }) as string;
    return { output: html, isValid: true };
  } catch (e: unknown) {
    return {
      output: "",
      isValid: false,
      error: { message: (e as Error).message },
    };
  }
}
