import type { MetadataRoute } from "next";
import { tools } from "@/lib/tools-registry";
import { categories } from "@/lib/tools-registry";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://toolhaus.dev",
      lastModified: new Date(),
      priority: 1.0,
    },
    {
      url: "https://toolhaus.dev/tools",
      lastModified: new Date(),
      priority: 0.9,
    },
    ...categories.map((cat) => ({
      url: `https://toolhaus.dev/tools/category/${cat}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
    ...tools.map((tool) => ({
      url: `https://toolhaus.dev/tools/${tool.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
