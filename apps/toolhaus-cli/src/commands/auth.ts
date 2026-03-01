import { Command } from "commander";
import { saveConfig, getConfigPath, loadConfig } from "../config.js";

export const authCommand = new Command("auth")
  .description("Configure your Toolhaus API key")
  .option("-k, --key <key>", "API key to save (or run without to view current config)")
  .option("--clear", "Remove stored API key")
  .action((opts) => {
    if (opts.clear) {
      const config = loadConfig();
      delete config.apiKey;
      saveConfig(config);
      console.log("API key removed from config.");
      return;
    }

    if (opts.key) {
      saveConfig({
        ...loadConfig(),
        apiKey: opts.key,
      });
      console.log("API key saved to", getConfigPath());
      return;
    }

    const config = loadConfig();
    if (config.apiKey) {
      const masked =
        config.apiKey.slice(0, 12) + "..." + config.apiKey.slice(-4);
      console.log("API key configured:", masked);
    } else {
      console.log("No API key configured.");
      console.log("");
      console.log("Usage:");
      console.log("  toolhaus auth --key <your-api-key>");
      console.log("");
      console.log("Get your API key at https://toolhaus.dev/dashboard/api-keys");
    }
    console.log("Config file:", getConfigPath());
  });
