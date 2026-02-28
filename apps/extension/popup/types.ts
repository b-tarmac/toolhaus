export type PopupToolId =
  | "json-formatter"
  | "base64-tool"
  | "timestamp-converter"
  | "jwt-decoder"
  | "hash-generator";

export const TOOL_SHORT_NAMES: Record<PopupToolId, string> = {
  "json-formatter": "JSON",
  "base64-tool": "Base64",
  "timestamp-converter": "Time",
  "jwt-decoder": "JWT",
  "hash-generator": "Hash",
};
