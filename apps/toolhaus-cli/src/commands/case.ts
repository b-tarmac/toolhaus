import { Command } from "commander";
import { callTool, ApiError } from "../api.js";
import { readStdin } from "../stdin.js";

const CONVERSIONS = [
  "camelCase",
  "PascalCase",
  "snake_case",
  "SCREAMING_SNAKE",
  "kebab-case",
  "Title Case",
  "Sentence case",
  "lowercase",
  "UPPERCASE",
  "dot.case",
  "path/case",
];

export const caseCommand = new Command("case")
  .description("Convert text case (Pro)")
  .option("-c, --conversion <type>", `Conversion: ${CONVERSIONS.join(", ")}`, "camelCase")
  .argument("[input]", "text to convert")
  .action(async (input, opts) => {
    await readStdin(input, async (content) => {
      if (!content?.trim()) {
        console.error("Error: Input required");
        process.exit(1);
      }
      try {
        const result = await callTool("case-converter", content, {
          conversion: opts.conversion,
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
