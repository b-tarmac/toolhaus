import { encodeBase64, decodeBase64 } from "./index";

export interface Base64BatchOptions {
  mode?: "encode" | "decode";
  urlSafe?: boolean;
}

export function processBase64Batch(
  input: string,
  options: Base64BatchOptions = {}
): { input: string; output: string } {
  const mode = options.mode ?? "encode";
  const urlSafe = options.urlSafe === true;
  const trimmed = input.trim();
  if (mode === "encode") {
    const r = encodeBase64(trimmed, urlSafe);
    return { input: trimmed, output: r.isValid ? r.output : r.error?.message ?? "Error" };
  }
  const r = decodeBase64(trimmed, urlSafe);
  return { input: trimmed, output: r.isValid ? r.output : r.error?.message ?? "Error" };
}
