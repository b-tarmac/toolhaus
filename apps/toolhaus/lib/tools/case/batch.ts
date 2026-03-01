import { conversions } from "./index";

export interface CaseBatchOptions {
  conversion?: string;
}

export function processCaseBatch(
  input: string,
  options: CaseBatchOptions = {}
): { input: string; output: string; [key: string]: string } {
  const conversion = options.conversion ?? "camelCase";
  const fn = conversions[conversion] ?? conversions.camelCase;
  const output = fn(input);
  return {
    input: input.trim(),
    output,
    [conversion]: output,
  };
}
