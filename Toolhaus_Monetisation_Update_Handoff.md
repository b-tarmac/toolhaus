# Toolhaus — Monetisation Update Handoff
**Version:** 2.0 (Delta from original spec)  
**Date:** 2026-03-01  
**Scope:** This document describes only what is **changing or being added** relative to the original Toolhaus build. Anything not mentioned here remains as originally specified.

---

## Table of Contents

1. [Summary of Changes](#1-summary-of-changes)
2. [Remove EthicalAds](#2-remove-ethicalads)
3. [Three-Tier Auth Model](#3-three-tier-auth-model)
4. [Usage Tracking & Friction Engine](#4-usage-tracking--friction-engine)
5. [Database Schema Changes](#5-database-schema-changes)
6. [Saved Workspaces](#6-saved-workspaces)
7. [Batch Processing](#7-batch-processing)
8. [Pro API Access](#8-pro-api-access)
9. [CLI Package](#9-cli-package)
10. [Persistent Share Links](#10-persistent-share-links)
11. [Pricing Page Rewrite](#11-pricing-page-rewrite)
12. [Upgrade Prompt System](#12-upgrade-prompt-system)
13. [Dashboard Updates](#13-dashboard-updates)
14. [Email Flows](#14-email-flows)
15. [Environment Variables](#15-environment-variables)
16. [Implementation Order](#16-implementation-order)

---

## 1. Summary of Changes

### Why This Update Exists
The original Pro tier offered ad removal, history, and larger uploads — all friction-removal features. Research and user feedback confirmed that developers don't pay to reduce friction; they pay for genuine capability. The new model repositions Pro as a **workflow integration layer**, not a premium experience tier.

### What's Changing

| Area | Before | After |
|---|---|---|
| Revenue model | EthicalAds + Pro subscription | Pro subscription only — no ads on any tier |
| Free tier | Single tier (no account needed) | Three tiers: Anonymous → Free account → Pro |
| Pro headline feature | Ad removal | CLI access + batch processing |
| Pricing page | Ad removal listed first | CLI listed first, ads removed listed last |
| Upgrade triggers | Ads present on page | Contextual in-product prompts at limit moments |
| Workspaces | Not built | Saved named workspaces per tool |
| Batch processing | Not built | Built per-tool, Pro only |
| API | Not built | Auth-gated, 1,000 req/day, Pro only |
| CLI | Not built | `npm install -g @toolhaus/cli`, Pro only |
| Share links | URL param only (stateless) | Persistent named links for Pro users |

---

## 2. Remove EthicalAds

### Files to Delete
```
components/ads/EthicalAd.tsx
components/ads/AdSlot.tsx
components/ads/AdBanner.tsx        ← if exists
```

### Code to Remove

**`app/layout.tsx`** — remove EthicalAds script tag:
```tsx
// DELETE this:
<script
  async
  src="https://media.ethicalads.io/media/client/ethicalads.min.js"
/>
```

**`components/tools/ToolShell.tsx`** — remove ad slot rendering and the `is-pro` conditional:
```tsx
// DELETE everything like this:
{!isPro && <AdSlot placement="tool-sidebar" />}
{!isPro && <AdBanner placement="tool-bottom" />}
```

**`middleware.ts` or any route handler** — remove any ad-related logic.

**`app/globals.css`** — remove any `.ea-*` or `.ethical-ad` CSS rules.

### Environment Variables to Remove
```
ETHICAL_ADS_PUBLISHER_ID        ← delete from .env and Vercel
```

### Verification
After removal, run a search across the entire codebase for `ethicalads`, `ethical-ads`, `ea-content`, and `AdSlot` to confirm complete removal. No ad-related code should remain.

---

## 3. Three-Tier Auth Model

### The Tiers

```
Anonymous (no Clerk session)
    │
    │  "Create free account" prompt after 2–3 uses
    ▼
Free Account (Clerk session, no subscription)
    │
    │  Upgrade prompt at usage limits
    ▼
Pro (Clerk session + active Stripe subscription)
```

### Tier Detection

```typescript
// lib/auth/tier.ts

import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export type UserTier = 'anonymous' | 'free' | 'pro'

export async function getUserTier(): Promise<UserTier> {
  const { userId } = auth()

  if (!userId) return 'anonymous'

  const user = await db.execute({
    sql:  'SELECT plan, plan_expires_at FROM users WHERE clerk_id = ?',
    args: [userId],
  })

  const row = user.rows[0]
  if (!row) return 'free'                           // Signed in but not in DB yet

  if (row.plan !== 'pro') return 'free'
  if (row.plan_expires_at && Date.now() / 1000 > Number(row.plan_expires_at)) return 'free'

  return 'pro'
}

// Client-side hook
export function useUserTier(): UserTier {
  const { user } = useUser()
  const meta = user?.publicMetadata as { plan?: string; planExpiresAt?: number }

  if (!user) return 'anonymous'
  if (meta?.plan !== 'pro') return 'free'
  if (meta?.planExpiresAt && Date.now() / 1000 > meta.planExpiresAt) return 'free'
  return 'pro'
}
```

### What Each Tier Can Do

```typescript
// lib/auth/permissions.ts

export const TIER_PERMISSIONS = {
  anonymous: {
    tools:          'all',          // All tools accessible
    history:        false,
    workspaces:     false,
    batchProcessing:false,
    apiAccess:      false,
    cliAccess:      false,
    shareLinks:     'url-only',     // URL param sharing — existing behaviour
    fileSizeLimit:  15 * 1024 * 1024, // 15MB
  },
  free: {
    tools:          'all',
    history:        true,           // Last 10 results per tool
    workspaces:     true,           // 1 saved workspace per tool
    batchProcessing:false,
    apiAccess:      false,
    cliAccess:      false,
    shareLinks:     'url-only',
    fileSizeLimit:  15 * 1024 * 1024,
  },
  pro: {
    tools:          'all',
    history:        true,           // Unlimited
    workspaces:     true,           // Unlimited
    batchProcessing:true,
    apiAccess:      true,           // 1,000 req/day
    cliAccess:      true,
    shareLinks:     'persistent',   // Named persistent links
    fileSizeLimit:  100 * 1024 * 1024, // 100MB
  },
}
```

### Free Account Nudge (Anonymous → Free)

After an anonymous user uses any tool **twice** in a session, show a soft banner (not a modal — don't block):

```tsx
// components/billing/FreeAccountNudge.tsx

// Renders a dismissable banner at the bottom of the tool:
// "💾 Create a free account to save your history and get more daily uses."
// [Create free account]  [Maybe later]

// Trigger: sessionStorage counter per tool use
// Show: after 2nd use, once per session, dismissable
// Do NOT show if user is already signed in
```

---

## 4. Usage Tracking & Friction Engine

Most Toolhaus tools are unlimited even for anonymous users — the friction lives in the **workflow layer** (history, workspaces, batch, API), not the tools themselves. Only a small set of compute-heavy tools have daily usage limits.

### Tools With Daily Limits

```typescript
// lib/usage/limits.ts

export const TOOLHAUS_LIMITS: Record<string, {
  anonymous: number | null
  free:      number | null
  pro:       number | null
}> = {
  // Compute-heavy tools only — these have limits
  'llm-token-counter':    { anonymous: 5,    free: null, pro: null },
  'hash-generator':       { anonymous: 5,    free: null, pro: null },
  'uuid-generator':       { anonymous: 5,    free: null, pro: null },
  'cron-expression':      { anonymous: 5,    free: null, pro: null },

  // All other tools: unlimited for all tiers
  // JSON formatter, base64, JWT decoder, timestamp, etc.
  // These are stateless, CPU-light — no reason to limit them
}
// If a tool slug is not in this map, it is unlimited for all tiers.
```

### Usage Check API

```typescript
// app/api/usage/check/route.ts

export async function POST(req: Request) {
  const { toolSlug, sessionId } = await req.json()
  const { userId } = auth()

  const limits = TOOLHAUS_LIMITS[toolSlug]
  if (!limits) {
    // Not a limited tool — always allowed
    return Response.json({ allowed: true, remaining: null })
  }

  // Pro: always unlimited
  if (userId) {
    const tier = await getUserTier()
    if (tier === 'pro') return Response.json({ allowed: true, remaining: null })
  }

  const tier      = userId ? 'free' : 'anonymous'
  const limit     = limits[tier]
  if (limit === null) return Response.json({ allowed: true, remaining: null })

  const todayStart = Math.floor(new Date().setHours(0,0,0,0) / 1000)
  const identifier  = userId ?? sessionId

  const result = await db.execute({
    sql: `
      SELECT COUNT(*) as count FROM usage_events
      WHERE tool_slug = ?
      AND (clerk_id = ? OR session_id = ?)
      AND created_at >= ?
    `,
    args: [toolSlug, identifier, identifier, todayStart],
  })

  const used      = Number(result.rows[0].count)
  const remaining = Math.max(0, limit - used)
  const allowed   = used < limit

  return Response.json({ allowed, used, limit, remaining, tier })
}
```

### Usage Record API

```typescript
// app/api/usage/record/route.ts

export async function POST(req: Request) {
  const { toolSlug, sessionId } = await req.json()
  const { userId } = auth()

  const limits = TOOLHAUS_LIMITS[toolSlug]
  if (!limits) return Response.json({ ok: true }) // Don't track unlimited tools

  await db.execute({
    sql:  `INSERT INTO usage_events (clerk_id, session_id, tool_slug) VALUES (?, ?, ?)`,
    args: [userId ?? null, sessionId, toolSlug],
  })

  return Response.json({ ok: true })
}
```

### Client-Side Usage Hook

```typescript
// hooks/useToolUsage.ts

export function useToolUsage(toolSlug: string) {
  const sessionId = useSessionId()  // Stored in sessionStorage, generated on first use

  const checkAndRecord = async (): Promise<{
    allowed: boolean
    remaining: number | null
  }> => {
    const check = await fetch('/api/usage/check', {
      method: 'POST',
      body: JSON.stringify({ toolSlug, sessionId }),
    }).then(r => r.json())

    if (check.allowed) {
      // Record usage fire-and-forget
      fetch('/api/usage/record', {
        method: 'POST',
        body: JSON.stringify({ toolSlug, sessionId }),
      })
    }

    return check
  }

  return { checkAndRecord }
}

// Usage in a tool component:
// const { checkAndRecord } = useToolUsage('llm-token-counter')
// const { allowed, remaining } = await checkAndRecord()
// if (!allowed) { showUpgradePrompt(); return }
```

---

## 5. Database Schema Changes

Apply these migrations to the existing Toolhaus Turso database. The `users` table already exists — add the new tables.

```sql
-- Usage tracking (new table)
CREATE TABLE IF NOT EXISTS usage_events (
  id         TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  clerk_id   TEXT    REFERENCES users(clerk_id),
  session_id TEXT    NOT NULL,
  tool_slug  TEXT    NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_usage_lookup
  ON usage_events(tool_slug, clerk_id, session_id, created_at);

-- Saved workspaces (new table)
CREATE TABLE IF NOT EXISTS workspaces (
  id         TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  clerk_id   TEXT    NOT NULL REFERENCES users(clerk_id),
  tool_slug  TEXT    NOT NULL,
  name       TEXT    NOT NULL,
  state_json TEXT    NOT NULL,  -- Full tool input state as JSON
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_workspaces_user
  ON workspaces(clerk_id, tool_slug);

-- Persistent share links (new table — Pro only)
CREATE TABLE IF NOT EXISTS share_links (
  id         TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  clerk_id   TEXT    NOT NULL REFERENCES users(clerk_id),
  tool_slug  TEXT    NOT NULL,
  name       TEXT    NOT NULL,
  slug       TEXT    NOT NULL UNIQUE,  -- Short URL segment e.g. "my-api-schema"
  state_json TEXT    NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_share_links_slug
  ON share_links(slug);

-- API keys (new table — Pro only)
CREATE TABLE IF NOT EXISTS api_keys (
  id         TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  clerk_id   TEXT    NOT NULL REFERENCES users(clerk_id),
  name       TEXT    NOT NULL DEFAULT 'Default',
  key_hash   TEXT    NOT NULL UNIQUE,  -- bcrypt hash of the key
  key_prefix TEXT    NOT NULL,         -- First 8 chars for display e.g. "th_live_"
  last_used  INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- API usage tracking (new table)
CREATE TABLE IF NOT EXISTS api_usage (
  id         TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  clerk_id   TEXT    NOT NULL REFERENCES users(clerk_id),
  tool_slug  TEXT    NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_api_usage_daily
  ON api_usage(clerk_id, created_at);

-- Extend tool_history (if not already structured this way)
-- Add input_summary column if missing:
ALTER TABLE tool_history ADD COLUMN input_summary TEXT;
```

---

## 6. Saved Workspaces

### What It Is
Named, bookmarkable snapshots of a tool's complete input state. A developer working on multiple projects saves different configurations per tool and recalls them instantly.

```
My Workspaces — JSON Formatter:
├── Production API Response
├── Staging Webhook Payload
└── Test Fixture Data
```

### How It Works

Each tool's input state is serialised to JSON and stored in the `workspaces` table. When loading a workspace, the state JSON is deserialised and hydrated back into the tool's form fields.

### Tool State Interface

Every tool that supports workspaces must implement:

```typescript
// In each tool's component:
interface ToolState {
  // Tool-specific input fields — defined per tool
  // Example for JSON Formatter:
  input:       string
  indentSize:  number
  sortKeys:    boolean
}

// Every tool component receives and exposes:
interface ToolProps {
  initialState?: ToolState              // Loaded from workspace or share link
  onStateChange?: (state: ToolState) => void  // For workspace saving
}
```

### WorkspaceSaver Component

Rendered inside `ToolShell`, below the tool UI, above the SEO content section:

```tsx
// components/workspaces/WorkspaceSaver.tsx

interface WorkspaceSaverProps {
  toolSlug:     string
  currentState: Record<string, unknown>
  tier:         UserTier
}

// Renders:
// Free users:   "Save Workspace" button → on click, prompts sign-in if anonymous,
//               shows save dialog if free account (limited to 1 per tool — show warning if at limit)
// Pro users:    "Save Workspace" button → save dialog, no limits
// All users:    Saved workspace dropdown → select to load → "Load" button

// The workspace dropdown only appears once the user has at least 1 saved workspace for this tool.
```

### Workspace API Routes

```typescript
// app/api/workspaces/route.ts

// GET  /api/workspaces?toolSlug=json-formatter  → list workspaces for tool
// POST /api/workspaces                          → create workspace
// PUT  /api/workspaces/[id]                     → update workspace state
// DELETE /api/workspaces/[id]                   → delete workspace

// Workspace limit enforcement:
// Free accounts: max 1 workspace per tool
// Pro: unlimited

// POST handler:
export async function POST(req: Request) {
  const { userId } = auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const tier = await getUserTier()
  const { toolSlug, name, stateJson } = await req.json()

  if (tier === 'free') {
    // Check existing count for this tool
    const existing = await db.execute({
      sql:  'SELECT COUNT(*) as count FROM workspaces WHERE clerk_id = ? AND tool_slug = ?',
      args: [userId, toolSlug],
    })
    if (Number(existing.rows[0].count) >= 1) {
      return Response.json(
        { error: 'Free accounts are limited to 1 workspace per tool. Upgrade to Pro for unlimited workspaces.' },
        { status: 403 }
      )
    }
  }

  await db.execute({
    sql:  'INSERT INTO workspaces (clerk_id, tool_slug, name, state_json) VALUES (?, ?, ?, ?)',
    args: [userId, toolSlug, name, stateJson],
  })

  return Response.json({ ok: true })
}
```

### Dashboard — Workspaces Page

New page: `/dashboard/workspaces`

- Lists all saved workspaces grouped by tool
- Click any workspace → navigates to the tool with state pre-loaded
- Delete button per workspace
- For free users: shows "1 / 1 workspaces used per tool" with upgrade prompt

---

## 7. Batch Processing

### Concept
Batch mode is a **second tab** on supported tool pages. It allows Pro users to process many inputs at once and download the results.

```
[Single]  [Batch — Pro ⭐]
```

Clicking "Batch" when not on Pro shows an `UpgradePrompt` modal.

### Tools That Support Batch

| Tool | Batch Input | Batch Output |
|---|---|---|
| UUID Generator | N (number input) | N UUIDs as TXT or CSV |
| Hash Generator | Newline-separated strings | CSV: input, md5, sha1, sha256 |
| Case Converter | Newline-separated strings | CSV: input, camelCase, snake_case, etc. |
| LLM Token Counter | Multiple file upload | CSV: filename, tokens, estimated cost per model |
| Base64 Encoder | Newline-separated strings | CSV: input, encoded |
| Base64 Decoder | Newline-separated strings | CSV: input, decoded |
| JWT Decoder | Newline-separated JWTs | JSON: array of decoded payloads |
| Timestamp Converter | Newline-separated timestamps | CSV: input, ISO, unix, relative |

### Batch UI Pattern

```tsx
// components/tools/BatchProcessor.tsx

interface BatchProcessorProps {
  toolSlug:  string
  processor: (inputs: string[]) => Promise<BatchResult[]>
  inputPlaceholder: string     // e.g. "Paste one string per line..."
  outputColumns: string[]      // Column headers for CSV export
}

// Renders:
// 1. Textarea: "Paste inputs, one per line" OR file upload (.txt, .csv)
// 2. Input count indicator: "247 items ready to process"
// 3. [Process all] button
// 4. Progress bar during processing (with item count: "Processing 156 of 247...")
// 5. Results table (first 20 rows preview)
// 6. [Download CSV] [Download JSON] buttons

// Processing runs in a Web Worker to avoid blocking the UI thread
// Max batch size: 10,000 items (enforced client-side)
```

### Batch Web Worker Pattern

```typescript
// workers/batch-processor.worker.ts

// Each tool that supports batch exports a pure function:
// batchProcess(inputs: string[], options: ToolOptions): Promise<BatchResult[]>
//
// The worker imports this function and processes the batch
// Emits progress events via postMessage every 100 items

self.onmessage = async (e) => {
  const { toolSlug, inputs, options } = e.data
  const results: BatchResult[] = []

  for (let i = 0; i < inputs.length; i++) {
    const result = await processOne(toolSlug, inputs[i], options)
    results.push(result)

    if (i % 100 === 0) {
      self.postMessage({ type: 'progress', current: i + 1, total: inputs.length })
    }
  }

  self.postMessage({ type: 'complete', results })
}
```

---

## 8. Pro API Access

### Overview
Pro users can access all Toolhaus tools via a REST API. This enables scripting, automation, and integration into their own pipelines — distinct from the CLI (which wraps this API).

**Base URL:** `https://toolhaus.dev/api/v1`  
**Auth:** Bearer token  
**Rate limit:** 1,000 requests/day per user (resets midnight UTC)

### API Key Management

Pro users generate API keys from their dashboard. Keys are shown once (like GitHub PATs) and stored as hashed values in the database.

```typescript
// API key format: th_live_[32 random hex chars]
// Example:        th_live_a3f9b2c14e87d651f0293847ab561c82

// Key generation:
import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'

function generateApiKey(): { key: string; hash: string; prefix: string } {
  const raw    = `th_live_${randomBytes(16).toString('hex')}`
  const hash   = bcrypt.hashSync(raw, 10)
  const prefix = raw.substring(0, 12)   // "th_live_a3f9" — shown in dashboard for identification
  return { key: raw, hash, prefix }
}
```

### API Key Verification Middleware

```typescript
// lib/api/auth.ts

export async function verifyApiKey(req: Request): Promise<{
  valid: boolean
  userId?: string
  error?: string
}> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing or invalid Authorization header' }
  }

  const key = authHeader.slice(7)

  // Find matching key by prefix (avoid full-table scan)
  const prefix = key.substring(0, 12)
  const keys = await db.execute({
    sql:  'SELECT id, clerk_id, key_hash FROM api_keys WHERE key_prefix = ?',
    args: [prefix],
  })

  for (const row of keys.rows) {
    if (bcrypt.compareSync(key, String(row.key_hash))) {
      // Verify user is still Pro
      const user = await db.execute({
        sql:  'SELECT plan FROM users WHERE clerk_id = ?',
        args: [row.clerk_id],
      })
      if (user.rows[0]?.plan !== 'pro') {
        return { valid: false, error: 'Pro subscription required for API access' }
      }

      // Update last_used
      await db.execute({
        sql:  'UPDATE api_keys SET last_used = unixepoch() WHERE id = ?',
        args: [row.id],
      })

      return { valid: true, userId: String(row.clerk_id) }
    }
  }

  return { valid: false, error: 'Invalid API key' }
}
```

### API Rate Limiting

```typescript
// lib/api/rate-limit.ts

export async function checkApiRateLimit(userId: string): Promise<{
  allowed:   boolean
  used:      number
  remaining: number
  limit:     number
}> {
  const DAILY_LIMIT = 1000
  const todayStart  = Math.floor(new Date().setHours(0,0,0,0) / 1000)

  const result = await db.execute({
    sql:  'SELECT COUNT(*) as count FROM api_usage WHERE clerk_id = ? AND created_at >= ?',
    args: [userId, todayStart],
  })

  const used      = Number(result.rows[0].count)
  const remaining = Math.max(0, DAILY_LIMIT - used)
  return { allowed: used < DAILY_LIMIT, used, remaining, limit: DAILY_LIMIT }
}
```

### API Route Structure

```typescript
// app/api/v1/[tool]/route.ts

export async function POST(req: Request, { params }: { params: { tool: string } }) {
  // 1. Verify API key
  const auth = await verifyApiKey(req)
  if (!auth.valid) {
    return Response.json({ error: auth.error }, { status: 401 })
  }

  // 2. Check rate limit
  const rateLimit = await checkApiRateLimit(auth.userId!)
  if (!rateLimit.allowed) {
    return Response.json(
      { error: 'Daily rate limit exceeded (1,000 requests/day). Resets at midnight UTC.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit':     '1000',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset':     String(Math.floor(new Date().setHours(24,0,0,0) / 1000)),
        }
      }
    )
  }

  // 3. Find and execute tool
  const tool = toolRegistry.find(t => t.slug === params.tool)
  if (!tool) return Response.json({ error: 'Tool not found' }, { status: 404 })

  const body = await req.json()
  const result = await tool.apiHandler(body)   // Each tool exports an apiHandler

  // 4. Record usage
  await db.execute({
    sql:  'INSERT INTO api_usage (clerk_id, tool_slug) VALUES (?, ?)',
    args: [auth.userId, params.tool],
  })

  // 5. Return result with rate limit headers
  return Response.json(result, {
    headers: {
      'X-RateLimit-Limit':     '1000',
      'X-RateLimit-Remaining': String(rateLimit.remaining - 1),
    }
  })
}
```

### API Tool Handler Pattern

Each tool that supports API access exports an `apiHandler`:

```typescript
// Example: lib/tools/base64/index.ts

export async function apiHandler(body: {
  input:     string
  operation: 'encode' | 'decode'
}): Promise<{ result: string }> {
  if (body.operation === 'encode') {
    return { result: Buffer.from(body.input).toString('base64') }
  } else {
    return { result: Buffer.from(body.input, 'base64').toString('utf-8') }
  }
}
```

### API Documentation Page

New page: `/api-docs`

- Lists all available tools with their endpoint, request body schema, and example response
- Shows user's current usage (X of 1,000 requests used today) if signed in as Pro
- Links to API key management in dashboard
- Code examples in: cURL, JavaScript/TypeScript, Python

---

## 9. CLI Package

### Overview

The Toolhaus CLI is a standalone npm package that wraps the Pro API. It enables developers to use any Toolhaus tool directly from their terminal.

```bash
npm install -g @toolhaus/cli

# Then:
cat data.json | toolhaus json-formatter
echo "hello world" | toolhaus base64 --encode
cat prompt.md | toolhaus token-counter --model gpt-4o
echo "hello" | toolhaus hash --algo sha256
toolhaus uuid --count 100 > uuids.txt
```

### Monorepo Location

```
apps/toolhaus-cli/           ← New package in monorepo
├── src/
│   ├── index.ts             ← CLI entry point
│   ├── config.ts            ← Config file management
│   ├── commands/
│   │   ├── base64.ts
│   │   ├── json-formatter.ts
│   │   ├── token-counter.ts
│   │   ├── hash.ts
│   │   ├── uuid.ts
│   │   ├── jwt-decoder.ts
│   │   ├── timestamp.ts
│   │   └── case-converter.ts
│   └── api.ts               ← API client (shared request logic)
├── package.json
└── tsconfig.json
```

### Config File

On first use, `toolhaus auth` prompts for an API key and stores it:

```
~/.toolhaus/config.json
{
  "apiKey": "th_live_a3f9b2c14e87d651f0293847ab561c82",
  "apiUrl": "https://toolhaus.dev/api/v1"
}
```

### CLI Entry Point

```typescript
// apps/toolhaus-cli/src/index.ts
#!/usr/bin/env node

import { Command } from 'commander'
import { readConfig } from './config'

const program = new Command()

program
  .name('toolhaus')
  .description('Toolhaus CLI — use any Toolhaus tool from your terminal')
  .version('1.0.0')

// Auth command
program
  .command('auth')
  .description('Set your Toolhaus API key')
  .action(async () => {
    const { input } = await import('@inquirer/prompts')
    const key = await input({ message: 'Enter your Toolhaus API key:' })
    await saveConfig({ apiKey: key })
    console.log('✓ API key saved to ~/.toolhaus/config.json')
  })

// Tool commands — each registered from commands/*.ts
registerToolCommands(program)

// Read from stdin if data is piped
process.stdin.setEncoding('utf-8')
if (!process.stdin.isTTY) {
  let stdinData = ''
  process.stdin.on('data', (chunk) => stdinData += chunk)
  process.stdin.on('end', () => {
    program.parse(process.argv)
  })
} else {
  program.parse(process.argv)
}
```

### Tool Command Pattern

```typescript
// apps/toolhaus-cli/src/commands/base64.ts

import { Command } from 'commander'
import { callApi } from '../api'

export function registerBase64Command(program: Command) {
  program
    .command('base64')
    .description('Base64 encode or decode text')
    .option('--encode', 'Encode input to base64 (default)')
    .option('--decode', 'Decode base64 input')
    .option('--input <string>', 'Input string (or pipe via stdin)')
    .action(async (options) => {
      const input = options.input ?? global.__stdinData

      if (!input) {
        console.error('Error: provide input via --input or pipe via stdin')
        process.exit(1)
      }

      const result = await callApi('base64', {
        input,
        operation: options.decode ? 'decode' : 'encode',
      })

      process.stdout.write(result.result)
    })
}
```

### API Client

```typescript
// apps/toolhaus-cli/src/api.ts

import { readConfig } from './config'

export async function callApi(tool: string, body: Record<string, unknown>) {
  const config = await readConfig()

  if (!config?.apiKey) {
    console.error('Error: not authenticated. Run `toolhaus auth` to set your API key.')
    process.exit(1)
  }

  const response = await fetch(`${config.apiUrl}/${tool}`, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type':  'application/json',
      'User-Agent':    'toolhaus-cli/1.0.0',
    },
    body: JSON.stringify(body),
  })

  if (response.status === 401) {
    console.error('Error: invalid API key. Run `toolhaus auth` to update it.')
    process.exit(1)
  }

  if (response.status === 429) {
    console.error('Error: daily API limit reached (1,000 requests/day). Resets at midnight UTC.')
    process.exit(1)
  }

  if (!response.ok) {
    const error = await response.json()
    console.error(`Error: ${error.message ?? 'Unknown error'}`)
    process.exit(1)
  }

  return response.json()
}
```

### Package.json for CLI

```json
{
  "name": "@toolhaus/cli",
  "version": "1.0.0",
  "description": "Use any Toolhaus tool from your terminal",
  "bin": {
    "toolhaus": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev":   "ts-node src/index.ts"
  },
  "dependencies": {
    "commander":       "^12.0.0",
    "@inquirer/prompts":"^4.0.0"
  },
  "devDependencies": {
    "typescript":      "^5.0.0",
    "@types/node":     "^20.0.0"
  },
  "engines": { "node": ">=18.0.0" }
}
```

### Publishing

Publish to npm as a public package: `npm publish --access public`  
Users install with: `npm install -g @toolhaus/cli`

The package name `@toolhaus/cli` requires the `toolhaus` npm organisation to be registered. Do this before publishing.

---

## 10. Persistent Share Links

### How It Works

**Free and anonymous users:** Existing behaviour unchanged. Tool state is serialised into URL params. The URL is shareable but has no persistent identity and updates when state changes.

**Pro users:** Can create a named persistent share link with a custom slug:
```
toolhaus.dev/s/my-api-schema
toolhaus.dev/s/staging-jwt-payload
toolhaus.dev/s/production-cron
```

The link loads the tool with the saved state. The Pro user can update the link's state at any time — the URL stays the same. The recipient sees the tool in read-only mode if they don't have an account.

### Share Link Page

```typescript
// app/s/[slug]/page.tsx

export default async function ShareLinkPage({ params }: { params: { slug: string } }) {
  const link = await db.execute({
    sql:  'SELECT * FROM share_links WHERE slug = ?',
    args: [params.slug],
  })

  if (!link.rows[0]) notFound()

  const { tool_slug, name, state_json } = link.rows[0]
  const state = JSON.parse(String(state_json))
  const tool  = toolRegistry.find(t => t.slug === tool_slug)

  return (
    <ToolShell tool={tool} initialState={state} readOnly>
      <SharedLinkBanner name={name} ownerSlug={tool_slug} />
    </ToolShell>
  )
}
```

### Share Link Manager Component

Rendered in the tool shell for Pro users, alongside the workspace saver:

```tsx
// components/share/ShareLinkManager.tsx

// Shows:
// 1. "Share" button → opens panel
// 2. Panel: "Persistent link (Pro)" section
//    - Text field: toolhaus.dev/s/[custom-slug]
//    - [Save current state to this link] button
//    - [Copy link] button
// 3. Existing share links for this tool listed below
```

### API Routes

```
POST   /api/share-links           → Create new share link (Pro)
PUT    /api/share-links/[id]      → Update link state (Pro)
DELETE /api/share-links/[id]      → Delete link (Pro)
GET    /api/share-links?toolSlug= → List user's links for a tool (Pro)
```

---

## 11. Pricing Page Rewrite

### New Feature Presentation Order

Lead with capability, end with comfort:

```
1. 🖥️  CLI access             "Use every tool from your terminal"
2. 📦  Batch processing        "Process 10,000 items at once"
3. 💾  Unlimited workspaces    "Save and recall any tool configuration instantly"
4. 🔗  Persistent share links  "Share a link that never breaks"
5. ⚡  API access              "1,000 requests/day for scripts and automations"
6. 📜  Unlimited history       "Every result, always available"
7. 📁  Large files             "Upload up to 100MB (vs 15MB free)"
8. 🚫  No ads                  (last — a bonus, not the reason)
```

### Headline Copy

Replace current pricing page headline with one of:

- **"Toolhaus Pro — your tools, in your terminal."** ← Recommended
- *"Stop copy-pasting. Start piping."*
- *"The dev tools hub that fits into your workflow."*

### Three-Column Tier Layout

```
[Anonymous]           [Free Account]           [Pro ⭐]
No account            Free forever             $7/month · $49/year

All tools             All tools                Everything in Free, plus:
5 uses/day on         Unlimited uses           ∞ Unlimited uses
compute tools         History (last 10)        ∞ Unlimited history
—                     1 workspace/tool         ∞ Unlimited workspaces
URL sharing           URL sharing              Persistent share links
—                     —                        CLI access
—                     —                        API access (1K/day)
—                     —                        Batch processing
15MB uploads          15MB uploads             100MB uploads
                                               No ads

[Get started]         [Create free account]    [Go Pro]
```

Show annual pricing as the default on the Pro card with a "Save 42%" badge. Monthly option available via a small toggle below.

### Copy for the Upgrade Prompt (Inline, not modal)

Every time a Pro feature is shown to a non-Pro user, use consistent copy:

```
// CLI access:
"Run Toolhaus from your terminal. Pipe any tool into your workflow."
→ [Upgrade to Pro]

// Batch processing:
"Process thousands of items at once. Download results as CSV."
→ [Upgrade to Pro]

// Workspaces (at limit):
"Free accounts can save 1 workspace per tool. Pro is unlimited."
→ [Upgrade to Pro]

// API access:
"Automate Toolhaus with the API. 1,000 requests/day included."
→ [Upgrade to Pro]
```

---

## 12. Upgrade Prompt System

Since ads are removed, upgrade prompts are the primary monetisation driver within the product. They must be contextual, timely, and non-intrusive.

### Prompt Types

**Type 1: Feature Gate (Modal)**  
Triggers when a non-Pro user clicks a Pro-only feature (batch tab, "Generate API Key", "Create share link").

```tsx
// components/billing/UpgradePrompt.tsx

interface UpgradePromptProps {
  feature:   'batch' | 'cli' | 'api' | 'workspaces' | 'share-links' | 'history'
  onClose:   () => void
  onUpgrade: () => void
}

// One sentence: what this feature does
// One CTA: [Upgrade to Pro — $7/month]
// Subtext: "or $49/year — save 42%"
// Small link: [View all Pro features →]
// Keep it minimal — developers hate bloated upsell modals
```

**Type 2: Limit Warning (Inline Banner)**  
Shows inside the tool when a usage limit is approaching or reached (compute-heavy tools only):

```tsx
// Approaching limit (1 remaining):
// 🔶 "1 free use remaining today for this tool. [Upgrade to Pro for unlimited →]"

// Limit reached:
// 🔴 "You've reached today's free limit. Come back tomorrow, or upgrade to Pro."
//     [Upgrade to Pro]  [Come back tomorrow]
```

**Type 3: Soft Nudge (Dismissable Banner)**  
Shows to anonymous users after 2 tool uses in a session — not a modal, just a bottom banner:

```tsx
// "💾 Create a free account to save your results and get more daily uses."
// [Create free account]  [Dismiss]
```

**Type 4: Dashboard Upsell (Passive)**  
For free account users in the dashboard — a persistent but non-blocking Pro feature teaser:

```tsx
// Shown in /dashboard sidebar:
// "You're on the Free plan"
// "Upgrade to Pro to unlock CLI, batch processing, and unlimited workspaces."
// [Upgrade to Pro →]
```

### What Never Triggers an Upgrade Prompt
- Opening any tool page (tools are always accessible)
- Running a tool as a free or anonymous user (unless they are a compute-heavy tool at limit)
- Visiting the homepage or tool directory
- Viewing the pricing page

---

## 13. Dashboard Updates

### New Dashboard Pages

**`/dashboard`** (update existing)  
- Add usage summary widget: "Tools used today: 3 of 5 (compute tools)"
- Add Pro feature teaser section for free users
- Add "Your workspaces" quick access section

**`/dashboard/workspaces`** (new)
- All saved workspaces, grouped by tool category
- Click any workspace → navigates to tool with state loaded
- Rename and delete actions per workspace
- For free users: shows limit ("1 / 1 per tool") + upgrade prompt

**`/dashboard/api-keys`** (new — Pro only)
- List of API keys (name, prefix, last used, created date)
- [Generate new key] button → shows key once in a modal with copy button
- [Revoke] button per key
- Daily usage meter: "387 / 1,000 requests used today"
- Link to `/api-docs`

**`/dashboard/share-links`** (new — Pro only)
- All persistent share links across all tools
- Grouped by tool
- Click to copy link, click to open tool, delete button

---

## 14. Email Flows

Add the following emails to the existing Resend setup:

| Trigger | Subject | Content |
|---|---|---|
| Free account signup | "Welcome to Toolhaus" | Brief welcome, link to dashboard, mention CLI as the headline Pro feature |
| Upgrade to Pro | "You're on Pro — here's how to get the most out of it" | CLI install command prominently, link to API docs, batch processing explainer |
| Pro cancellation | "Your Pro subscription has ended" | What they lose, one-click resubscribe, offer annual plan if they were on monthly |
| API rate limit hit | "You've hit your daily API limit" | Usage summary, resets at midnight UTC, upgrade context if on lower plan |
| Payment failed | "Action needed: your Toolhaus Pro payment failed" | Retry link, billing portal, what happens if unresolved |

```typescript
// packages/email/toolhaus-templates.ts

export async function sendToolhausProWelcome(email: string, firstName: string) {
  await resend.emails.send({
    from:    'Toolhaus <hello@toolhaus.dev>',
    to:      email,
    subject: "You're on Pro — here's how to get the most out of it",
    html: proWelcomeTemplate({
      firstName,
      cliInstallCommand: 'npm install -g @toolhaus/cli',
      dashboardUrl:      'https://toolhaus.dev/dashboard/api-keys',
      apiDocsUrl:        'https://toolhaus.dev/api-docs',
    }),
  })
}
```

---

## 15. Environment Variables

Add these to `apps/toolhaus/.env.local` and Vercel:

```bash
# No new external services — all new features use existing infrastructure

# Remove:
ETHICAL_ADS_PUBLISHER_ID       ← delete this

# Add (no new env vars needed — CLI and API use existing Turso + Clerk + Stripe)
# The CLI package reads TOOLHAUS_API_KEY from user's local environment
# This is set by the user after running `toolhaus auth` — not an app env var
```

---

## 16. Implementation Order

Suggested sequence — each step is independently deployable:

```
Step 1: Remove EthicalAds                        (~2 hours)
        Deploy immediately — no new features needed

Step 2: Three-tier auth model + usage tracking   (~1 day)
        DB migrations, usage check/record APIs, tier detection hook
        Deploy: usage limits active, free account nudge active

Step 3: Pricing page rewrite                     (~4 hours)
        New copy, new feature order, three-column layout
        Deploy: better conversion messaging live

Step 4: Upgrade prompt system                    (~1 day)
        UpgradePrompt modal, limit warning banner, soft nudge banner
        Deploy: in-product upgrade flow working end-to-end

Step 5: Saved workspaces                         (~2 days)
        DB table, API routes, WorkspaceSaver component, dashboard page
        Deploy: Pro feature live

Step 6: Batch processing                         (~3 days)
        Batch UI component, Web Worker, per-tool batch handlers
        Deploy: Pro feature live

Step 7: Pro API access                           (~2 days)
        API key generation, verifyApiKey middleware, rate limiting,
        /api/v1/[tool] routes, /api-docs page, dashboard API keys page
        Deploy: Pro API live

Step 8: Persistent share links                   (~1 day)
        DB table, API routes, ShareLinkManager component,
        /s/[slug] page, dashboard share links page
        Deploy: Pro feature live

Step 9: CLI package                              (~3 days)
        apps/toolhaus-cli/ package, all tool commands,
        npm publish @toolhaus/cli
        Deploy: announce on X/Twitter, Hacker News Show HN

Step 10: Email flows                             (~1 day)
         New email templates in Resend
         Deploy: complete lifecycle email coverage
```

**Total estimated build time:** ~15–18 developer days

---

*Toolhaus Monetisation Update Handoff v2.0*  
*Delta from original spec — implement in the order above for safest deployment*
