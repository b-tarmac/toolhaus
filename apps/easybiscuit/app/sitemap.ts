import type { MetadataRoute } from "next";
import { toolRegistry } from "@/lib/tools/registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://easybiscuit.co";

  const toolPages = toolRegistry.map((tool) => ({
    url: `${baseUrl}/tools/${tool.category}/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const categoryPages = [...new Set(toolRegistry.map((t) => t.category))].map(
    (category) => ({
      url: `${baseUrl}/tools/${category}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })
  );

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...categoryPages,
    ...toolPages,
  ];
}
