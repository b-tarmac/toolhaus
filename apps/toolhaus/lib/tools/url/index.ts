import type { ToolResult } from "@portfolio/tool-sdk";

export function encodeUrl(input: string, full: boolean): ToolResult {
  try {
    return {
      output: full ? encodeURIComponent(input) : encodeURI(input),
      isValid: true,
    };
  } catch (e: unknown) {
    return {
      output: "",
      isValid: false,
      error: { message: (e as Error).message },
    };
  }
}

export function decodeUrl(input: string): ToolResult {
  try {
    return { output: decodeURIComponent(input), isValid: true };
  } catch {
    try {
      return { output: decodeURI(input), isValid: true };
    } catch (e: unknown) {
      return {
        output: "",
        isValid: false,
        error: { message: "Invalid encoded string" },
      };
    }
  }
}

export function parseUrl(input: string) {
  try {
    const url = new URL(input);
    return {
      isValid: true,
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      params: Object.fromEntries(url.searchParams.entries()),
      hash: url.hash,
    };
  } catch {
    return {
      isValid: false,
      error: "Invalid URL",
      protocol: "",
      hostname: "",
      port: "",
      pathname: "",
      params: {} as Record<string, string>,
      hash: "",
    };
  }
}
