# Toolhaus.dev — Developer Handoff: Part 1 of 2
## Architecture, Stack, Registry, SEO & Shell

**Version:** 1.0 | **Date:** 2026-02-28 | **Domain:** toolhaus.dev  
**Stack:** Next.js 15 / TypeScript / Tailwind CSS v4  
> Part 2 covers: All 25 Tool Specs, Monetisation, Auth, Payments, Extension, Deployment.

---

## Table of Contents (Part 1)

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Repository Structure](#3-repository-structure)
4. [Core Architecture](#4-core-architecture)
5. [Tools Registry](#5-tools-registry)
6. [SEO Infrastructure](#6-seo-infrastructure)
7. [Tool Shell Layout](#7-tool-shell-layout)
8. [Performance Strategy](#8-performance-strategy)
9. [Privacy Implementation](#9-privacy-implementation)

---

## 1. Project Overview

### What is Toolhaus?

Toolhaus is a developer utility tools hub — a single branded destination hosting 25+ small, fast, privacy-first tools that developers use daily. Every tool runs entirely client-side (no server sees user data). The site is monetised via a dual-track model: EthicalAds for free users, and a Pro subscription tier ($7/month or $49/year) that removes ads and unlocks power features.

### Brand Positioning

> *"The dev tools hub that actually gets the AI era."*

- **Privacy-first:** All processing happens in the browser. No data is sent to servers.
- **AI-era aware:** Includes tools no other hub has (LLM token counter, AI cost calculator).
- **Quality over quantity:** Every tool is better than the incumbent, not just functional.
- **Fast:** Sub-second tool loads, client-side processing, zero unnecessary network calls.

### Target User

Mid-to-senior developers (frontend, backend, full-stack) who regularly need quick utility tools without installing software or pasting sensitive data into untrusted sites.

---

## 2. Tech Stack & Dependencies

### Core Framework

```
Framework:        Next.js 15 (App Router, React 19)
Language:         TypeScript 5.x (strict mode)
Styling:          Tailwind CSS v4
UI Components:    shadcn/ui + Radix UI primitives
Code Editor:      CodeMirror 6
URL State:        nuqs (next-usequerystate) v2
Local State:      Zustand v5
Icons:            Lucide React
Animations:       Framer Motion (minimal, micro-interactions only)
Monorepo:         Turborepo
Package Manager:  pnpm
```

### Infrastructure

```
Hosting:          Vercel (Pro plan)
Database:         Turso (SQLite/libSQL) — Pro user data only
Auth:             Clerk
Payments:         Stripe
Ads:              EthicalAds
Analytics:        Plausible (privacy-respecting, no cookie banner needed)
Error tracking:   Sentry (optional, add post-launch)
```

### Tool-Specific Libraries

```
js-tiktoken          LLM tokenisation (WASM, ~2MB)
js-yaml              YAML parsing/serialisation
@iarna/toml          TOML parsing/serialisation
papaparse            CSV parsing
marked               Markdown to HTML
diff                 Text diff algorithm
cronstrue            Cron to human-readable
cron-parser          Cron next-run calculation
culori               Color conversion (all formats including OKLCH)
spark-md5            MD5 hashing (SHA family uses Web Crypto)
json-to-ts           JSON to TypeScript interface generation
ulid                 ULID generation
nanoid               NanoID generation
DOMPurify            XSS sanitisation for Markdown preview output
```

### Key Architecture Dependencies

```
nuqs                 URL state persistence (shareable links)
@clerk/nextjs        Authentication
stripe               Payment processing
@libsql/client       Turso database client
fuse.js              Client-side tool search (command palette)
```

---

## 3. Repository Structure

```
toolhaus/
├── apps/
│   ├── web/                              # Main Next.js application
│   │   ├── app/
│   │   │   ├── (marketing)/
│   │   │   │   ├── page.tsx              # Homepage
│   │   │   │   ├── about/page.tsx
│   │   │   │   └── pricing/page.tsx
│   │   │   ├── tools/
│   │   │   │   ├── layout.tsx            # Tool shell (shared wrapper)
│   │   │   │   ├── page.tsx              # Tool directory + search
│   │   │   │   ├── [category]/
│   │   │   │   │   └── page.tsx          # Category landing page (SEO)
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx          # Individual tool page (SSG)
│   │   │   ├── api/
│   │   │   │   ├── pro/
│   │   │   │   │   ├── claude-tokens/    # Exact Claude token count (Pro only)
│   │   │   │   │   └── history/          # Saved tool history
│   │   │   │   └── webhooks/
│   │   │   │       └── stripe/           # Stripe webhook handler
│   │   │   ├── sign-in/[[...sign-in]]/
│   │   │   ├── sign-up/[[...sign-up]]/
│   │   │   ├── sitemap.ts                # Auto-generated from tools registry
│   │   │   └── robots.ts
│   │   ├── components/
│   │   │   ├── tools/                    # One component per tool
│   │   │   │   ├── JsonFormatter.tsx
│   │   │   │   ├── Base64Tool.tsx
│   │   │   │   ├── UuidGenerator.tsx
│   │   │   │   ├── TimestampConverter.tsx
│   │   │   │   ├── UrlTool.tsx
│   │   │   │   ├── HashGenerator.tsx
│   │   │   │   ├── TextDiff.tsx
│   │   │   │   ├── RegexTester.tsx
│   │   │   │   ├── CronBuilder.tsx
│   │   │   │   ├── ColorConverter.tsx
│   │   │   │   ├── LlmTokenCounter.tsx
│   │   │   │   ├── AiCostCalculator.tsx
│   │   │   │   ├── CaseConverter.tsx
│   │   │   │   ├── EnvValidator.tsx
│   │   │   │   ├── OpenApiValidator.tsx
│   │   │   │   ├── DataFormatConverter.tsx
│   │   │   │   ├── CsvJsonConverter.tsx
│   │   │   │   ├── JwtDecoder.tsx
│   │   │   │   ├── HtmlEntityTool.tsx
│   │   │   │   ├── LoremIpsumGenerator.tsx
│   │   │   │   ├── NumberBaseConverter.tsx
│   │   │   │   ├── JsonToTypescript.tsx
│   │   │   │   ├── MarkdownPreview.tsx
│   │   │   │   ├── CssGradientGenerator.tsx
│   │   │   │   └── StringUtilities.tsx
│   │   │   ├── shell/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── ToolShell.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── CommandPalette.tsx    # ⌘K tool search
│   │   │   │   └── Footer.tsx
│   │   │   └── ui/                       # shadcn/ui components
│   │   └── lib/
│   │       ├── tools/                    # Pure tool logic (no React)
│   │       │   ├── json/index.ts
│   │       │   ├── base64/index.ts
│   │       │   ├── uuid/index.ts
│   │       │   ├── timestamp/index.ts
│   │       │   ├── url/index.ts
│   │       │   ├── hash/index.ts
│   │       │   ├── diff/index.ts
│   │       │   ├── regex/index.ts
│   │       │   ├── cron/index.ts
│   │       │   ├── color/index.ts
│   │       │   ├── ai-tokens/
│   │       │   │   ├── index.ts
│   │       │   │   └── worker.ts         # Web Worker for tokenisation
│   │       │   ├── data-formats/index.ts
│   │       │   ├── csv/index.ts
│   │       │   ├── jwt/index.ts
│   │       │   ├── html-entities/index.ts
│   │       │   ├── lorem/index.ts
│   │       │   ├── number-base/index.ts
│   │       │   ├── json-to-ts/index.ts
│   │       │   ├── markdown/index.ts
│   │       │   ├── gradient/index.ts
│   │       │   └── string-utils/index.ts
│   │       ├── tools-registry.ts
│   │       ├── seo.ts
│   │       ├── db.ts                     # Turso client
│   │       └── stripe.ts
│   └── extension/                        # Phase 2 — Chrome Extension
│       ├── manifest.json
│       ├── popup/
│       ├── content-script.ts
│       └── service-worker.ts
└── packages/
    ├── tool-sdk/                         # Shared types + interfaces
    │   ├── types.ts
    │   └── constants.ts
    └── ui/                               # Shared design tokens (future)
```

---

## 4. Core Architecture

### Principles

1. **Client-side first:** Every tool processes data in the browser. No API routes for tool logic.
2. **URL state:** All tool inputs/outputs persist to the URL via `nuqs`. Every result is shareable.
3. **Tool isolation:** Each tool is an independent React component loaded lazily. Adding/removing tools requires only editing the registry.
4. **SSG per tool:** Every tool page is statically generated at build time for maximum SEO performance.

### Data Flow

```
User input
    ↓
URL state update (nuqs) — persists immediately to URL
    ↓
useMemo / useEffect triggers pure tool function
    ↓
lib/tools/[name]/index.ts (pure TypeScript, no React)
    ↓
Result displayed in output panel
    ↓
(Pro only) History saved to Turso via /api/pro/history
```

### Tool Component Contract

Every tool component must conform to this interface:

```typescript
// packages/tool-sdk/types.ts

export interface ToolResult {
  output: string
  isValid: boolean
  error?: {
    message: string
    line?: number
    column?: number
  }
  metadata?: Record<string, unknown>
}

export interface ToolProps {
  isPro?: boolean
  onHistorySave?: (entry: HistoryEntry) => void
}

export type ToolCategory =
  | 'data-formats'
  | 'encoding'
  | 'generators'
  | 'date-time'
  | 'web'
  | 'security'
  | 'text'
  | 'devops'
  | 'design'
  | 'ai-era'
  | 'code'
  | 'math'

export interface ToolConfig {
  slug: string
  name: string
  shortName: string                   // For extension popup (max 15 chars)
  description: string                 // 150-160 chars for meta description
  category: ToolCategory
  tags: string[]
  component: React.LazyExoticComponent<React.FC<ToolProps>>
  isNew?: boolean
  isPro?: boolean
  isAiEra?: boolean
  schema: {
    faqs: Array<{ question: string; answer: string }>
    appCategory: 'DeveloperApplication' | 'UtilitiesApplication'
  }
  relatedTools: string[]
  keywordsForSeo: string[]
  libraryCredits?: string[]
}
```

### The Single Most Important Architectural Decision

**Use URL state (nuqs) for all tool inputs — not localStorage, not a database, not React state alone.**

This means:
- Every tool result is automatically shareable (`/tools/json-formatter?input=...&mode=format`)
- Backlinks from developers sharing results drive SEO
- Zero server infrastructure for tool state
- Works offline, no sign-in required
- Pro users get "saved history" as a genuine upgrade stored in Turso

This one choice separates Toolhaus from every incumbent in the space. None of them do it.

---

## 5. Tools Registry

```typescript
// apps/web/lib/tools-registry.ts
import { lazy } from 'react'
import type { ToolConfig } from '@toolhaus/tool-sdk'

export const tools: ToolConfig[] = [
  {
    slug: 'json-formatter',
    name: 'JSON Formatter & Validator',
    shortName: 'JSON',
    description: 'Format, validate and minify JSON online — processed entirely in your browser. Supports 2-space, 4-space and tab indentation.',
    category: 'data-formats',
    tags: ['json', 'formatter', 'validator', 'beautifier', 'minifier', 'lint'],
    component: lazy(() => import('@/components/tools/JsonFormatter')),
    relatedTools: ['data-format-converter', 'openapi-validator', 'text-diff', 'json-to-typescript'],
    keywordsForSeo: ['json formatter', 'json beautifier', 'json validator online', 'json minifier'],
    schema: {
      faqs: [
        { question: 'Is my JSON data safe?', answer: 'Yes. All processing happens in your browser. No data is sent to Toolhaus servers.' },
        { question: 'What is the maximum JSON size?', answer: 'There is no hard limit. Files above 50MB may be slow due to browser memory.' },
        { question: 'What is the difference between formatting and minifying?', answer: 'Formatting adds whitespace for readability. Minifying removes all whitespace to reduce file size.' },
      ],
      appCategory: 'DeveloperApplication',
    },
  },
  // All remaining 24 tools follow the same pattern.
  // Slugs for all 25 tools:
  // json-formatter, base64-tool, uuid-generator, timestamp-converter, url-tool,
  // hash-generator, text-diff, regex-tester, cron-builder, color-converter,
  // llm-token-counter, ai-cost-calculator, case-converter, env-validator, openapi-validator,
  // data-format-converter, csv-json-converter, jwt-decoder, html-entity-tool,
  // lorem-ipsum-generator, number-base-converter, json-to-typescript,
  // markdown-preview, css-gradient-generator, string-utilities
]

export const getToolBySlug = (slug: string) => tools.find(t => t.slug === slug)
export const getToolsByCategory = (cat: ToolCategory) => tools.filter(t => t.category === cat)
export const categories = [...new Set(tools.map(t => t.category))]
```

---

## 6. SEO Infrastructure

### Static Generation Per Tool

```typescript
// apps/web/app/tools/[slug]/page.tsx

export const dynamicParams = false  // 404 any slug not in registry

export async function generateStaticParams() {
  return tools.map(t => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const tool = getToolBySlug(params.slug)
  if (!tool) return {}
  return {
    title: `${tool.name} — Toolhaus`,
    description: tool.description,
    keywords: tool.keywordsForSeo.join(', '),
    openGraph: {
      title: `${tool.name} — Toolhaus`,
      description: tool.description,
      url: `https://toolhaus.dev/tools/${tool.slug}`,
      siteName: 'Toolhaus',
      type: 'website',
    },
    alternates: { canonical: `https://toolhaus.dev/tools/${tool.slug}` },
  }
}

export default function ToolPage({ params }: { params: { slug: string } }) {
  const tool = getToolBySlug(params.slug)
  if (!tool) notFound()
  const ToolComponent = tool.component

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateToolSchema(tool)) }}
      />
      <ToolShell tool={tool}>
        <Suspense fallback={<ToolSkeleton />}>
          <ToolComponent />
        </Suspense>
      </ToolShell>
    </>
  )
}
```

### Schema Generator

```typescript
// apps/web/lib/seo.ts

