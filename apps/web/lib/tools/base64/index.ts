import type { ToolResult } from "@toolhaus/tool-sdk";

export function encodeBase64(input: string, urlSafe = false): ToolResult {
  try {
    const encoded = btoa(unescape(encodeURIComponent(input)));
    const output = urlSafe
      ? encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
      : encoded;
    return { output, isValid: true };
  } catch (e: unknown) {
    return {
      output: "",
      isValid: false,
      error: { message: (e as Error).message },
    };
  }
}

export function decodeBase64(input: string, urlSafe = false): ToolResult {
  try {
    const normalised = urlSafe
      ? input
          .replace(/-/g, "+")
          .replace(/_/g, "/")
          .padEnd(input.length + ((4 - (input.length % 4)) % 4), "=")
      : input;
    return {
      output: decodeURIComponent(escape(atob(normalised))),
      isValid: true,
    };
  } catch {
    return {
      output: "",
      isValid: false,
      error: { message: "Invalid Base64 string" },
    };
  }
}

export function fileToBase64(file: File): Promise<ToolResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({ output: reader.result as string, isValid: true });
    reader.onerror = () =>
      resolve({
        output: "",
        isValid: false,
        error: { message: "Failed to read file" },
      });
    reader.readAsDataURL(file);
  });
}
