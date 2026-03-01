import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";

const CONFIG_DIR = join(homedir(), ".toolhaus");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

export interface ToolhausConfig {
  apiKey?: string;
  baseUrl?: string;
}

export function getConfigPath(): string {
  return CONFIG_FILE;
}

export function loadConfig(): ToolhausConfig {
  if (!existsSync(CONFIG_FILE)) {
    return {};
  }
  try {
    const raw = readFileSync(CONFIG_FILE, "utf-8");
    return JSON.parse(raw) as ToolhausConfig;
  } catch {
    return {};
  }
}

export function saveConfig(config: ToolhausConfig): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}

export function getApiKey(): string | undefined {
  return process.env.TOOLHAUS_API_KEY ?? loadConfig().apiKey;
}

export function getBaseUrl(): string {
  return (
    process.env.TOOLHAUS_BASE_URL ??
    loadConfig().baseUrl ??
    "https://toolhaus.dev"
  );
}
