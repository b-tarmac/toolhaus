import type { ToolResult } from "@toolhaus/tool-sdk";
import { processJson } from "@/lib/tools/json";
import { encodeBase64, decodeBase64 } from "@/lib/tools/base64";
import { decodeJwt } from "@/lib/tools/jwt";
import { encodeUrl, decodeUrl } from "@/lib/tools/url";
import { markdownToHtml } from "@/lib/tools/markdown";
import { convertFormat } from "@/lib/tools/data-format";
import { generateTypeScript } from "@/lib/tools/json-to-ts";
import { testRegex } from "@/lib/tools/regex";
import { parseCron } from "@/lib/tools/cron";
import { parseColor, wcagContrast } from "@/lib/tools/color";
import { validateEnv } from "@/lib/tools/env-validator";
import { computeDiff } from "@/lib/tools/text-diff";

type ToolHandler = (
  input: string,
  options: Record<string, unknown>
) => ToolResult | Promise<ToolResult>;

const handlers: Record<string, ToolHandler> = {
  "json-formatter": (input, opts) =>
    processJson(input, {
      mode: (opts.mode as "format" | "minify" | "validate") || "format",
      indent: (opts.indent as "2" | "4" | "tab") || "2",
    }),
  "base64-tool": (input, opts) => {
    const urlSafe = opts.urlSafe === true || opts.urlSafe === "true";
    return (opts.mode as string) === "decode"
      ? decodeBase64(input, urlSafe)
      : encodeBase64(input, urlSafe);
  },
  "jwt-decoder": (input) => {
    const r = decodeJwt(input);
    if (!r.isValid) {
      const msg = typeof r.error === "object" && r.error?.message
        ? r.error.message
        : "Invalid JWT";
      return { output: "", isValid: false, error: { message: msg } };
    }
    const parts = r.metadata?.parts;
    return {
      output: JSON.stringify(
        {
          header: parts?.header ?? {},
          payload: parts?.payload ?? {},
          signature: parts?.signature ?? "",
        },
        null,
        2
      ),
      isValid: true,
    };
  },
  "url-tool": (input, opts) => {
    const full = opts.full === true || opts.full === "true";
    return (opts.mode as string) === "decode"
      ? decodeUrl(input)
      : encodeUrl(input, full);
  },
  "markdown-preview": (input) => markdownToHtml(input),
  "data-format-converter": (input, opts) =>
    convertFormat(
      input,
      (opts.from as "json" | "yaml" | "toml") || "json",
      (opts.to as "json" | "yaml" | "toml") || "yaml"
    ),
  "json-to-typescript": (input, opts) =>
    generateTypeScript(
      input,
      (opts.rootName as string) || "Root",
      opts.optionalFields === true || opts.optionalFields === "true"
    ),
  "regex-tester": (input, opts) => {
    const r = testRegex(
      (opts.pattern as string) || "",
      input,
      (opts.flags as string) || ""
    );
    const errMsg =
      typeof r.error === "object" && r.error?.message
        ? r.error.message
        : undefined;
    return {
      output: r.isValid
        ? JSON.stringify({
            isMatch: (r.metadata?.matches?.length ?? 0) > 0,
            matches: r.metadata?.matches ?? [],
          })
        : "",
      isValid: r.isValid,
      error: errMsg ? { message: errMsg } : undefined,
    };
  },
  "cron-builder": (input) => {
    const r = parseCron(input);
    return {
      output: r.isValid
        ? JSON.stringify({
            humanReadable: r.output,
            nextRuns: r.metadata?.nextRuns ?? [],
          })
        : "",
      isValid: r.isValid,
      error: r.error ? { message: r.error.message } : undefined,
    };
  },
  "color-converter": (input, opts) => {
    if (opts.mode === "contrast" && opts.background) {
      const c = wcagContrast(input, opts.background as string);
      if (!c)
        return { output: "", isValid: false, error: { message: "Invalid colors" } };
      return {
        output: JSON.stringify({ ratio: c.ratio, aa: c.aa, aaa: c.aaa }),
        isValid: true,
      };
    }
    const r = parseColor(input);
    if (!r.isValid)
      return { output: "", isValid: false, error: { message: r.error?.message ?? "Invalid color" } };
    const fmt = r.metadata?.formats;
    return {
      output: JSON.stringify({
        hex: fmt?.hex ?? r.output,
        rgb: fmt?.rgb,
        hsl: fmt?.hsl,
        oklch: fmt?.oklch,
      }),
      isValid: true,
    };
  },
  "env-validator": (input) => {
    const r = validateEnv(input);
    const meta = r.metadata ?? { valid: true, issues: [], entries: [] };
    const summary = {
      total: meta.entries.length,
      valid: meta.issues.length === 0 ? meta.entries.length : 0,
      invalid: meta.issues.length,
    };
    return {
      output: JSON.stringify({ entries: meta.entries, summary }),
      isValid: meta.valid,
      metadata: { summary },
    };
  },
  "text-diff": (input, opts) => {
    const r = computeDiff(input, (opts.modified as string) || "");
    return {
      output: JSON.stringify({
        stats: r.metadata?.stats,
        hunks: r.metadata?.hunks,
        unified: r.metadata?.unified,
      }),
      isValid: true,
      metadata: r.metadata,
    };
  },
};

export function getToolHandler(slug: string): ToolHandler | null {
  return handlers[slug] ?? null;
}

export async function runTool(
  slug: string,
  input: string,
  options: Record<string, unknown> = {}
): Promise<ToolResult> {
  const handler = getToolHandler(slug);
  if (!handler) {
    return {
      output: "",
      isValid: false,
      error: { message: `Tool '${slug}' is not available via API` },
    };
  }
  return handler(input, options);
}
