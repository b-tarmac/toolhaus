import type { ToolResult } from "@portfolio/tool-sdk";

export interface JwtParts {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  raw: { header: string; payload: string; sig: string };
}

export interface JwtResult extends ToolResult {
  metadata?: {
    parts: JwtParts;
    expired: boolean;
    exp?: number;
  };
}

function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
  try {
    return decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch {
    return "";
  }
}

export function decodeJwt(token: string): JwtResult {
  if (!token.trim()) {
    return {
      output: "",
      isValid: true,
      metadata: {
        parts: { header: {}, payload: {}, signature: "", raw: { header: "", payload: "", sig: "" } },
        expired: false,
      },
    };
  }

  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    return {
      output: "",
      isValid: false,
      error: { message: "Invalid JWT: expected 3 parts" },
    };
  }

  try {
    const headerJson = base64UrlDecode(parts[0]);
    const payloadJson = base64UrlDecode(parts[1]);
    const header = JSON.parse(headerJson || "{}") as Record<string, unknown>;
    const payload = JSON.parse(payloadJson || "{}") as Record<string, unknown>;
    const exp = payload.exp as number | undefined;
    const expired = exp ? Date.now() / 1000 > exp : false;

    return {
      output: JSON.stringify({ header, payload }, null, 2),
      isValid: true,
      metadata: {
        parts: {
          header,
          payload,
          signature: parts[2],
          raw: { header: parts[0], payload: parts[1], sig: parts[2] },
        },
        expired,
        exp,
      },
    };
  } catch (e) {
    const err = e as Error;
    return {
      output: "",
      isValid: false,
      error: { message: err.message },
    };
  }
}