export function generateToolSchema(tool: ToolConfig) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: tool.name,
        applicationCategory: tool.schema.appCategory,
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description: tool.description,
        url: `https://toolhaus.dev/tools/${tool.slug}`,
        creator: { '@type': 'Organization', name: 'Toolhaus', url: 'https://toolhaus.dev' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: tool.schema.faqs.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Tools', item: 'https://toolhaus.dev/tools' },
          { '@type': 'ListItem', position: 2, name: tool.category },
          { '@type': 'ListItem', position: 3, name: tool.name },
        ],
      },
    ],
  }
}
```

### Sitemap

```typescript
// apps/web/app/sitemap.ts
import { MetadataRoute } from 'next'
import { tools } from '@/lib/tools-registry'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://toolhaus.dev',        lastModified: new Date(), priority: 1.0 },
    { url: 'https://toolhaus.dev/tools',  lastModified: new Date(), priority: 0.9 },
    ...tools.map(tool => ({
      url: `https://toolhaus.dev/tools/${tool.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
```

### SEO Page Content Requirements (Per Tool)

Every tool page must include below the tool UI:

1. **About section** (200–400 words): what the tool does, common use cases, how client-side processing works
2. **FAQPage schema** (minimum 3 Q&As from `tool.schema.faqs`)
3. **Related tools grid** (3–5 tools from `tool.relatedTools`)
4. **Library credits** (small footer note: "Powered by js-tiktoken")

---

## 7. Tool Shell Layout

The `ToolShell` wraps every tool page — handles ads, related tools, Pro upsell, and SEO content. Individual tool components never manage any of this.

```
┌───────────────────────────────────────────────────────────────────┐
│  🔧 Toolhaus    [Search tools ⌘K]            [Go Pro]  [Sign In] │  Navbar
├────────────────────────────────────────────┬──────────────────────┤
│                                            │                      │
│  h1: {tool.name}         🟢 Local only    │  EthicalAds unit     │
│  {tool.description}                        │  (hidden for Pro)    │
│                                            │                      │
│  ┌──────────────────────────────────────┐  ├──────────────────────┤
│  │                                      │  │  Related Tools       │
│  │  [Tool UI Component]                 │  │  ────────────────    │
│  │                                      │  │  • Tool A            │
│  │  Input → Processing → Output         │  │  • Tool B            │
│  │                                      │  │  • Tool C            │
│  └──────────────────────────────────────┘  │                      │
│                                            ├──────────────────────┤
│  [Copy] [Download] [Share Link] [Clear]    │  🔒 Upgrade to Pro   │
│                                            │  Remove ads + more   │
│                                            │  $7/mo or $49/yr     │
│                                            │  [View Plans]        │
├────────────────────────────────────────────┴──────────────────────┤
│  ## About {tool.name}   (200–400 words SEO content)               │
│  ## FAQ                 (FAQPage schema — min 3 questions)         │
│  ## Related Tools       (internal linking grid)                   │
└───────────────────────────────────────────────────────────────────┘
```

```typescript
// components/shell/ToolShell.tsx
'use client'
import { useUser } from '@clerk/nextjs'

export function ToolShell({ tool, children }: { tool: ToolConfig; children: React.ReactNode }) {
  const { user } = useUser()
  const isPro = user?.publicMetadata?.plan === 'pro'

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{tool.name}</h1>
                <PrivacyBadge />
                {tool.isAiEra && <AiEraBadge />}
                {tool.isNew && <NewBadge />}
              </div>
              <p className="text-muted-foreground">{tool.description}</p>
            </div>

            {children}

            <ToolActionBar />          {/* Copy, Download, Share, Clear */}
            <ToolSeoContent tool={tool} />  {/* About, FAQ, Related */}
          </div>

          <aside className="w-72 shrink-0 hidden lg:block">
            {!isPro && <EthicalAdsUnit />}
            <RelatedTools slugs={tool.relatedTools} />
            {!isPro && <ProUpsellCard />}
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  )
}
```

### Privacy Badge Component

```tsx
// components/ui/PrivacyBadge.tsx
export function PrivacyBadge() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 border border-emerald-200 rounded-full px-2 py-0.5 cursor-help">
          <ShieldCheckIcon className="w-3 h-3" />
          Processed locally
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs text-sm">
          All processing happens in your browser. No data is sent to Toolhaus servers.
        </p>
      </TooltipContent>
    </Tooltip>
  )
}
```

### Ad Unit Component

```tsx
// components/shell/EthicalAdsUnit.tsx
'use client'
export function EthicalAdsUnit() {
  return (
    <div
      data-ea-publisher="toolhausdev"
      data-ea-type="text"
      data-ea-style="stickybox"
      className="ethical-ads-unit mb-6"
    />
  )
}
// Load in root layout:
// <Script src="https://media.ethicalads.io/media/client/ethicalads.min.js" strategy="lazyOnload" />

// Hide for Pro users via global CSS:
// .is-pro .ethical-ads-unit { display: none; }
```

---

## 8. Performance Strategy

### Build-time

- All tool pages statically generated (`generateStaticParams`)
- `next/font` eliminates external font network requests
- `dynamicParams = false` ensures no SSR fallback for unknown slugs

### Runtime

| Concern | Solution |
|---|---|
| WASM tokeniser (~2MB) | Web Worker with dynamic import — never blocks main thread |
| CodeMirror bundle | Import only required language extensions per tool |
| Tool components | All `React.lazy()` — zero cost until tool page visited |
| Ad script | `strategy="lazyOnload"` — loads after page interactive |
| Large file hashing | Web Worker + streaming ArrayBuffer |

### Core Web Vitals Targets

| Metric | Target |
|---|---|
| LCP | < 1.8s |
| INP | < 100ms |
| CLS | < 0.1 |

### Per-Page Bundle Budget

```
Shell (Navbar, Sidebar, Footer):   ~80KB gzipped
shadcn/ui components:              ~40KB gzipped
CodeMirror (tools that use it):    ~60KB gzipped
Tool logic:                        ~5–30KB gzipped
──────────────────────────────────────────────────
Total (excl. WASM):                ~175–210KB gzipped
Token counter adds:                ~2MB WASM (cached after first visit)
```

---

## 9. Privacy Implementation

### Technical Commitments

- No tool logic runs on Toolhaus servers
- No analytics events on tool input content (only page views via Plausible)
- No `console.log` of user inputs in production builds
- No third-party scripts beyond EthicalAds, Clerk, Plausible

### Public Privacy Commitments (`/privacy` page)

- "Tool inputs never leave your browser"
- Link to public GitHub repository for verification
- Full list of third-party services and what data each receives
- Explanation of what Clerk stores (user account data only, no tool usage content)

### Vercel Security Headers

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options",  "value": "nosniff" },
        { "key": "X-Frame-Options",          "value": "DENY" },
        { "key": "X-XSS-Protection",         "value": "1; mode=block" },
        { "key": "Referrer-Policy",          "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy",       "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

---

*Part 1 of 2 — continued in Toolhaus_Handoff_Part2_Tools_Monetisation.md*  
*Toolhaus.dev — 2026-02-28*
