import { decodeJwt } from "./index";

export function processJwtBatch(input: string): { input: string; output: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { input: "", output: "" };
  }
  const result = decodeJwt(trimmed);
  if (result.isValid && result.metadata?.parts) {
    return {
      input: trimmed,
      output: JSON.stringify(result.metadata.parts.payload),
    };
  }
  return {
    input: trimmed,
    output: result.error?.message ?? "Invalid JWT",
  };
}
