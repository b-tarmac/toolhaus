# EasyBiscuit — Developer Handoff Document
**Version:** 1.0  
**Date:** 2026-03-01  
**Domain:** easybiscuit.co  
**Tagline:** Every tool your small business actually needs.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Monorepo Architecture](#2-monorepo-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Application Structure](#4-application-structure)
5. [Tool Registry & Catalogue](#5-tool-registry--catalogue)
6. [Feature Deep Dive: Invoice Parser (OCR)](#6-feature-deep-dive-invoice-parser-ocr)
7. [Feature Deep Dive: Invoice Generator](#7-feature-deep-dive-invoice-generator)
8. [Authentication (Clerk)](#8-authentication-clerk)
9. [Billing & Subscriptions (Stripe)](#9-billing--subscriptions-stripe)
10. [Usage Tracking & Friction Engine](#10-usage-tracking--friction-engine)
11. [Database Schema (Turso)](#11-database-schema-turso)
12. [Email (Resend)](#12-email-resend)
13. [SEO Infrastructure](#13-seo-infrastructure)
14. [UI & Design System](#14-ui--design-system)
15. [Environment Variables](#15-environment-variables)
16. [Deployment (Vercel)](#16-deployment-vercel)
17. [Roadmap](#17-roadmap)

---

## 1. Project Overview

### What It Is
EasyBiscuit is a privacy-first, client-side utility hub for small business owners, freelancers, and solo operators. It provides the everyday tools needed to run a small business — invoice generation, document processing, business calculators, image tools, and more — without the complexity of a full platform.

### Core Principles
- **Privacy-first:** All file processing happens in the browser using WebAssembly. No files are uploaded to servers. Ever.
- **No LLM API calls:** All tools are deterministic and client-side. No external AI API dependencies.
- **Subscription only:** No ads on any tier. Revenue comes from Pro subscriptions only.
- **No-account free tier:** Users can try every tool without creating an account, subject to daily usage limits.
- **Speed:** Tools should feel instant. First meaningful paint < 1.5s on all tool pages.

### Target Audience
- Small business owners managing their own operations
- Freelancers and solo operators
- Tradespeople (plumbers, electricians, builders, cleaners)
- Local service businesses
- Part-time and side-hustle operators

### Relationship to Toolhaus
EasyBiscuit is a sibling product to Toolhaus (toolhaus.dev — a developer utility hub). Both products live in the same Turborepo monorepo and share infrastructure packages, but are completely separate brands with separate databases, Clerk instances, and Stripe accounts. A Toolhaus Pro subscription does not grant EasyBiscuit Pro access, and vice versa.

---

## 2. Monorepo Architecture

EasyBiscuit is built inside a Turborepo monorepo alongside Toolhaus. This is the canonical repository structure:

```
portfolio/
├── apps/
│   ├── toolhaus/                    ← Existing Toolhaus app (migrated in)
│   └── easybiscuit/                 ← EasyBiscuit (built here)
├── packages/
│   ├── ui/                          ← Shared React components
│   ├── auth/                        ← Clerk helpers & middleware
│   ├── billing/                     ← Stripe helpers
│   ├── database/                    ← Turso client & base schema
│   ├── email/                       ← Resend templates & helpers
│   ├── seo/                         ← Schema generators & metadata builders
│   ├── usage/                       ← Usage tracking & feature flags
│   └── tool-sdk/                    ← Shared TypeScript types
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "typecheck": {}
  }
}
```

### pnpm-workspace.yaml
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### Package Naming Convention
All shared packages are scoped under `@portfolio/`:
- `@portfolio/ui`
- `@portfolio/auth`
- `@portfolio/billing`
- `@portfolio/database`
- `@portfolio/email`
- `@portfolio/seo`
- `@portfolio/usage`
- `@portfolio/tool-sdk`

### What Is Shared vs Separate

| Concern | Shared (monorepo package) | Separate (per-app) |
|---|---|---|
| UI components | ✅ `@portfolio/ui` | Branding, colours, logo |
| Auth helpers | ✅ `@portfolio/auth` | Clerk instance & keys |
| Stripe helpers | ✅ `@portfolio/billing` | Stripe account & price IDs |
| DB client code | ✅ `@portfolio/database` | Turso database URL & token |
| Email templates | ✅ `@portfolio/email` | From address, content |
| SEO generators | ✅ `@portfolio/seo` | Per-tool metadata |
| Usage tracking | ✅ `@portfolio/usage` | Per-site limits config |
| TypeScript types | ✅ `@portfolio/tool-sdk` | — |
| Tool registry | ❌ | Completely separate per app |
| Tool components | ❌ | Completely separate per app |
| Tool logic (lib/) | ❌ | Completely separate per app |

---

## 3. Tech Stack

### Core Framework
- **Next.js 15** (App Router) — static generation for tool pages, server components where appropriate
- **TypeScript** — strict mode enabled
- **pnpm** — package manager (monorepo-compatible)

### UI
- **Tailwind CSS v4**
- **shadcn/ui** — component library (installed per-app, not shared — allows independent theming)
- **Lucide React** — icons
- **Framer Motion** — subtle animations on tool interactions only

### Client-Side Processing Libraries

| Library | Purpose | Size |
|---|---|---|
| `tesseract.js` v5 | OCR engine (WASM) for scanned invoice/receipt parsing | ~12MB WASM (cached) |
| `pdfjs-dist` | PDF text extraction & rendering | ~3MB |
| `pdf-lib` | PDF creation, merging, splitting, compression, signing | ~800KB |
| `jspdf` | Generate PDF documents (invoices, quotes) | ~300KB |
| `browser-image-compression` | Client-side image compression | ~50KB |
| `heic2any` | HEIC to JPG/PNG/WebP conversion | ~1.5MB |
| `qrcode` | QR code generation (SVG + PNG output) | ~40KB |
| `jsbarcode` | Barcode generation | ~30KB |
| `color-thief` | Extract dominant colour palette from images | ~10KB |
| `react-signature-canvas` | Signature drawing for eSign | ~20KB |

All heavy libraries (Tesseract WASM, heic2any, pdf-lib) must be **dynamically imported** (`next/dynamic` with `{ ssr: false }`) and loaded only when the relevant tool page is opened. Never included in the root bundle.

### Infrastructure
- **Clerk** — authentication (separate instance from Toolhaus)
- **Stripe** — subscription billing (separate account from Toolhaus)
- **Turso** (LibSQL) — edge SQLite database (separate database from Toolhaus)
- **Resend** — transactional email
- **Vercel** — deployment (separate Vercel project from Toolhaus)

---

## 4. Application Structure

```
apps/easybiscuit/
├── app/
│   ├── layout.tsx                   ← Root layout: ClerkProvider, fonts, globals
│   ├── page.tsx                     ← Homepage
│   ├── pricing/
│   │   └── page.tsx
│   ├── dashboard/
│   │   ├── page.tsx                 ← Usage overview, recent history
│   │   ├── invoices/
│   │   │   └── page.tsx             ← Saved invoices library (Pro)
│   │   └── billing/
│   │       └── page.tsx             ← Stripe portal redirect
│   ├── tools/
│   │   ├── page.tsx                 ← All tools directory
│   │   ├── [category]/
│   │   │   └── page.tsx             ← Category landing page
│   │   └── [category]/
│   │       └── [slug]/
│   │           └── page.tsx         ← Individual tool page (statically generated)
│   ├── sign-in/[[...sign-in]]/
│   │   └── page.tsx
│   ├── sign-up/[[...sign-up]]/
│   │   └── page.tsx
│   └── api/
│       ├── stripe/
│       │   ├── checkout/route.ts
│       │   ├── portal/route.ts
│       │   └── webhook/route.ts
│       └── usage/
│           ├── check/route.ts
│           └── record/route.ts
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── MobileMenu.tsx
│   ├── tools/
│   │   ├── ToolShell.tsx            ← Wrapper for all tool pages
│   │   ├── ToolGrid.tsx             ← Tool directory grid
│   │   ├── ToolCard.tsx             ← Individual tool card
│   │   └── ToolSearch.tsx           ← Search/filter bar
│   ├── billing/
│   │   ├── UpgradePrompt.tsx        ← Contextual upgrade modal
│   │   ├── UsageLimitBanner.tsx     ← "X of Y free uses remaining"
│   │   └── PricingCard.tsx
│   └── shared/
│       ├── PrivacyBadge.tsx         ← "Processed locally in your browser"
│       ├── ProBadge.tsx
│       ├── FileDropzone.tsx         ← Reusable file upload component
│       └── DownloadButton.tsx
├── lib/
│   ├── tools/
│   │   ├── registry.ts              ← Tool registry (all tools defined here)
│   │   ├── ocr/
│   │   │   ├── index.ts             ← Main OCR orchestrator
│   │   │   ├── pdf-extractor.ts     ← PDF.js text extraction
│   │   │   ├── tesseract-worker.ts  ← Tesseract.js wrapper
│   │   │   └── invoice-parser.ts    ← Field extraction heuristics
│   │   ├── pdf/
│   │   │   ├── merger.ts
│   │   │   ├── splitter.ts
│   │   │   ├── compressor.ts
│   │   │   └── signer.ts
│   │   ├── image/
│   │   │   ├── compressor.ts
│   │   │   ├── heic-converter.ts
│   │   │   ├── resizer.ts
│   │   │   └── watermark.ts
│   │   └── invoice/
│   │       ├── generator.ts
│   │       └── templates.ts
│   ├── db.ts                        ← Turso client init
│   ├── stripe.ts                    ← Stripe client init
│   └── utils.ts
├── public/
│   ├── tesseract/                   ← Tesseract WASM files (served statically)
│   │   ├── tesseract-core.wasm.js
│   │   ├── worker.min.js
│   │   └── lang-data/
│   │       └── eng.traineddata      ← English language data
│   └── og/                          ← Open Graph images per tool
├── middleware.ts                    ← Clerk auth middleware
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

### Tool Page Generation

Tool pages are statically generated at build time using `generateStaticParams`:

```typescript
// app/tools/[category]/[slug]/page.tsx

import { toolRegistry } from '@/lib/tools/registry'
import { ToolShell } from '@/components/tools/ToolShell'
import { generateToolMetadata } from '@portfolio/seo'

export async function generateStaticParams() {
  return toolRegistry.map((tool) => ({
    category: tool.category,
    slug: tool.slug,
  }))
}

export async function generateMetadata({ params }) {
  const tool = toolRegistry.find(
    (t) => t.category === params.category && t.slug === params.slug
  )
  return generateToolMetadata(tool)
}

export default function ToolPage({ params }) {
  const tool = toolRegistry.find(
    (t) => t.category === params.category && t.slug === params.slug
  )
  return <ToolShell tool={tool} />
}
```

---

## 5. Tool Registry & Catalogue

### ToolConfig Type

```typescript
// packages/tool-sdk/types.ts

export type ToolCategory =
  | 'business'
  | 'calculators'
  | 'pdf'
  | 'image'
  | 'writing'

export interface ToolLimits {
  anonymous: number | null  // ops/day, null = unlimited
  free:      number | null  // ops/day, null = unlimited
  pro:       number | null  // null = unlimited
}

export interface ToolFAQ {
  question: string
  answer:   string
}

export interface ToolConfig {
  slug:        string
  name:        string
  description: string              // Short (used in cards + meta description)
  about:       string              // 200–400 words for SEO content section
  category:    ToolCategory
  icon:        string              // Lucide icon name
  tags:        string[]
  limits:      ToolLimits
  limitPeriod: 'day' | 'month'
  component:   React.ComponentType // Dynamically imported
  seo: {
    title:       string
    description: string
    keywords:    string[]
    faqs:        ToolFAQ[]
  }
}
```

### Complete Tool Catalogue

#### 🧾 Category: Business (slug prefix: `business`)

**Tool 1: Invoice Generator**
```typescript
{
  slug:        'invoice-generator',
  name:        'Invoice Generator',
  description: 'Create professional invoices in seconds. Download as PDF.',
  category:    'business',
  icon:        'FileText',
  limits:      { anonymous: 2, free: 5, pro: null },
  limitPeriod: 'day',
  seo: {
    title:       'Free Invoice Generator — Create Professional Invoices Online | EasyBiscuit',
    description: 'Create and download professional invoices as PDF in seconds. No account required. Free invoice generator for small businesses and freelancers.',
    keywords:    ['invoice generator', 'free invoice maker', 'invoice template online', 'create invoice pdf', 'freelance invoice generator'],
    faqs: [
      { question: 'Can I add my logo to the invoice?', answer: 'Yes — free accounts can upload a logo. Pro accounts can save their logo permanently so it auto-fills on every invoice.' },
      { question: 'What format does the invoice download in?', answer: 'Invoices download as a professional PDF, generated entirely in your browser. Nothing is uploaded to our servers.' },
      { question: 'Can I save invoice templates?', answer: 'Pro users can save invoice templates and client profiles so their details auto-fill for repeat invoices.' },
    ]
  }
}
```

**Tool 2: Invoice Parser (OCR)**
```typescript
{
  slug:        'invoice-parser',
  name:        'Invoice Parser',
  description: 'Extract data from any invoice — PDF or photo. Export to Excel in one click.',
  category:    'business',
  icon:        'ScanText',
  limits:      { anonymous: 2, free: 3, pro: null },
  limitPeriod: 'day',
  seo: {
    title:       'Invoice Parser — Extract Invoice Data Automatically | EasyBiscuit',
    description: 'Upload any invoice PDF or photo and instantly extract vendor, date, line items, and totals. Export to Excel for your accountant. Processed privately in your browser.',
    keywords:    ['invoice parser', 'extract data from invoice', 'invoice ocr online', 'invoice data extraction', 'read invoice pdf'],
    faqs: [
      { question: 'Is my invoice data safe?', answer: 'Completely. Your invoices are processed using OCR technology that runs entirely in your browser. The files never leave your device and are never uploaded to any server.' },
      { question: 'What types of invoices does it support?', answer: 'EasyBiscuit supports digital PDF invoices (extremely accurate) and scanned or photographed invoices (good accuracy on clear scans). It shows a confidence score so you know how reliable the extraction was.' },
      { question: 'What does the export include?', answer: 'The export includes vendor name, invoice number, date, due date, all line items with quantities and prices, subtotal, tax, and total — formatted as a spreadsheet ready to send to your accountant.' },
    ]
  }
}
```

**Tool 3: Receipt Scanner**
```typescript
{
  slug:        'receipt-scanner',
  name:        'Receipt Scanner',
  description: 'Photograph or upload a receipt and extract expense data instantly.',
  category:    'business',
  icon:        'Receipt',
  limits:      { anonymous: 2, free: 5, pro: null },
  limitPeriod: 'day',
  // Same OCR engine as Invoice Parser — reuses lib/tools/ocr/
}
```

**Tool 4: Quote / Proposal Generator**
```typescript
{
  slug:        'quote-generator',
  name:        'Quote Generator',
  description: 'Create professional quotes and proposals. Download as PDF.',
  category:    'business',
  icon:        'ClipboardList',
  limits:      { anonymous: 2, free: 5, pro: null },
  limitPeriod: 'day',
}
```

**Tool 5: Email Signature Generator**
```typescript
{
  slug:        'email-signature-generator',
  name:        'Email Signature Generator',
  description: 'Build a professional HTML email signature. Copy and paste into any email client.',
  category:    'business',
  icon:        'Mail',
  limits:      { anonymous: null, free: null, pro: null }, // Fully free — lead gen tool
  limitPeriod: 'day',
  seo: {
    keywords: ['email signature generator', 'html email signature', 'professional email signature', 'free email signature maker'],
  }
}
```

**Tool 6: eSign PDF**
```typescript
{
  slug:        'esign-pdf',
  name:        'eSign PDF',
  description: 'Sign any PDF document online. Draw, type, or upload your signature.',
  category:    'business',
  icon:        'PenLine',
  limits:      { anonymous: 1, free: 3, pro: null },
  limitPeriod: 'day',
}
```

**Tool 7: QR Code Generator**
```typescript
{
  slug:        'qr-code-generator',
  name:        'QR Code Generator',
  description: 'Generate QR codes for any URL, text, or contact. Download as PNG or SVG.',
  category:    'business',
  icon:        'QrCode',
  limits:      { anonymous: null, free: null, pro: null }, // Fully free — high traffic tool
  limitPeriod: 'day',
  seo: {
    keywords: ['qr code generator', 'qr code maker free', 'generate qr code', 'qr code for business', 'free qr code download'],
  }
}
```

---

#### 🧮 Category: Calculators (slug prefix: `calculators`)

All calculators are **fully free with no limits**. They are pure lead-generation and SEO tools. No usage tracking needed.

| Slug | Name | Icon |
|---|---|---|
| `vat-calculator` | VAT / GST Calculator | `Percent` |
| `profit-margin-calculator` | Profit Margin Calculator | `TrendingUp` |
| `markup-calculator` | Markup Calculator | `ArrowUpRight` |
| `discount-calculator` | Discount Calculator | `Tag` |
| `break-even-calculator` | Break-Even Calculator | `Scale` |
| `hourly-rate-calculator` | Hourly Rate Calculator | `Clock` |
| `currency-converter` | Currency Converter | `ArrowLeftRight` |
| `late-payment-calculator` | Late Payment Interest Calculator | `CalendarClock` |

```typescript
// All calculator tools share this limits config:
limits: { anonymous: null, free: null, pro: null },
limitPeriod: 'day',
```

---

#### 📄 Category: PDF (slug prefix: `pdf`)

| Slug | Name | Icon | Limits (anon/free/pro) |
|---|---|---|---|
| `pdf-merger` | PDF Merger | `FilePlus` | 2 / 5 per day / unlimited |
| `pdf-splitter` | PDF Splitter | `FileMinus` | 2 / 5 per day / unlimited |
| `pdf-compressor` | PDF Compressor | `FileDown` | 2 / 5 per day / unlimited |
| `image-to-pdf` | Image to PDF | `ImagePlus` | 2 / 5 per day / unlimited |
| `pdf-to-images` | PDF to Images | `Images` | 2 / 5 per day / unlimited |
| `pdf-form-filler` | PDF Form Filler | `FormInput` | 1 / 3 per day / unlimited |
| `esign-pdf` | eSign PDF | `PenLine` | 1 / 3 per day / unlimited |

---

#### 🖼️ Category: Image (slug prefix: `image`)

| Slug | Name | Icon | Limits (anon/free/pro) |
|---|---|---|---|
| `heic-to-jpg` | HEIC to JPG | `ImageDown` | 3 / 10 per day / unlimited |
| `image-compressor` | Image Compressor | `FileDown` | 3 / 10 per day / unlimited |
| `image-resizer` | Image Resizer | `Maximize2` | 3 / 10 per day / unlimited |
| `social-media-resizer` | Social Media Image Resizer | `Share2` | 3 / 10 per day / unlimited |
| `watermark-tool` | Add Watermark to Image | `Stamp` | 2 / 5 per day / unlimited |
| `favicon-generator` | Favicon Generator | `Globe` | null / null / null (free) |
| `color-palette-extractor` | Color Palette from Image | `Palette` | null / null / null (free) |
| `webp-converter` | WebP Converter | `RefreshCw` | 3 / 10 per day / unlimited |

---

#### ✍️ Category: Writing (slug prefix: `writing`)

All writing tools are **fully free** — no limits. They are SEO traffic drivers and brand-awareness tools.

| Slug | Name | Icon |
|---|---|---|
| `word-counter` | Word & Character Counter | `AlignLeft` |
| `readability-checker` | Readability Score | `BookOpen` |
| `text-cleaner` | Text Cleaner | `Eraser` |
| `case-converter` | Case Converter | `Type` |

---

## 6. Feature Deep Dive: Invoice Parser (OCR)

This is EasyBiscuit's standout differentiator — no competitor offers client-side invoice parsing with privacy guarantees.

### Architecture

```
User uploads file
      │
      ├─── Is it a digital PDF?
      │         │
      │         ▼
      │    PDF.js text extraction (fast, ~95%+ accuracy)
      │         │
      │         ▼
      │    parseInvoiceText(text, confidence=100)
      │
      └─── Is it an image (JPG, PNG, HEIC) or scanned PDF?
                │
                ▼
           Convert to image (if scanned PDF → pdf.js → canvas)
                │
                ▼
           Tesseract.js OCR (WASM Web Worker)
                │
                ▼
           parseInvoiceText(text, confidence)
                │
                ▼
           ParsedInvoice object → UI display + export
```

### File: `lib/tools/ocr/index.ts`

```typescript
import type { ParsedInvoice } from '@portfolio/tool-sdk'

export async function processDocument(file: File): Promise<ParsedInvoice> {
  if (file.type === 'application/pdf') {
    const text = await extractTextFromPdf(file)
    return parseInvoiceText(text, 100)
  }

  // Image input (JPG, PNG, HEIC, WebP)
  const imageFile = file.type === 'image/heic'
    ? await convertHeicToJpeg(file)
    : file

  const { text, confidence } = await runTesseract(imageFile)
  return parseInvoiceText(text, confidence)
}
```

### File: `lib/tools/ocr/pdf-extractor.ts`

```typescript
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs'

export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const textPages: string[] = []

  for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
    // Cap at 5 pages — invoices are rarely longer
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item: any) => item.str)
      .join(' ')
    textPages.push(pageText)
  }

  return textPages.join('\n\n')
}
```

### File: `lib/tools/ocr/tesseract-worker.ts`

```typescript
import Tesseract from 'tesseract.js'

export async function runTesseract(
  file: File | Blob
): Promise<{ text: string; confidence: number }> {
  const { data } = await Tesseract.recognize(file, 'eng', {
    workerPath:  '/tesseract/worker.min.js',
    langPath:    '/tesseract/lang-data',
    corePath:    '/tesseract/tesseract-core.wasm.js',
    logger:      (m) => {
      // Emit progress events for UI progress bar
      if (m.status === 'recognizing text') {
        window.dispatchEvent(new CustomEvent('ocr-progress', {
          detail: { progress: m.progress }
        }))
      }
    },
  })

  return {
    text:       data.text,
    confidence: data.confidence,  // 0–100
  }
}
```

### File: `lib/tools/ocr/invoice-parser.ts`

```typescript
import type { ParsedInvoice } from '@portfolio/tool-sdk'

export function parseInvoiceText(text: string, confidence: number): ParsedInvoice {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  return {
    vendor: {
      name:    extractVendorName(lines),
      email:   extractPattern(text, /[\w.+-]+@[\w-]+\.[a-z]{2,}/i),
      phone:   extractPattern(text, /[\+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}/),
      address: extractAddress(lines),
      taxId:   extractTaxId(text),       // Handles VAT, GST, EIN, ABN patterns
    },
    invoice: {
      number:   extractInvoiceNumber(text),
      date:     extractDate(text, ['invoice date', 'date:', 'issued']),
      dueDate:  extractDate(text, ['due date', 'payment due', 'due by']),
      terms:    extractPattern(text, /net\s*\d+/i),
      currency: detectCurrency(text),
    },
    lineItems: extractLineItems(lines),
    totals: {
      subtotal: extractAmount(text, ['subtotal', 'sub-total', 'net amount']),
      tax:      extractAmount(text, ['tax', 'vat', 'gst', 'hst']),
      taxRate:  extractTaxRate(text),    // e.g. "15% VAT"
      discount: extractAmount(text, ['discount']),
      total:    extractAmount(text, ['total', 'amount due', 'balance due']),
    },
    confidence,
    rawText: text,  // Kept for user to verify extractions
  }
}

// Helper: extract amounts near keyword labels
function extractAmount(text: string, labels: string[]): number {
  const pattern = new RegExp(
    `(?:${labels.join('|')})[:\\s]*[$€£]?\\s*([\\d,]+\\.?\\d*)`,
    'i'
  )
  const match = text.match(pattern)
  if (!match) return 0
  return parseFloat(match[1].replace(/,/g, ''))
}

// Helper: extract line items table
function extractLineItems(lines: string[]): ParsedInvoice['lineItems'] {
  // Look for patterns: description | qty | unit price | total
  // This is the most complex part — uses a sliding window over lines
  // looking for numeric patterns after text descriptions
  const items: ParsedInvoice['lineItems'] = []
  const numberPattern = /\d+(?:\.\d{2})?/

  for (let i = 0; i < lines.length; i++) {
    const numbers = lines[i].match(/\d+(?:\.\d{2})?/g)
    if (numbers && numbers.length >= 2) {
      const total     = parseFloat(numbers[numbers.length - 1])
      const unitPrice = parseFloat(numbers[numbers.length - 2])
      const qty       = parseFloat(numbers[0])
      const description = lines[i].replace(/[\d.,]+/g, '').trim()

      if (total > 0 && description.length > 3) {
        items.push({ description, quantity: qty || 1, unitPrice, total })
      }
    }
  }

  return items
}
```

### ParsedInvoice Type

```typescript
// packages/tool-sdk/types.ts

export interface ParsedInvoice {
  vendor: {
    name:    string
    email:   string
    phone:   string
    address: string
    taxId:   string
  }
  invoice: {
    number:   string
    date:     string
    dueDate:  string
    terms:    string
    currency: string
  }
  lineItems: Array<{
    description: string
    quantity:    number
    unitPrice:   number
    total:       number
  }>
  totals: {
    subtotal: number
    tax:      number
    taxRate:  string
    discount: number
    total:    number
  }
  confidence: number   // 0–100
  rawText:    string   // Original extracted text for user verification
}
```

### Export Formats

```typescript
// lib/tools/ocr/export.ts

export function exportToCsv(invoice: ParsedInvoice): string {
  const rows = [
    ['Field', 'Value'],
    ['Vendor', invoice.vendor.name],
    ['Invoice #', invoice.invoice.number],
    ['Date', invoice.invoice.date],
    ['Due Date', invoice.invoice.dueDate],
    [''],
    ['Description', 'Quantity', 'Unit Price', 'Total'],
    ...invoice.lineItems.map(i => [i.description, i.quantity, i.unitPrice, i.total]),
    [''],
    ['Subtotal', '', '', invoice.totals.subtotal],
    ['Tax', '', '', invoice.totals.tax],
    ['Total', '', '', invoice.totals.total],
  ]
  return rows.map(r => r.join(',')).join('\n')
}

export function exportToXlsx(invoices: ParsedInvoice[]): Blob {
  // For batch export (Pro) — uses xlsx library
  // Multiple invoices become multiple rows in a single sheet
  // Column headers: Vendor, Invoice#, Date, Due Date, Subtotal, Tax, Total
  import('xlsx').then(XLSX => {
    const data = invoices.map(inv => ({
      'Vendor':      inv.vendor.name,
      'Invoice #':   inv.invoice.number,
      'Date':        inv.invoice.date,
      'Due Date':    inv.invoice.dueDate,
      'Currency':    inv.invoice.currency,
      'Subtotal':    inv.totals.subtotal,
      'Tax':         inv.totals.tax,
      'Total':       inv.totals.total,
      'Confidence':  `${inv.confidence}%`,
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Invoices')
    return XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
  })
}
```

### Pro Feature: Batch Invoice Processing

```typescript
// Only available to Pro users
// UI: Multi-file dropzone → processes each file sequentially
// Shows progress: "Processing invoice 3 of 12..."
// On complete: single download button → consolidated XLSX

export async function processBatch(
  files: File[],
  onProgress: (current: number, total: number) => void
): Promise<ParsedInvoice[]> {
  const results: ParsedInvoice[] = []

  for (let i = 0; i < files.length; i++) {
    onProgress(i + 1, files.length)
    const result = await processDocument(files[i])
    results.push(result)
  }

  return results
}
```

### UI Confidence Display

Always show the confidence score to the user:
- **90–100%:** Green badge — "High confidence"
- **70–89%:** Amber badge — "Review recommended"
- **< 70%:** Red badge — "Low confidence — please verify"

Display the raw extracted text in an expandable panel below the structured output, so users can verify and manually correct any field the parser got wrong.

---

## 7. Feature Deep Dive: Invoice Generator

### Output
Generates a professional PDF invoice client-side using jsPDF + a template system.

### Data Model

```typescript
interface InvoiceData {
  // Business (sender) details
  business: {
    name:    string
    email:   string
    phone:   string
    address: string
    taxId:   string
    logo?:   string   // base64 data URL
  }

  // Client (recipient) details
  client: {
    name:    string
    email:   string
    address: string
    taxId?:  string
  }

  // Invoice details
  invoiceNumber: string
  issueDate:     string
  dueDate:       string
  currency:      string
  taxRate:       number   // e.g. 15 for 15%
  notes?:        string
  paymentTerms?: string

  // Line items
  lineItems: Array<{
    description: string
    quantity:    number
    unitPrice:   number
  }>
}
```

### Pro Features: Saved Client Profiles & Templates

Pro users can save their business details permanently (logo, name, address, tax ID) so they never re-enter them. They can also save named client profiles that auto-fill client details on new invoices.

```typescript
// Saved client profiles — stored in Turso, loaded on mount for Pro users
interface SavedClient {
  id:           string
  name:         string
  email:        string
  address:      string
  taxId?:       string
  paymentTerms: string   // 'Net 30' | 'Net 14' | 'Due on receipt' | etc.
}
```

### Invoice Numbering
Auto-increment from a user-configurable prefix. Default: `INV-001`, `INV-002`... Pro users can set a custom prefix (e.g. `EB-2026-001`).

---

## 8. Authentication (Clerk)

### Setup
EasyBiscuit uses its **own separate Clerk instance** from Toolhaus. Do not share Clerk publishable keys between the two apps.

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/stripe(.*)',
])

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect()
})

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jinja2|txt|xml|ico|webp|avif|jpg|jpeg|gif|svg|ttf|woff2?|eot|otf|zip|mp4)).*)', '/(api|trpc)(.*)'],
}
```

### User Plan Storage
The user's plan is stored in Clerk `publicMetadata`:

```typescript
// When Stripe webhook fires (subscription created/updated/deleted):
await clerkClient.users.updateUserMetadata(clerkId, {
  publicMetadata: {
    plan:                   'pro',                    // 'free' | 'pro'
    stripeCustomerId:       'cus_xxx',
    stripeSubscriptionId:   'sub_xxx',
    planExpiresAt:          1234567890,               // Unix timestamp
  }
})
```

### Plan Check Hook

```typescript
// packages/auth/hooks.ts
import { useUser } from '@clerk/nextjs'

export function useIsPro(): boolean {
  const { user } = useUser()
  const meta = user?.publicMetadata as { plan?: string; planExpiresAt?: number }

  if (meta?.plan !== 'pro') return false
  if (meta?.planExpiresAt && Date.now() / 1000 > meta.planExpiresAt) return false
  return true
}
```

### Three-Tier Auth Model

| State | Description | How Detected |
|---|---|---|
| **Anonymous** | No Clerk session. No account. | `auth().userId === null` |
| **Free account** | Signed in, no Pro subscription | `user.publicMetadata.plan !== 'pro'` |
| **Pro** | Signed in, active subscription | `user.publicMetadata.plan === 'pro'` |

---

## 9. Billing & Subscriptions (Stripe)

### Products & Prices

Create two products in the EasyBiscuit Stripe dashboard:

| Product | Price ID env var | Amount | Interval |
|---|---|---|---|
| EasyBiscuit Pro (Monthly) | `STRIPE_MONTHLY_PRICE_ID` | $12.00 | Monthly |
| EasyBiscuit Pro (Annual) | `STRIPE_YEARLY_PRICE_ID` | $79.00 | Yearly |

Always display the annual plan first on the pricing page. Show the monthly equivalent ($6.58/mo) prominently alongside the annual price.

### Checkout Session

```typescript
// app/api/stripe/checkout/route.ts
import Stripe from 'stripe'
import { auth } from '@clerk/nextjs/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { userId } = auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const { priceId, returnPath = '/dashboard' } = await req.json()

  const session = await stripe.checkout.sessions.create({
    mode:                'subscription',
    payment_method_types: ['card'],
    line_items:          [{ price: priceId, quantity: 1 }],
    metadata:            { clerkUserId: userId },
    success_url:         `${process.env.NEXT_PUBLIC_APP_URL}${returnPath}?upgraded=true`,
    cancel_url:          `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    allow_promotion_codes: true,
  })

  return Response.json({ url: session.url })
}
```

### Webhook Handler

```typescript
// app/api/stripe/webhook/route.ts

export async function POST(req: Request) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return new Response('Webhook error', { status: 400 })
  }

  const session      = event.data.object as Stripe.Checkout.Session
  const subscription = event.data.object as Stripe.Subscription
  const clerkUserId  = session.metadata?.clerkUserId
                    || subscription.metadata?.clerkUserId

  switch (event.type) {
    case 'checkout.session.completed':
      await activateProPlan(clerkUserId, session.customer as string, session.subscription as string)
      await sendWelcomeEmail(clerkUserId)
      break

    case 'customer.subscription.deleted':
    case 'invoice.payment_failed':
      await deactivateProPlan(clerkUserId)
      break

    case 'customer.subscription.updated':
      // Handle plan changes (monthly → annual etc.)
      await syncSubscription(clerkUserId, subscription)
      break
  }

  return new Response('OK')
}
```

---

## 10. Usage Tracking & Friction Engine

This is the core monetisation mechanic. It enforces free-tier limits and triggers upgrade prompts at the right moment.

### Limits by Tier

```typescript
// packages/usage/limits.ts

export const EASYBISCUIT_LIMITS: Record<string, ToolLimits> = {
  // Business tools
  'invoice-generator':   { anonymous: 2,    free: 5,    pro: null },
  'invoice-parser':      { anonymous: 2,    free: 3,    pro: null },
  'receipt-scanner':     { anonymous: 2,    free: 5,    pro: null },
  'quote-generator':     { anonymous: 2,    free: 5,    pro: null },
  'esign-pdf':           { anonymous: 1,    free: 3,    pro: null },

  // QR code & calculators — fully free
  'qr-code-generator':   { anonymous: null, free: null, pro: null },
  'email-signature-generator': { anonymous: null, free: null, pro: null },
  'vat-calculator':      { anonymous: null, free: null, pro: null },
  // ... all calculators: null/null/null

  // PDF tools
  'pdf-merger':          { anonymous: 2,    free: 5,    pro: null },
  'pdf-splitter':        { anonymous: 2,    free: 5,    pro: null },
  'pdf-compressor':      { anonymous: 2,    free: 5,    pro: null },
  'image-to-pdf':        { anonymous: 2,    free: 5,    pro: null },

  // Image tools
  'heic-to-jpg':         { anonymous: 3,    free: 10,   pro: null },
  'image-compressor':    { anonymous: 3,    free: 10,   pro: null },
  'image-resizer':       { anonymous: 3,    free: 10,   pro: null },
  'watermark-tool':      { anonymous: 2,    free: 5,    pro: null },

  // Writing & text — fully free
  'word-counter':        { anonymous: null, free: null, pro: null },
  'readability-checker': { anonymous: null, free: null, pro: null },
}
```

### Usage Check API

```typescript
// app/api/usage/check/route.ts

export async function POST(req: Request) {
  const { toolSlug, sessionId } = await req.json()
  const { userId }              = auth()

  const limits = EASYBISCUIT_LIMITS[toolSlug]
  if (!limits) return Response.json({ allowed: true })

  // Pro users: always allowed
  if (userId) {
    const user = await db.query('SELECT plan FROM users WHERE clerk_id = ?', [userId])
    if (user?.plan === 'pro') return Response.json({ allowed: true, remaining: null })
  }

  // Determine applicable limit
  const tier  = userId ? 'free' : 'anonymous'
  const limit = limits[tier]
  if (limit === null) return Response.json({ allowed: true, remaining: null })

  // Count today's usage
  const todayStart = Math.floor(new Date().setHours(0,0,0,0) / 1000)
  const identifier  = userId ?? sessionId

  const { count } = await db.query(`
    SELECT COUNT(*) as count FROM usage_events
    WHERE tool_slug = ?
    AND (clerk_id = ? OR session_id = ?)
    AND created_at >= ?
  `, [toolSlug, identifier, identifier, todayStart])

  const used      = count as number
  const remaining = Math.max(0, limit - used)
  const allowed   = used < limit

  return Response.json({
    allowed,
    used,
    limit,
    remaining,
    shouldPrompt: remaining <= 1,   // Trigger soft upgrade prompt warning
    tier,
  })
}
```

### Upgrade Prompt Triggers

| Trigger | Message |
|---|---|
| `remaining === 1` (one left) | "You have 1 free use left today. Upgrade to Pro for unlimited access." |
| `remaining === 0` (limit hit) | Full UpgradePrompt modal — blocks tool use |
| Anonymous user uses a tool 2× | Soft banner: "Create a free account for more daily uses" |
| User visits pricing page | No trigger — they're already interested |

### UpgradePrompt Component

```typescript
// components/billing/UpgradePrompt.tsx

interface UpgradePromptProps {
  toolName:  string
  remaining: number
  tier:      'anonymous' | 'free'
  onClose:   () => void
}

// For anonymous users hitting limit: show "Create free account" as PRIMARY CTA
// For free users hitting limit: show "Upgrade to Pro" as PRIMARY CTA
// Never show pricing information inside the modal — link to /pricing instead
// Keep it short: one sentence explaining what Pro unlocks, one CTA button
```

---

## 11. Database Schema (Turso)

EasyBiscuit uses its own separate Turso database. The base schema is defined in `packages/database/schema.ts` and extended with EasyBiscuit-specific tables.

```sql
-- ============================================
-- BASE SCHEMA (from packages/database/schema.ts)
-- Applied to both Toolhaus and EasyBiscuit DBs
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  clerk_id              TEXT    PRIMARY KEY,
  plan                  TEXT    NOT NULL DEFAULT 'free',
  stripe_customer_id    TEXT,
  stripe_subscription_id TEXT,
  plan_expires_at       INTEGER,
  created_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at            INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS usage_events (
  id         TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  clerk_id   TEXT    REFERENCES users(clerk_id),
  session_id TEXT    NOT NULL,
  tool_slug  TEXT    NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_usage_events_lookup
  ON usage_events(tool_slug, clerk_id, session_id, created_at);

CREATE TABLE IF NOT EXISTS tool_history (
  id            TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  clerk_id      TEXT    NOT NULL REFERENCES users(clerk_id),
  tool_slug     TEXT    NOT NULL,
  label         TEXT,
  input_summary TEXT,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ============================================
-- EASYBISCUIT-SPECIFIC SCHEMA
-- ============================================

-- Saved client profiles (for invoice/quote generator — Pro only)
CREATE TABLE IF NOT EXISTS saved_clients (
  id            TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  clerk_id      TEXT    NOT NULL REFERENCES users(clerk_id),
  name          TEXT    NOT NULL,
  email         TEXT,
  address       TEXT,
  tax_id        TEXT,
  payment_terms TEXT    NOT NULL DEFAULT 'Net 30',
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Saved business profile (sender details on invoices — Pro only)
CREATE TABLE IF NOT EXISTS business_profile (
  clerk_id      TEXT    PRIMARY KEY REFERENCES users(clerk_id),
  name          TEXT    NOT NULL DEFAULT '',
  email         TEXT    NOT NULL DEFAULT '',
  phone         TEXT    NOT NULL DEFAULT '',
  address       TEXT    NOT NULL DEFAULT '',
  tax_id        TEXT    NOT NULL DEFAULT '',
  logo_base64   TEXT,             -- Stored as base64 data URL
  invoice_prefix TEXT   NOT NULL DEFAULT 'INV',
  next_invoice_number INTEGER NOT NULL DEFAULT 1,
  currency      TEXT    NOT NULL DEFAULT 'USD',
  tax_rate      REAL    NOT NULL DEFAULT 0,
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Parsed invoice history (Pro — batch processing results)
CREATE TABLE IF NOT EXISTS parsed_invoices (
  id            TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  clerk_id      TEXT    NOT NULL REFERENCES users(clerk_id),
  file_name     TEXT    NOT NULL,
  vendor_name   TEXT,
  invoice_number TEXT,
  invoice_date  TEXT,
  total_amount  REAL,
  currency      TEXT,
  confidence    INTEGER,
  parsed_data   TEXT    NOT NULL,  -- Full ParsedInvoice as JSON
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_parsed_invoices_user
  ON parsed_invoices(clerk_id, created_at DESC);
```

---

## 12. Email (Resend)

All transactional emails are sent via Resend from `hello@easybiscuit.co`.

### Email Templates

| Trigger | Subject | Content |
|---|---|---|
| Free account signup | "Welcome to EasyBiscuit 🍪" | Brief welcome, link to dashboard, highlight top 3 tools |
| Upgrade to Pro | "You're on Pro — here's what's unlocked" | Feature summary, receipt note, link to billing portal |
| Usage limit warning (80% used) | "You're almost out of free uses today" | "{Tool} - 1 use left today. Upgrade to keep going." |
| Payment failed | "Action needed: payment issue with EasyBiscuit Pro" | Retry link, billing portal, what happens if not resolved |
| Pro subscription cancelled | "Your Pro subscription has ended" | What they lose, one-click resubscribe link |

```typescript
// packages/email/templates.ts

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(email: string, firstName: string) {
  await resend.emails.send({
    from:    'EasyBiscuit <hello@easybiscuit.co>',
    to:      email,
    subject: 'Welcome to EasyBiscuit 🍪',
    html:    welcomeTemplate({ firstName }),
  })
}

export async function sendProUpgradeEmail(email: string, firstName: string) {
  await resend.emails.send({
    from:    'EasyBiscuit <hello@easybiscuit.co>',
    to:      email,
    subject: "You're on Pro — here's what's unlocked",
    html:    proUpgradeTemplate({ firstName }),
  })
}
```

---

## 13. SEO Infrastructure

### Metadata per Tool Page

```typescript
// packages/seo/index.ts

export function generateToolMetadata(tool: ToolConfig): Metadata {
  return {
    title:       tool.seo.title,
    description: tool.seo.description,
    keywords:    tool.seo.keywords.join(', '),
    openGraph: {
      title:       tool.seo.title,
      description: tool.seo.description,
      url:         `https://easybiscuit.co/tools/${tool.category}/${tool.slug}`,
      siteName:    'EasyBiscuit',
      images:      [{ url: `/og/${tool.slug}.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card:        'summary_large_image',
      title:       tool.seo.title,
      description: tool.seo.description,
    },
    alternates: {
      canonical: `https://easybiscuit.co/tools/${tool.category}/${tool.slug}`,
    },
  }
}
```

### JSON-LD Schemas per Tool Page

Every tool page includes three structured data schemas in a `<script type="application/ld+json">` tag:

**1. SoftwareApplication Schema**
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "{Tool Name}",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "description": "{tool.seo.description}"
}
```

**2. FAQPage Schema** (minimum 3 Q&As per tool)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "{question}",
      "acceptedAnswer": { "@type": "Answer", "text": "{answer}" }
    }
  ]
}
```

**3. BreadcrumbList Schema**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://easybiscuit.co" },
    { "@type": "ListItem", "position": 2, "name": "{Category}", "item": "https://easybiscuit.co/tools/{category}" },
    { "@type": "ListItem", "position": 3, "name": "{Tool Name}", "item": "https://easybiscuit.co/tools/{category}/{slug}" }
  ]
}
```

### Sitemap

```typescript
// app/sitemap.ts

import { toolRegistry } from '@/lib/tools/registry'

export default function sitemap(): MetadataRoute.Sitemap {
  const toolPages = toolRegistry.map((tool) => ({
    url:          `https://easybiscuit.co/tools/${tool.category}/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority:     0.8,
  }))

  return [
    { url: 'https://easybiscuit.co',          priority: 1.0 },
    { url: 'https://easybiscuit.co/tools',    priority: 0.9 },
    { url: 'https://easybiscuit.co/pricing',  priority: 0.9 },
    ...toolPages,
  ]
}
```

### Robots.txt

```
User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /api/

Sitemap: https://easybiscuit.co/sitemap.xml
```

### SEO Content Section (Per Tool Page)

Every tool page renders a 200–400 word "About this tool" section below the tool interface. This content lives in `tool.about` in the registry and is the primary on-page SEO signal beyond the tool itself. It must:
- Answer the question "what is X and why do I need it?"
- Use the primary keyword naturally 2–3 times
- Mention the privacy-first angle ("processed in your browser")
- Be unique per tool — never templated/generated

---

## 14. UI & Design System

### Brand Identity

| Element | Value |
|---|---|
| Primary colour | Warm amber — `#D97706` (Tailwind `amber-600`) |
| Background | Off-white — `#FAFAF7` |
| Surface | Pure white `#FFFFFF` |
| Text | Slate `#1E293B` |
| Accent | Warm orange `#EA580C` |
| Font | Inter (headings + body) |
| Logo | Biscuit icon — friendly, rounded, amber coloured |
| Vibe | Warm, approachable, trustworthy — not corporate |

### ToolShell Component

Every tool page is wrapped in ToolShell, which provides the consistent chrome:

```typescript
// components/tools/ToolShell.tsx

interface ToolShellProps {
  tool:     ToolConfig
  children: React.ReactNode  // The actual tool UI
}

// Renders:
// 1. Tool title + description
// 2. PrivacyBadge ("Processed locally in your browser")
// 3. UsageLimitBanner (if user is close to/at limit)
// 4. {children} — the tool itself
// 5. "About this tool" SEO content section
// 6. FAQAccordion
// 7. RelatedTools grid (3 tools from same category)
```

### PrivacyBadge Component

```typescript
// Appears on every tool page that processes files
// Simple pill badge: 🔒 Your files never leave your browser
// Links to /privacy on click
// Colour: green — signals safety
```

### File Dropzone Component

Reusable across all file-processing tools:

```typescript
interface FileDropzoneProps {
  accept:       string[]          // e.g. ['application/pdf', 'image/*']
  maxSize:      number            // bytes. Free: 15MB, Pro: 100MB
  multiple:     boolean           // Pro batch tools only
  onFiles:      (files: File[]) => void
  isPro:        boolean
}
```

---

## 15. Environment Variables

```bash
# ──────────────────────────────────────────────
# apps/easybiscuit/.env.local
# ──────────────────────────────────────────────

# Clerk (EasyBiscuit's own Clerk instance)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_easybiscuit_...
CLERK_SECRET_KEY=sk_live_easybiscuit_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Stripe (EasyBiscuit's own Stripe account)
STRIPE_SECRET_KEY=sk_live_easybiscuit_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_easybiscuit_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...     # $12.00/month
STRIPE_YEARLY_PRICE_ID=price_...      # $79.00/year

# Turso (EasyBiscuit's own database)
TURSO_DATABASE_URL=libsql://easybiscuit-[org].turso.io
TURSO_AUTH_TOKEN=...

# Resend
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=https://easybiscuit.co
```

---

## 16. Deployment (Vercel)

EasyBiscuit deploys as a separate Vercel project from Toolhaus, both pointing to the same monorepo.

### Vercel Project Settings for EasyBiscuit

| Setting | Value |
|---|---|
| Framework | Next.js |
| Root Directory | `apps/easybiscuit` |
| Build Command | `cd ../.. && pnpm turbo build --filter=easybiscuit` |
| Output Directory | `.next` |
| Install Command | `pnpm install` (at repo root) |
| Node Version | 20.x |

### Vercel Domains
- Production: `easybiscuit.co`
- Preview: auto-generated per PR branch

### Stripe Webhook
Register the Stripe webhook endpoint in the EasyBiscuit Stripe dashboard:
- **URL:** `https://easybiscuit.co/api/stripe/webhook`
- **Events:** `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

---

## 17. Roadmap

### Phase 1 — MVP Launch (Build Now)

**Goal:** Live, indexed, and accepting Pro subscriptions.

**Tools to launch with (20):**
- Business: Invoice Generator, Invoice Parser, Receipt Scanner, Quote Generator, Email Signature Generator, eSign PDF, QR Code Generator
- Calculators: VAT, Profit Margin, Markup, Discount, Break-Even, Hourly Rate, Currency Converter
- PDF: PDF Merger, PDF Compressor, Image to PDF
- Image: HEIC to JPG, Image Compressor, Social Media Resizer

**Infrastructure:**
- Full Clerk auth (all three tiers: anonymous, free, pro)
- Stripe subscription (monthly + annual)
- Usage tracking + upgrade prompts
- Turso schema (all tables)
- Resend transactional emails
- SEO infrastructure (all schemas, sitemap, robots.txt)
- Google Search Console + Bing Webmaster Tools submitted
- Core Web Vitals passing

### Phase 2 — Content & Conversion Optimisation

**Goal:** Improve SEO rankings and free-to-Pro conversion rate.

- Add remaining tools (PDF Splitter, PDF Form Filler, Watermark Tool, Favicon Generator, Color Palette Extractor, WebP Converter, Word Counter, Readability Checker, Text Cleaner, Case Converter, Late Payment Calculator, Barcode Generator)
- SEO blog — "How to create an invoice as a freelancer", "What is VAT and how do I calculate it?" etc.
- A/B test upgrade prompt messaging
- Dashboard improvements: usage graphs, invoice history view for Pro users
- Batch invoice processing UI (Pro)

### Phase 3 — EasyBiscuit Browser Extension

**Goal:** Capture in-browser usage moments and drive awareness.

Extension features (priority order):
1. QR code from any page URL (popup — auto-fills current tab URL)
2. VAT/GST calculator (popup)
3. Currency converter (popup — highlight price → convert)
4. Word counter (right-click selected text → count)
5. Image tools (right-click any image on page → compress/resize/convert)

**Monorepo location:** `apps/easybiscuit-extension/`  
**Shares:** `@portfolio/auth`, `@portfolio/billing` packages  
**Pro integration:** EasyBiscuit Pro subscription unlocks the extension automatically — no separate purchase

### Phase 4 — Product Hunt Launch

Launch after:
- [ ] 50+ Pro subscribers (social proof)
- [ ] Conversion funnel proven (measured free → Pro rate)
- [ ] 10+ genuine user testimonials collected
- [ ] Product polished from real user feedback
- [ ] PH launch offer prepared (e.g. "50% off first 3 months")
- [ ] Toolhaus PH launch done first (separate launch, 2–4 weeks prior)

---

*EasyBiscuit Developer Handoff v1.0 — easybiscuit.co*
