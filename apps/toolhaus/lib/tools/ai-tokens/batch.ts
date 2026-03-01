import { getEncoding } from "js-tiktoken";

export interface LlmTokenBatchOptions {
  encoding?: string;
}

export function processLlmTokenBatch(
  input: string,
  options: LlmTokenBatchOptions = {}
): { input: string; output: string } {
  const encoding = (options.encoding ?? "cl100k_base") as "cl100k_base" | "o200k_base";
  const trimmed = input.trim();
  if (!trimmed) {
    return { input: "", output: "0" };
  }
  try {
    const enc = getEncoding(encoding);
    const tokens = enc.encode(trimmed);
    return {
      input: trimmed,
      output: String(tokens.length),
    };
  } catch (e) {
    return {
      input: trimmed,
      output: `Error: ${(e as Error).message}`,
    };
  }
}
