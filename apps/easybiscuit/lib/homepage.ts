import type { EasyBiscuitToolCategory } from "@portfolio/tool-sdk";

export const FEATURED_TOOL_SLUGS = [
  "invoice-generator",
  "invoice-parser",
  "vat-calculator",
  "pdf-merger",
  "heic-to-jpg",
  "qr-code-generator",
  "profit-margin-calculator",
  "esign-pdf",
  "email-signature-generator",
] as const;

export const HOMEPAGE_CATEGORY_METADATA: Record<
  EasyBiscuitToolCategory,
  { icon: string; subtitle: string }
> = {
  business: {
    icon: "🧾",
    subtitle: "Invoices, quotes, eSign, QR codes",
  },
  calculators: {
    icon: "🧮",
    subtitle: "VAT, margins, break-even, hourly rate",
  },
  pdf: {
    icon: "📄",
    subtitle: "Merge, split, compress, convert",
  },
  image: {
    icon: "🖼️",
    subtitle: "Resize, compress, convert, watermark",
  },
  writing: {
    icon: "✍️",
    subtitle: "Word count, readability, text cleaning",
  },
};
