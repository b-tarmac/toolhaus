import { getEncoding } from "js-tiktoken";

type WorkerMessage = {
  text: string;
  encoding: string;
  requestId?: number;
};

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { text, encoding, requestId } = e.data;
  try {
    const enc = getEncoding(encoding as "cl100k_base" | "o200k_base");
    const tokens = enc.encode(text);
    const tokenIds = Array.from(tokens);
    self.postMessage({
      success: true,
      tokenCount: tokenIds.length,
      tokenIds,
      requestId,
    });
  } catch (err: unknown) {
    self.postMessage({
      success: false,
      error: (err as Error).message,
      requestId,
    });
  }
};
