import { createInterface } from "node:readline";

/**
 * Read input from argument or stdin.
 * If input is provided, use it. Otherwise read from stdin.
 */
export async function readStdin(
  arg: string | undefined,
  callback: (content: string) => Promise<void>
): Promise<void> {
  if (arg !== undefined && arg !== "") {
    await callback(arg);
    return;
  }

  if (!process.stdin.isTTY) {
    const chunks: string[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk as string);
    }
    await callback(chunks.join(""));
    return;
  }

  const rl = createInterface({ input: process.stdin });
  const lines: string[] = [];
  for await (const line of rl) {
    lines.push(line);
  }
  await callback(lines.join("\n"));
}
