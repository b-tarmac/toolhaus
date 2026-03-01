import { validate as validateOpenApiSpec } from "@readme/openapi-parser";
import type { ToolResult } from "@portfolio/tool-sdk";

export interface OpenApiError {
  message: string;
  path?: string;
  line?: number;
}

export interface OpenApiResult extends ToolResult {
  metadata?: {
    valid: boolean;
    errors: OpenApiError[];
    spec?: unknown;
  };
}

export async function validateOpenApi(input: string): Promise<OpenApiResult> {
  if (!input.trim()) {
    return {
      output: "✓ Valid",
      isValid: true,
      metadata: { valid: true, errors: [] },
    };
  }

  let spec: unknown;
  try {
    spec = JSON.parse(input);
  } catch {
    try {
      const yaml = await import("js-yaml");
      spec = yaml.load(input);
    } catch {
      return {
        output: "",
        isValid: false,
        error: { message: "Invalid JSON or YAML" },
        metadata: { valid: false, errors: [{ message: "Invalid JSON or YAML" }] },
      };
    }
  }

  const errors: OpenApiError[] = [];

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await validateOpenApiSpec(spec as any);
  } catch (e: unknown) {
    const err = e as Error & { path?: string[] };
    errors.push({
      message: err.message || "Validation failed",
      path: Array.isArray(err.path) ? err.path.join(".") : undefined,
    });
  }

  const valid = errors.length === 0;
  const output = valid
    ? "✓ Valid OpenAPI/JSON Schema"
    : errors.map((e) => (e.path ? `${e.path}: ` : "") + e.message).join("\n");

  return {
    output,
    isValid: valid,
    metadata: { valid, errors, spec },
  };
}
