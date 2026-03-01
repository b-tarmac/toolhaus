import { Command } from "commander";
import { callTool, ApiError } from "../api.js";

export const uuidCommand = new Command("uuid")
  .description("Generate UUIDs (Pro)")
  .option("-t, --type <type>", "ID type: uuid-v4, ulid, nanoid", "uuid-v4")
  .option("-u, --uppercase", "Use uppercase output")
  .action(async (opts) => {
    try {
      // UUID generator ignores input; pass placeholder
      const result = await callTool("uuid-generator", " ", {
        type: opts.type,
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
