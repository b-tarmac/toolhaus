import { hashAll } from "./index";

export interface HashBatchOptions {
  algorithm?: string;
  uppercase?: boolean;
}

export async function processHashBatch(
  input: string,
  options: HashBatchOptions = {}
): Promise<{ input: string; output: string }> {
  const algorithm = (options.algorithm ?? "SHA-256") as string;
  const uppercase = options.uppercase === true;
  const hashes = await hashAll(input.trim());
  const hash = hashes[algorithm] ?? hashes["SHA-256"] ?? Object.values(hashes)[0];
  const output = uppercase ? hash.toUpperCase() : hash;
  return {
    input: input.trim(),
    output,
  };
}
