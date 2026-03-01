import { Command } from "commander";
import { callTool, ApiError } from "../api.js";
import { readStdin } from "../stdin.js";

export const timestampCommand = new Command("timestamp")
  .alias("ts")
  .description("Convert timestamps (Pro)")
  .option("-m, --mode <mode>", "Mode: to-human, to-timestamp", "to-human")
  .option("-u, --unit <unit>", "Unit: seconds, milliseconds", "seconds")
  .option("-z, --timezone <tz>", "Timezone (e.g. UTC, America/New_York)", "UTC")
  .argument("[input]", "timestamp or date string")
  .action(async (input, opts) => {
    await readStdin(input, async (content) => {
      if (!content?.trim()) {
        console.error("Error: Input required");
        process.exit(1);
      }
      try {
        const result = await callTool("timestamp-converter", content, {
          mode: opts.mode,
          unit: opts.unit,
          timezone: opts.timezone,
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
