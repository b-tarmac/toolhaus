/**
 * Batch processing types shared between BatchProcessor UI and worker.
 */

export interface BatchRow {
  input: string;
  output: string;
  [key: string]: string;
}

export interface BatchOptions {
  [key: string]: unknown;
}

export type BatchToolSlug =
  | "uuid-generator"
  | "hash-generator"
  | "case-converter"
  | "llm-token-counter"
  | "base64-tool"
  | "jwt-decoder"
  | "timestamp-converter";

export interface BatchWorkerMessage {
  type: "start";
  toolSlug: BatchToolSlug;
  lines: string[];
  options: BatchOptions;
}

export interface BatchWorkerProgress {
  type: "progress";
  processed: number;
  total: number;
}

export interface BatchWorkerComplete {
  type: "complete";
  results: BatchRow[];
}

export interface BatchWorkerError {
  type: "error";
  message: string;
}

export type BatchWorkerResponse =
  | BatchWorkerProgress
  | BatchWorkerComplete
  | BatchWorkerError;
