import { Command } from "commander";
import { callTool, ApiError } from "../api.js";
import { readStdin } from "../stdin.js";

export const hashCommand = new Command("hash")
  .description("Generate hashes (MD5, SHA-256, etc.) (Pro)")
  .option("-a, --algorithm <alg>", "Algorithm: MD5, SHA-1, SHA-256, SHA-384, SHA-512", "SHA-256")
  .option("-u, --uppercase", "Use uppercase output")
  .argument("[input]", "text to hash")
  .action(async (input, opts) => {
    await readStdin(input, async (content) => {
      if (!content?.trim()) {
        console.error("Error: Input required");
        process.exit(1);
      }
      try {
        const result = await callTool("hash-generator", content, {
          algorithm: opts.algorithm,
          uppercase: opts.uppercase ?? false,
        });
        if (result.isValid) {
          process.stdout.write(result.output + "\n");
        } else {
          console.error(result.error?.message ?? "Error");
          process.exit(1);
        }
      } catch (err) {
        if (err instanceof ApiError) {
          console.error(err.message);
        } else {
          console.error((err as Error).message);
        }
        process.exit(1);
      }
    });
  });
