import { getApiKey, getBaseUrl } from "./config.js";

export interface ToolResponse {
  output: string;
  isValid: boolean;
  error?: { message: string };
  metadata?: Record<string, unknown>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public body?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function callTool(
  toolSlug: string,
  input: string,
  options: Record<string, unknown> = {}
): Promise<ToolResponse> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new ApiError(
      "No API key configured. Run `toolhaus auth` to set your API key."
    );
  }

  const baseUrl = getBaseUrl().replace(/\/$/, "");
  const url = `${baseUrl}/api/v1/${toolSlug}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input, options }),
  });

  const body = await res.text();
  let data: ToolResponse;
  try {
    data = JSON.parse(body) as ToolResponse;
  } catch {
    throw new ApiError(
      `Invalid response from server (${res.status})`,
      res.status,
      body
    );
  }

  if (!res.ok) {
    const errMsg =
      (data as { error?: string }).error ?? `HTTP ${res.status}`;
    throw new ApiError(errMsg, res.status, body);
  }

  return data;
}
