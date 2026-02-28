import type { ToolConfig } from "@toolhaus/tool-sdk";

export function generateToolSchema(tool: ToolConfig) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: tool.name,
        applicationCategory: tool.schema.appCategory,
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: tool.description,
        url: `https://toolhaus.dev/tools/${tool.slug}`,
        creator: {
          "@type": "Organization",
          name: "Toolhaus",
          url: "https://toolhaus.dev",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: tool.schema.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Tools",
            item: "https://toolhaus.dev/tools",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: tool.category,
            item: `https://toolhaus.dev/tools/category/${tool.category}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: tool.name,
            item: `https://toolhaus.dev/tools/${tool.slug}`,
          },
        ],
      },
    ],
  };
}
