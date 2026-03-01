import { lazy } from "react";
import type { EasyBiscuitToolConfig, EasyBiscuitToolCategory } from "@portfolio/tool-sdk";
import { EASYBISCUIT_LIMITS } from "@portfolio/usage";

const defaultAbout =
  "This tool processes your data entirely in your browser. No information is sent to EasyBiscuit servers. All processing is client-side for maximum privacy and speed.";

const defaultFaqs = [
  {
    question: "Is my data safe?",
    answer:
      "Yes. All processing happens in your browser. No data is sent to EasyBiscuit servers.",
  },
  {
    question: "Does this tool work offline?",
    answer:
      "Yes. Once the page is loaded, all processing happens locally in your browser.",
  },
  {
    question: "Can I use this without an account?",
    answer:
      "Yes. You can try every tool without creating an account, subject to daily usage limits. Sign up for more uses, or upgrade to Pro for unlimited access.",
  },
];

function createLazy(
  loader: () => Promise<{ default: React.ComponentType<import("@portfolio/tool-sdk").EasyBiscuitToolProps> }>
) {
  return lazy(loader);
}

export const toolRegistry: EasyBiscuitToolConfig[] = [
  // Business
  {
    slug: "invoice-generator",
    name: "Invoice Generator",
    description: "Create professional invoices in seconds. Download as PDF.",
    about: defaultAbout,
    category: "business",
    icon: "FileText",
    tags: ["invoice", "pdf", "business"],
    limits: EASYBISCUIT_LIMITS["invoice-generator"] ?? { anonymous: 2, free: 5, pro: null },
    limitPeriod: "day",
    component: createLazy(() => import("@/components/tools/InvoiceGenerator").then((m) => ({ default: m.default }))),
    seo: {
      title: "Free Invoice Generator — Create Professional Invoices Online | EasyBiscuit",
      description:
        "Create and download professional invoices as PDF in seconds. No account required. Free invoice generator for small businesses and freelancers.",
      keywords: [
        "invoice generator",
        "free invoice maker",
        "invoice template online",
        "create invoice pdf",
        "freelance invoice generator",
      ],
      faqs: [
        {
          question: "Can I add my logo to the invoice?",
          answer:
            "Yes — free accounts can upload a logo. Pro accounts can save their logo permanently so it auto-fills on every invoice.",
        },
        {
          question: "What format does the invoice download in?",
          answer:
            "Invoices download as a professional PDF, generated entirely in your browser. Nothing is uploaded to our servers.",
        },
        {
          question: "Can I save invoice templates?",
          answer:
            "Pro users can save invoice templates and client profiles so their details auto-fill for repeat invoices.",
        },
      ],
    },
  },
  {
    slug: "invoice-parser",
    name: "Invoice Parser",
    description: "Extract data from any invoice — PDF or photo. Export to Excel in one click.",
    about: defaultAbout,
    category: "business",
    icon: "ScanText",
    tags: ["invoice", "ocr", "extract"],
    limits: EASYBISCUIT_LIMITS["invoice-parser"] ?? { anonymous: 2, free: 3, pro: null },
    limitPeriod: "day",
    component: createLazy(() => import("@/components/tools/InvoiceParser").then((m) => ({ default: m.default }))),
    seo: {
      title: "Invoice Parser — Extract Invoice Data Automatically | EasyBiscuit",
      description:
        "Upload any invoice PDF or photo and instantly extract vendor, date, line items, and totals. Export to Excel for your accountant. Processed privately in your browser.",
      keywords: [
        "invoice parser",
        "extract data from invoice",
        "invoice ocr online",
        "invoice data extraction",
        "read invoice pdf",
      ],
      faqs: defaultFaqs,
    },
  },
  {
    slug: "receipt-scanner",
    name: "Receipt Scanner",
    description: "Photograph or upload a receipt and extract expense data instantly.",
    about: defaultAbout,
    category: "business",
    icon: "Receipt",
    tags: ["receipt", "expense", "ocr"],
    limits: EASYBISCUIT_LIMITS["receipt-scanner"] ?? { anonymous: 2, free: 5, pro: null },
    limitPeriod: "day",
    component: createLazy(() => import("@/components/tools/ReceiptScanner").then((m) => ({ default: m.default }))),
    seo: {
      title: "Receipt Scanner — Extract Expense Data | EasyBiscuit",
      description: "Upload or photograph receipts and extract expense data instantly. Processed in your browser.",
      keywords: ["receipt scanner", "expense tracker", "receipt ocr"],
      faqs: defaultFaqs,
    },
  },
  {
    slug: "quote-generator",
    name: "Quote Generator",
    description: "Create professional quotes and proposals. Download as PDF.",
    about: defaultAbout,
    category: "business",
    icon: "ClipboardList",
    tags: ["quote", "proposal", "pdf"],
    limits: EASYBISCUIT_LIMITS["quote-generator"] ?? { anonymous: 2, free: 5, pro: null },
    limitPeriod: "day",
    component: createLazy(() => import("@/components/tools/QuoteGenerator").then((m) => ({ default: m.default }))),
    seo: {
      title: "Quote Generator — Create Professional Quotes | EasyBiscuit",
      description: "Create professional quotes and proposals. Download as PDF.",
      keywords: ["quote generator", "proposal template", "quote pdf"],
      faqs: defaultFaqs,
    },
  },
  {
    slug: "email-signature-generator",
    name: "Email Signature Generator",
    description: "Build a professional HTML email signature. Copy and paste into any email client.",
    about: defaultAbout,
    category: "business",
    icon: "Mail",
    tags: ["email", "signature", "html"],
    limits: { anonymous: null, free: null, pro: null },
    limitPeriod: "day",
    component: createLazy(() => import("@/components/tools/EmailSignatureGenerator").then((m) => ({ default: m.default }))),
    seo: {
      title: "Email Signature Generator — Free HTML Signature | EasyBiscuit",
      description: "Build a professional HTML email signature. Copy and paste into any email client.",
      keywords: [
        "email signature generator",
        "html email signature",
        "professional email signature",
        "free email signature maker",
      ],
      faqs: defaultFaqs,
    },
  },
  {
    slug: "esign-pdf",
    name: "eSign PDF",
    description: "Sign any PDF document online. Draw, type, or upload your signature.",
    about: defaultAbout,
    category: "business",
    icon: "PenLine",
    tags: ["pdf", "sign", "esign"],
    limits: EASYBISCUIT_LIMITS["esign-pdf"] ?? { anonymous: 1, free: 3, pro: null },
    limitPeriod: "day",
    component: createLazy(() => import("@/components/tools/EsignPdf").then((m) => ({ default: m.default }))),
    seo: {
      title: "eSign PDF — Sign Documents Online | EasyBiscuit",
      description: "Sign any PDF document online. Draw, type, or upload your signature.",
      keywords: ["esign pdf", "sign pdf online", "digital signature"],
      faqs: defaultFaqs,
    },
  },
  {
    slug: "qr-code-generator",
    name: "QR Code Generator",
    description: "Generate QR codes for any URL, text, or contact. Download as PNG or SVG.",
    about: defaultAbout,
    category: "business",
    icon: "QrCode",
    tags: ["qr", "code", "generator"],
    limits: { anonymous: null, free: null, pro: null },
    limitPeriod: "day",
    component: createLazy(() => import("@/components/tools/QrCodeGenerator").then((m) => ({ default: m.default }))),
    seo: {
      title: "QR Code Generator — Free QR Code Maker | EasyBiscuit",
      description: "Generate QR codes for any URL, text, or contact. Download as PNG or SVG.",
      keywords: [
        "qr code generator",
        "qr code maker free",
        "generate qr code",
        "qr code for business",
        "free qr code download",
      ],
      faqs: defaultFaqs,
    },
  },
  // Calculators
  {
    slug: "vat-calculator",
    name: "VAT / GST Calculator",
    description: "Calculate VAT, GST, or sales tax on any amount.",
    about: defaultAbout,
    category: "calculators",
    icon: "Percent",
    tags: ["vat", "gst", "tax", "calculator"],
    limits: { anonymous: null, free: null, pro: null },
    limitPeriod: "day",
    component: createLazy(() => import("@/components/tools/VatCalculator").then((m) => ({ default: m.default }))),
    seo: {
      title: "VAT Calculator — Free VAT/GST Calculator | EasyBiscuit",
      description: "Calculate VAT, GST, or sales tax on any amount.",
      keywords: ["vat calculator", "gst calculator", "sales tax calculator"],
      faqs: defaultFaqs,
    },
  },
  {
    slug: "profit-margin-calculator",
    name: "Profit Margin Calculator",
    description: "Calculate profit margin and markup for your products.",
    about: defaultAbout,
    category: "calculators",
    icon: "TrendingUp",
    tags: ["profit", "margin", "calculator"],
    limits: { anonymous: null, free: null, pro: null },
    limitPeriod: "day",
    component: createLazy(() => import("@/components/tools/ProfitMarginCalculator").then((m) => ({ default: m.default }))),
    seo: {
      title: "Profit Margin Calculator | EasyBiscuit",
      description: "Calculate profit margin and markup for your products.",
      keywords: ["profit margin calculator", "markup calculator"],
      faqs: defaultFaqs,
    },
  },
  {
    slug: "markup-calculator",
    name: "Markup Calculator",
    description: "Calculate markup percentage and selling price.",
    about: defaultAbout,
    category: "calculators",
    icon: "ArrowUpRight",
    tags: ["markup", "calculator"],
    limits: { anonymous: null, free: null, pro: null },
    limitPeriod: "day",
    component: createLazy(() => import("@/components/tools/MarkupCalculator").then((m) => ({ default: m.default }))),
    seo: {
      title: "Markup Calculator | EasyBiscuit",
      description: "Calculate markup percentage and selling price.",
      keywords: ["markup calculator"],
      faqs: defaultFaqs,
    },
  },
  {
    slug: "discount-calculator",
    name: "Discount Calculator",
    description: "Calculate discounts and final prices.",
    about: defaultAbout,
    category: "calculators",
    icon: "Tag",
    tags: ["discount", "calculator"],
    limits: { anonymous: null, free: null, pro: null },
    limitPeriod: "day",
    component: createLazy(() => import("@/components/tools/DiscountCalculator").then((m) => ({ default: m.default }))),
    seo: {
      title: "Discount Calculator | EasyBiscuit",
      description: "Calculate discounts and final prices.",
      keywords: ["discount calculator"],
      faqs: defaultFaqs,
    },
  },
  {
    slug: "break-even-calculator",
    name: "Break-Even Calculator",
    description: "Calculate your break-even point.",
    about: defaultAbout,
    category: "calculators",
    icon: "Scale",
    tags: ["break-even", "calculator"],
    limits: { anonymous: null, free: null, pro: null },
    limitPeriod: "day",
    component: createLazy(() => import("@/components/tools/BreakEvenCalculator").then((m) => ({ default: m.default }))),
    seo: {
      title: "Break-Even Calculator | EasyBiscuit",
      description: "Calculate your break-even point.",
      keywords: ["break even calculator"],
      faqs: defaultFaqs,
    },
  },
  {
    slug: "hourly-rate-calculator",
    name: "Hourly Rate Calculator",
    description: "Calculate your freelance or contractor hourly rate.",
    about: defaultAbout,
    category: "calculators",
    icon: "Clock",
    tags: ["hourly", "rate", "freelance"],
    limits: { anonymous: null, free: null, pro: null },
    limitPeriod: "day",
    component: createLazy(() => import("@/components/tools/HourlyRateCalculator").then((m) => ({ default: m.default }))),
    seo: {
      title: "Hourly Rate Calculator | EasyBiscuit",
      description: "Calculate your freelance or contractor hourly rate.",
      keywords: ["hourly rate calculator", "freelance rate calculator"],
      faqs: defaultFaqs,
    },
  },
  {
    slug: "currency-converter",
    name: "Currency Converter",
    description: "Convert between currencies with live exchange rates.",
    about: defaultAbout,
    category: "calculators",
    icon: "ArrowLeftRight",
    tags: ["currency", "converter"],
    limits: { anonymous: null, free: null, pro: null },
    limitPeriod: "day",
    component: createLazy(() => import("@/components/tools/CurrencyConverter").then((m) => ({ default: m.default }))),
    seo: {
      title: "Currency Converter | EasyBiscuit",
      description: "Convert between currencies with live exchange rates.",
      keywords: ["currency converter", "exchange rate"],
      faqs: defaultFaqs,
    },
  },
  {
    slug: "late-payment-calculator",
    name: "Late Payment Interest Calculator",
    description: "Calculate late payment interest and penalties.",
    about: defaultAbout,
    category: "calculators",
    icon: "CalendarClock",
    tags: ["late payment", "interest", "calculator"],
    limits: { anonymous: null, free: null, pro: null },
    limitPeriod: "day",
    component: createLazy(() => import("@/components/tools/LatePaymentCalculator").then((m) => ({ default: m.default }))),
    seo: {
      title: "Late Payment Interest Calculator | EasyBiscuit",
      description: "Calculate late payment interest and penalties.",
      keywords: ["late payment calculator", "interest calculator"],
      faqs: defaultFaqs,
    },
  },
  // PDF
  {
    slug: "pdf-merger",
    name: "PDF Merger",
    description: "Merge multiple PDF files into one.",
    about: defaultAbout,
    category: "pdf",
    icon: "FilePlus",
    tags: ["pdf", "merge"],
    limits: EASYBISCUIT_LIMITS["pdf-merger"] ?? { anonymous: 2, free: 5, pro: null },
    limitPeriod: "day",
    component: createLazy(() => import("@/components/tools/PdfMerger").then((m) => ({ default: m.default }))),
    seo: {
      title: "PDF Merger — Merge PDF Files Online | EasyBiscuit",
      description: "Merge multiple PDF files into one. Processed in your browser.",
      keywords: ["pdf merger", "merge pdf", "combine pdf"],
      faqs: defaultFaqs,
    },
  },
  {
    slug: "pdf-compressor",
    name: "PDF Compressor",
    description: "Compress PDF files to reduce file size.",
    about: defaultAbout,
    category: "pdf",
    icon: "FileDown",
    tags: ["pdf", "compress"],
    limits: EASYBISCUIT_LIMITS["pdf-compressor"] ?? { anonymous: 2, free: 5, pro: null },
    limitPeriod: "day",
    component: createLazy(() => import("@/components/tools/PdfCompressor").then((m) => ({ default: m.default }))),
    seo: {
      title: "PDF Compressor — Reduce PDF File Size | EasyBiscuit",
      description: "Compress PDF files to reduce file size.",
      keywords: ["pdf compressor", "compress pdf", "reduce pdf size"],
      faqs: defaultFaqs,
    },
  },
  {
    slug: "image-to-pdf",
    name: "Image to PDF",
    description: "Convert images to PDF documents.",
    about: defaultAbout,
    category: "pdf",
    icon: "ImagePlus",
    tags: ["image", "pdf", "convert"],
    limits: EASYBISCUIT_LIMITS["image-to-pdf"] ?? { anonymous: 2, free: 5, pro: null },
    limitPeriod: "day",
    component: createLazy(() => import("@/components/tools/ImageToPdf").then((m) => ({ default: m.default }))),
    seo: {
      title: "Image to PDF — Convert Images to PDF | EasyBiscuit",
      description: "Convert images to PDF documents.",
      keywords: ["image to pdf", "convert image to pdf", "jpg to pdf"],
      faqs: defaultFaqs,
    },
  },
  // Image
  {
    slug: "heic-to-jpg",
    name: "HEIC to JPG",
    description: "Convert HEIC/HEIF images to JPG or PNG.",
    about: defaultAbout,
    category: "image",
    icon: "ImageDown",
    tags: ["heic", "jpg", "convert"],
    limits: EASYBISCUIT_LIMITS["heic-to-jpg"] ?? { anonymous: 3, free: 10, pro: null },
    limitPeriod: "day",
    component: createLazy(() => import("@/components/tools/HeicToJpg").then((m) => ({ default: m.default }))),
    seo: {
      title: "HEIC to JPG — Convert HEIC Images | EasyBiscuit",
      description: "Convert HEIC/HEIF images to JPG or PNG.",
      keywords: ["heic to jpg", "heic converter", "convert heic"],
      faqs: defaultFaqs,
    },
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    description: "Compress images to reduce file size.",
    about: defaultAbout,
    category: "image",
    icon: "FileDown",
    tags: ["image", "compress"],
    limits: EASYBISCUIT_LIMITS["image-compressor"] ?? { anonymous: 3, free: 10, pro: null },
    limitPeriod: "day",
    component: createLazy(() => import("@/components/tools/ImageCompressor").then((m) => ({ default: m.default }))),
    seo: {
      title: "Image Compressor — Reduce Image Size | EasyBiscuit",
      description: "Compress images to reduce file size.",
      keywords: ["image compressor", "compress image", "reduce image size"],
      faqs: defaultFaqs,
    },
  },
  {
    slug: "social-media-resizer",
    name: "Social Media Image Resizer",
    description: "Resize images for Instagram, Facebook, Twitter, and more.",
    about: defaultAbout,
    category: "image",
    icon: "Share2",
    tags: ["social media", "resize", "image"],
    limits: EASYBISCUIT_LIMITS["social-media-resizer"] ?? { anonymous: 3, free: 10, pro: null },
    limitPeriod: "day",
    component: createLazy(() => import("@/components/tools/SocialMediaResizer").then((m) => ({ default: m.default }))),
    seo: {
      title: "Social Media Image Resizer | EasyBiscuit",
      description: "Resize images for Instagram, Facebook, Twitter, and more.",
      keywords: ["social media resizer", "instagram size", "facebook image size"],
      faqs: defaultFaqs,
    },
  },
  // Writing
  {
    slug: "word-counter",
    name: "Word Counter",
    description: "Count words, characters, and sentences in your text.",
    about: defaultAbout,
    category: "writing",
    icon: "AlignLeft",
    tags: ["word", "count", "character"],
    limits: { anonymous: null, free: null, pro: null },
    limitPeriod: "day",
    component: createLazy(() => import("@/components/tools/WordCounter").then((m) => ({ default: m.default }))),
    seo: {
      title: "Word Counter — Free Word & Character Counter | EasyBiscuit",
      description: "Count words, characters, and sentences in your text.",
      keywords: ["word counter", "character counter", "word count"],
      faqs: defaultFaqs,
    },
  },
];

export function getToolBySlugAndCategory(
  category: string,
  slug: string
): EasyBiscuitToolConfig | undefined {
  return toolRegistry.find((t) => t.category === category && t.slug === slug);
}

export function getToolsByCategory(
  category: EasyBiscuitToolCategory
): EasyBiscuitToolConfig[] {
  return toolRegistry.filter((t) => t.category === category);
}

export const categories = [
  ...new Set(toolRegistry.map((t) => t.category)),
] as EasyBiscuitToolCategory[];
