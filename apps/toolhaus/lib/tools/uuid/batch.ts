import { generateIds, type IdType } from "./index";

export interface UuidBatchOptions {
  type?: IdType;
  uppercase?: boolean;
}

export function processUuidBatch(
  input: string,
  options: UuidBatchOptions = {}
): { input: string; output: string } {
  const type = (options.type ?? "uuid-v4") as IdType;
  const uppercase = options.uppercase === true;
  const ids = generateIds(type, { count: 1, uppercase });
  return {
    input: input.trim(),
    output: ids[0] ?? "",
  };
}
