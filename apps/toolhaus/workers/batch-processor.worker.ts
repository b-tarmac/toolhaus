/**
 * Web worker for batch processing. Runs off the main thread, emits progress every 100 items.
 */
import type { BatchRow, BatchToolSlug, BatchOptions } from "../lib/tools/batch/types";
import { processUuidBatch } from "../lib/tools/uuid/batch";
import { processHashBatch } from "../lib/tools/hash/batch";
import { processCaseBatch } from "../lib/tools/case/batch";
import { processBase64Batch } from "../lib/tools/base64/batch";
import { processJwtBatch } from "../lib/tools/jwt/batch";
import { processTimestampBatch } from "../lib/tools/timestamp/batch";
import { processLlmTokenBatch } from "../lib/tools/ai-tokens/batch";

const PROGRESS_INTERVAL = 100;

async function processLine(
  toolSlug: BatchToolSlug,
  line: string,
  options: BatchOptions
): Promise<BatchRow> {
  switch (toolSlug) {
    case "uuid-generator":
      return processUuidBatch(line, {
        type: options.type as "uuid-v4" | "ulid" | "nanoid" | undefined,
        uppercase: options.uppercase as boolean | undefined,
      });
    case "hash-generator":
      return processHashBatch(line, options as { algorithm?: string; uppercase?: boolean });
    case "case-converter":
      return processCaseBatch(line, options as { conversion?: string });
    case "llm-token-counter":
      return processLlmTokenBatch(line, options as { encoding?: string });
    case "base64-tool":
      return processBase64Batch(line, {
        mode: options.mode as "encode" | "decode" | undefined,
        urlSafe: options.urlSafe as boolean | undefined,
      });
    case "jwt-decoder":
      return processJwtBatch(line);
    case "timestamp-converter":
      return processTimestampBatch(line, {
        mode: options.mode as "to-human" | "to-timestamp" | undefined,
        unit: options.unit as "seconds" | "milliseconds" | undefined,
        timezone: options.timezone as string | undefined,
      });
    default:
      return { input: line, output: `Unknown tool: ${toolSlug}` };
  }
}

self.onmessage = async (e: MessageEvent<{ type: "start"; toolSlug: BatchToolSlug; lines: string[]; options: BatchOptions }>) => {
  const { type, toolSlug, lines, options } = e.data;
  if (type !== "start") return;

  const results: BatchRow[] = [];
  const total = lines.length;

  try {
    for (let i = 0; i < lines.length; i++) {
      const row = await processLine(toolSlug, lines[i], options);
      results.push(row);

      if ((i + 1) % PROGRESS_INTERVAL === 0 || i === lines.length - 1) {
        self.postMessage({ type: "progress", processed: i + 1, total });
      }
    }
    self.postMessage({ type: "complete", results });
  } catch (err) {
    self.postMessage({
      type: "error",
      message: (err as Error).message,
    });
  }
};
