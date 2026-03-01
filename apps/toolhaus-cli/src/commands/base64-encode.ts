import { Command } from "commander";
import { callTool, ApiError } from "../api.js";
import { readStdin } from "../stdin.js";

export const base64EncodeCommand = new Command("base64-encode")
  .alias("b64e")
  .description("Encode to Base64 (Pro)")
  .option("--url-safe", "Use URL-safe Base64 (Base64URL)")
  .argument("[input]", "text to encode")
  .action(async (input, opts) => {
    await readStdin(input, async (content) => {
      if (!content?.trim()) {
        console.error("Error: Input required");
        process.exit(1);
      }
      try {
        const result = await callTool("base64-tool", content, {
          mode: "encode",
          urlSafe: opts.urlSafe ?? false,
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
