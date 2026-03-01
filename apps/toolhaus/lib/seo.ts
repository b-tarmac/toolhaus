import { generateToolhausToolJsonLd } from "@portfolio/seo";
import type { ToolConfig } from "@portfolio/tool-sdk";

const TOOLHAUS_SEO_CONFIG = {
  baseUrl: "https://toolhaus.dev",
  siteName: "Toolhaus",
  appCategory: "DeveloperApplication" as const,
};

export function generateToolSchema(tool: ToolConfig) {
  return generateToolhausToolJsonLd(tool, TOOLHAUS_SEO_CONFIG);
}
