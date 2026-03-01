import { timestampToHuman, humanToTimestamp } from "./index";

export interface TimestampBatchOptions {
  mode?: "to-human" | "to-timestamp";
  unit?: "seconds" | "milliseconds";
  timezone?: string;
}

export function processTimestampBatch(
  input: string,
  options: TimestampBatchOptions = {}
): { input: string; output: string } {
  const mode = options.mode ?? "to-human";
  const unit = (options.unit ?? "seconds") as "seconds" | "milliseconds";
  const timezone = options.timezone ?? "UTC";
  const trimmed = input.trim();
  if (!trimmed) {
    return { input: "", output: "" };
  }
  if (mode === "to-human") {
    const r = timestampToHuman(trimmed, unit, timezone);
    if (r.isValid && r.metadata && "iso8601" in r.metadata) {
      return { input: trimmed, output: String(r.metadata.iso8601) };
    }
    return { input: trimmed, output: r.error?.message ?? "Invalid" };
  }
  const r = humanToTimestamp(trimmed);
  if (r.isValid && r.metadata && "seconds" in r.metadata) {
    return {
      input: trimmed,
      output: unit === "seconds" ? String(r.metadata.seconds) : String(r.metadata.milliseconds),
    };
  }
  return { input: trimmed, output: r.error?.message ?? "Invalid" };
}
