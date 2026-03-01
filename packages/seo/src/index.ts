import type { Metadata } from "next";
import type {
  ToolConfig,
  EasyBiscuitToolConfig,
} from "@portfolio/tool-sdk";

// ─── Site config ──────────────────────────────────────────────────────────────

export interface SeoSiteConfig {
  baseUrl: string;
  siteName: string;
}

// ─── JSON-LD schema generators (framework-agnostic) ──────────────────────────

export function generateSoftwareAppSchema(
  tool: { name: string; description: string; slug: string },
  config: SeoSiteConfig & { toolUrl: string; appCategory: string }
) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    applicationCategory: config.appCategory,
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: tool.description,
    url: config.toolUrl,
    creator: {
      "@type": "Organization",
      name: config.siteName,
      url: config.baseUrl,
    },
  };
}

export function generateFaqSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ─── Toolhaus JSON-LD (combines all three schemas into a @graph) ──────────────

export interface ToolhausToolSeoConfig extends SeoSiteConfig {
  appCategory: "DeveloperApplication" | "UtilitiesApplication";
}

export function generateToolhausToolJsonLd(
  tool: ToolConfig,
  config: ToolhausToolSeoConfig
) {
  const toolUrl = `${config.baseUrl}/tools/${tool.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      generateSoftwareAppSchema(tool, {
        ...config,
        toolUrl,
        appCategory: config.appCategory,
      }),
      generateFaqSchema(tool.schema.faqs),
      generateBreadcrumbSchema([
        { name: "Tools", url: `${config.baseUrl}/tools` },
        { name: tool.category, url: `${config.baseUrl}/tools/category/${tool.category}` },
        { name: tool.name, url: toolUrl },
      ]),
    ],
  };
}

// ─── EasyBiscuit Next.js metadata + JSON-LD ───────────────────────────────────

export function generateEasyBiscuitToolMetadata(
  tool: EasyBiscuitToolConfig,
  config: SeoSiteConfig
): Metadata {
  const toolUrl = `${config.baseUrl}/tools/${tool.category}/${tool.slug}`;
  return {
    title: tool.seo.title,
    description: tool.seo.description,
    keywords: tool.seo.keywords.join(", "),
    openGraph: {
      title: tool.seo.title,
      description: tool.seo.description,
      url: toolUrl,
      siteName: config.siteName,
      images: [{ url: `/og/${tool.slug}.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: tool.seo.title,
      description: tool.seo.description,
    },
    alternates: {
      canonical: toolUrl,
    },
  };
}

export function generateEasyBiscuitToolJsonLd(
  tool: EasyBiscuitToolConfig,
  config: SeoSiteConfig
) {
  const toolUrl = `${config.baseUrl}/tools/${tool.category}/${tool.slug}`;
  return [
    generateSoftwareAppSchema(tool, {
      ...config,
      toolUrl,
      appCategory: "BusinessApplication",
    }),
    generateFaqSchema(tool.seo.faqs),
    generateBreadcrumbSchema([
      { name: "Home", url: config.baseUrl },
      { name: tool.category, url: `${config.baseUrl}/tools/${tool.category}` },
      { name: tool.name, url: toolUrl },
    ]),
  ];
}
