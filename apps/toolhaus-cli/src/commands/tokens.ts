import { Command } from "commander";
import { callTool, ApiError } from "../api.js";
import { readStdin } from "../stdin.js";

export const tokensCommand = new Command("tokens")
  .description("Count LLM tokens (Pro)")
  .option("-e, --encoding <enc>", "Encoding: cl100k_base, o200k_base", "cl100k_base")
  .argument("[input]", "text to count tokens for")
  .action(async (input, opts) => {
    await readStdin(input, async (content) => {
      if (!content?.trim()) {
        console.error("Error: Input required");
        process.exit(1);
      }
      try {
        const result = await callTool("llm-token-counter", content, {
          encoding: opts.encoding,
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
