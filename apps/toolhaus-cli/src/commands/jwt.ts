import { Command } from "commander";
import { callTool, ApiError } from "../api.js";
import { readStdin } from "../stdin.js";

export const jwtCommand = new Command("jwt")
  .description("Decode JWT (Pro)")
  .argument("[input]", "JWT string to decode")
  .action(async (input) => {
    await readStdin(input, async (content) => {
      if (!content?.trim()) {
        console.error("Error: Input required");
        process.exit(1);
      }
      try {
        const result = await callTool("jwt-decoder", content, {});
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
