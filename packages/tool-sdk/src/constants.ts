export const TOOL_CATEGORIES = [
  "data-formats",
  "encoding",
  "generators",
  "date-time",
  "web",
  "security",
  "text",
  "devops",
  "design",
  "ai-era",
  "code",
  "math",
] as const;

/** Context menu ID → tool slug mapping for the browser extension */
export const CONTEXT_MENU_TOOLS: Record<string, string> = {
  "decode-base64": "base64-tool",
  "convert-timestamp": "timestamp-converter",
  "format-json": "json-formatter",
  "count-tokens": "llm-token-counter",
  "decode-jwt": "jwt-decoder",
  "convert-color": "color-converter",
  "hash-sha256": "hash-generator",
};

export const CATEGORY_LABELS: Record<string, string> = {
  "data-formats": "Data Formats",
  encoding: "Encoding",
  generators: "Generators",
  "date-time": "Date & Time",
  web: "Web",
  security: "Security",
  text: "Text",
  devops: "DevOps",
  design: "Design",
  "ai-era": "AI Era",
  code: "Code",
  math: "Math",
};

/** EasyBiscuit tool categories */
export const EASYBISCUIT_CATEGORIES = [
  "business",
  "calculators",
  "pdf",
  "image",
  "writing",
] as const;

export const EASYBISCUIT_CATEGORY_LABELS: Record<string, string> = {
  business: "Business",
  calculators: "Calculators",
  pdf: "PDF",
  image: "Image",
  writing: "Writing",
};
