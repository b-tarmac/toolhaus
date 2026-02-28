# Toolhaus.dev — Developer Handoff: Part 2 of 2
## All 25 Tool Specs, Monetisation, Auth, Extension & Deployment

**Version:** 1.0 | **Date:** 2026-02-28 | **Domain:** toolhaus.dev  
> Part 1 covers: Architecture, Stack, Registry, SEO Infrastructure, Tool Shell.

---

## Table of Contents (Part 2)

8. [All 25 Tools — Full Specs](#8-all-25-tools--full-specs)
9. [Monetisation — Ads](#9-monetisation--ads)
10. [Monetisation — Pro Subscription](#10-monetisation--pro-subscription)
11. [Authentication & Payments](#11-authentication--payments)
12. [Browser Extension — Phase 2](#12-browser-extension--phase-2)
13. [Deployment & Infrastructure](#13-deployment--infrastructure)
14. [Build Sequence](#14-build-sequence)
15. [Environment Variables](#15-environment-variables)

---

## 8. All 25 Tools — Full Specs

---

### Tool 1: JSON Formatter / Validator / Minifier
**Slug:** `json-formatter` | **Category:** `data-formats` | **Libraries:** Native JSON API

**URL State:** `{ input: string, indent: '2'|'4'|'tab', mode: 'format'|'minify'|'validate' }`

```typescript
// lib/tools/json/index.ts
export function processJson(input: string, options: { mode: 'format'|'minify'|'validate'; indent: '2'|'4'|'tab' }): ToolResult {
  if (!input.trim()) return { output: '', isValid: true }
  try {
    const parsed = JSON.parse(input)
    if (options.mode === 'minify') return { output: JSON.stringify(parsed), isValid: true }
    if (options.mode === 'validate') return { output: '✓ Valid JSON', isValid: true, metadata: { type: typeof parsed } }
    const indentChar = options.indent === 'tab' ? '\t' : Number(options.indent)
    return { output: JSON.stringify(parsed, null, indentChar), isValid: true }
  } catch (e: any) {
    return { output: '', isValid: false, error: { message: e.message, line: extractLineFromError(e.message) } }
  }
}
function extractLineFromError(msg: string): number | undefined {
  const m = msg.match(/line (\d+)/); return m ? Number(m[1]) : undefined
}
```

**UI Notes:** CodeMirror 6 (JSON mode) for input/output. Real-time processing (debounce 150ms). Error highlights offending line in editor. 4th mode: "Tree View" — recursive React component, no library. Bonus SEO keyword: `json tree viewer`.

---

### Tool 2: Base64 Encoder / Decoder
**Slug:** `base64-tool` | **Category:** `encoding` | **Libraries:** Native `btoa`/`atob`

**URL State:** `{ input: string, mode: 'encode'|'decode', variant: 'standard'|'url-safe', inputType: 'text'|'file' }`

```typescript
// lib/tools/base64/index.ts
export function encodeBase64(input: string, urlSafe = false): ToolResult {
  try {
    const encoded = btoa(unescape(encodeURIComponent(input)))
    const output = urlSafe ? encoded.replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'') : encoded
    return { output, isValid: true }
  } catch (e: any) { return { output: '', isValid: false, error: { message: e.message } } }
}
export function decodeBase64(input: string, urlSafe = false): ToolResult {
  try {
    const normalised = urlSafe
      ? input.replace(/-/g,'+').replace(/_/g,'/').padEnd(input.length + (4 - input.length % 4) % 4, '=')
      : input
    return { output: decodeURIComponent(escape(atob(normalised))), isValid: true }
  } catch { return { output: '', isValid: false, error: { message: 'Invalid Base64 string' } } }
}
export async function fileToBase64(file: File): Promise<ToolResult> {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = () => resolve({ output: reader.result as string, isValid: true })
    reader.onerror = () => resolve({ output: '', isValid: false, error: { message: 'Failed to read file' } })
    reader.readAsDataURL(file)
  })
}
```

**UI Notes:** Text/File mode toggle. File mode: drag-and-drop zone. URL-safe variant toggle with tooltip. Character count on both sides. Free: 5MB max file. Pro: 50MB.

---

### Tool 3: UUID / ULID / NanoID Generator
**Slug:** `uuid-generator` | **Category:** `generators` | **Libraries:** `ulid` (~1KB), `nanoid` (~1KB)

**URL State:** `{ type: 'uuid-v4'|'ulid'|'nanoid', count: string, uppercase: 'true'|'false', nanoidSize: string, nanoidAlphabet: string }`

```typescript
// lib/tools/uuid/index.ts
import { ulid } from 'ulid'
import { nanoid, customAlphabet } from 'nanoid'

export type IdType = 'uuid-v4' | 'ulid' | 'nanoid'

export function generateIds(type: IdType, options: { count: number; uppercase?: boolean; nanoidSize?: number; nanoidAlphabet?: string }): string[] {
  const gen = {
    'uuid-v4': () => { const id = crypto.randomUUID(); return options.uppercase ? id.toUpperCase() : id },
    'ulid':    () => ulid(),
    'nanoid':  () => {
      const fn = options.nanoidAlphabet ? customAlphabet(options.nanoidAlphabet, options.nanoidSize ?? 21) : (n: number) => nanoid(n)
      return fn(options.nanoidSize ?? 21)
    },
  }
  return Array.from({ length: Math.min(options.count, 10000) }, gen[type])
}
```

**UI Notes:** Single live ID refreshes on click. Bulk mode: textarea, one per line, copy-all button. Free: max 100. Pro: max 10,000. Format comparison table explains UUID vs ULID vs NanoID.

---

### Tool 4: Unix Timestamp Converter
**Slug:** `timestamp-converter` | **Category:** `date-time` | **Libraries:** Native `Date`, `Intl`

**URL State:** `{ input: string, unit: 'seconds'|'milliseconds', timezone: string, mode: 'to-human'|'to-timestamp' }`

```typescript
// lib/tools/timestamp/index.ts
export function timestampToHuman(timestamp: string, unit: 'seconds'|'milliseconds', timezone: string) {
  const ms = unit === 'seconds' ? Number(timestamp) * 1000 : Number(timestamp)
  const date = new Date(ms)
  if (isNaN(date.getTime())) return { isValid: false, error: { message: 'Invalid timestamp' } }
  const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-US', { ...opts, timeZone: timezone }).format(date)
  return {
    isValid: true, output: '',
    metadata: {
      iso8601:   date.toISOString(),
      utc:       date.toUTCString(),
      local:     fmt({ dateStyle: 'full', timeStyle: 'long' }),
      relative:  formatRelative(date),
      dayOfWeek: fmt({ weekday: 'long' }),
      unix:      Math.floor(ms / 1000),
      unixMs:    ms,
    },
  }
}
export function humanToTimestamp(input: string) {
  const date = new Date(input)
  if (isNaN(date.getTime())) return { isValid: false, error: { message: 'Could not parse date' } }
  return { isValid: true, output: '', metadata: { seconds: Math.floor(date.getTime()/1000), milliseconds: date.getTime(), iso8601: date.toISOString() } }
}
function formatRelative(date: Date): string {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const diff = date.getTime() - Date.now()
  const abs = Math.abs(diff)
  if (abs < 60_000)       return rtf.format(Math.round(diff/1000), 'second')
  if (abs < 3_600_000)    return rtf.format(Math.round(diff/60_000), 'minute')
  if (abs < 86_400_000)   return rtf.format(Math.round(diff/3_600_000), 'hour')
  if (abs < 2_592_000_000)return rtf.format(Math.round(diff/86_400_000), 'day')
  return rtf.format(Math.round(diff/2_592_000_000), 'month')
}
```

**UI Notes:** Live clock ticking at top showing current timestamp. "Use now" button. Results as card showing all representations simultaneously. Timezone selector via `Intl.supportedValuesOf('timeZone')`. Bonus: timestamp difference calculator.

---

### Tool 5: URL Encoder / Decoder / Parser
**Slug:** `url-tool` | **Category:** `web` | **Libraries:** Native `URL` API

**URL State:** `{ input: string, mode: 'encode'|'decode'|'parse', full: 'true'|'false' }`

```typescript
// lib/tools/url/index.ts
export function encodeUrl(input: string, full: boolean): ToolResult {
  try { return { output: full ? encodeURIComponent(input) : encodeURI(input), isValid: true } }
  catch (e: any) { return { output: '', isValid: false, error: { message: e.message } } }
}
export function decodeUrl(input: string): ToolResult {
  try { return { output: decodeURIComponent(input), isValid: true } }
  catch { try { return { output: decodeURI(input), isValid: true } }
  catch (e: any) { return { output: '', isValid: false, error: { message: 'Invalid encoded string' } } } }
}
export function parseUrl(input: string) {
  try {
    const url = new URL(input)
    return { isValid: true, protocol: url.protocol, hostname: url.hostname, port: url.port, pathname: url.pathname, params: Object.fromEntries(url.searchParams.entries()), hash: url.hash }
  } catch { return { isValid: false, error: 'Invalid URL', protocol:'', hostname:'', port:'', pathname:'', params:{}, hash:'' } }
}
```

**UI Notes:** Parse mode renders each URL component labelled in a card. Query params shown as editable key-value table (Pro: modify params and reconstruct URL). Separate keyword: `url parser online`.

---

### Tool 6: Hash Generator
**Slug:** `hash-generator` | **Category:** `security` | **Libraries:** `spark-md5` (~2KB) for MD5 only; SHA via Web Crypto

**URL State:** `{ input: string, inputType: 'text'|'file', uppercase: 'true'|'false' }`

```typescript
// lib/tools/hash/index.ts
import SparkMD5 from 'spark-md5'

async function shaHash(input: string, algo: string): Promise<string> {
  const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(input))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('')
}
export async function hashAll(input: string): Promise<Record<string, string>> {
  const [sha1, sha256, sha384, sha512] = await Promise.all([
    shaHash(input,'SHA-1'), shaHash(input,'SHA-256'), shaHash(input,'SHA-384'), shaHash(input,'SHA-512')
  ])
  return { 'MD5': SparkMD5.hash(input), 'SHA-1': sha1, 'SHA-256': sha256, 'SHA-384': sha384, 'SHA-512': sha512 }
}
export async function hashFile(file: File): Promise<Record<string, string>> {
  const buffer = await file.arrayBuffer()
  const bufToHex = (b: ArrayBuffer) => Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2,'0')).join('')
  const [sha1, sha256, sha512] = await Promise.all([
    crypto.subtle.digest('SHA-1',buffer), crypto.subtle.digest('SHA-256',buffer), crypto.subtle.digest('SHA-512',buffer)
  ])
  return { 'MD5': SparkMD5.ArrayBuffer.hash(buffer), 'SHA-1': bufToHex(sha1), 'SHA-256': bufToHex(sha256), 'SHA-512': bufToHex(sha512) }
}
```

**UI Notes:** All algorithms computed simultaneously in a comparison table. Each row has its own copy button. "Verify hash" section. File drag-and-drop. Privacy badge prominent.

---

### Tool 7: Text Diff / Compare
**Slug:** `text-diff` | **Category:** `text` | **Libraries:** `diff` (~12KB)

**URL State:** `{ original: string, modified: string, mode: 'lines'|'words'|'characters', view: 'split'|'unified' }`

```typescript
// lib/tools/diff/index.ts
import { diffLines, diffWords, diffChars, Change } from 'diff'
export function computeDiff(original: string, modified: string, mode: 'lines'|'words'|'characters') {
  const changes: Change[] = mode === 'lines' ? diffLines(original, modified) : mode === 'words' ? diffWords(original, modified) : diffChars(original, modified)
  const stats = {
    additions: changes.filter(c => c.added).reduce((a,c) => a + (c.count ?? 0), 0),
    deletions: changes.filter(c => c.removed).reduce((a,c) => a + (c.count ?? 0), 0),
    unchanged: changes.filter(c => !c.added && !c.removed).reduce((a,c) => a + (c.count ?? 0), 0),
  }
  return { changes, stats, isIdentical: stats.additions === 0 && stats.deletions === 0 }
}
```

**UI Notes:** Split view (two CodeMirror editors, red/green highlights) and unified view (GitHub style). Stats bar at top. Language selector for syntax highlighting.

---

### Tool 8: Regex Tester
**Slug:** `regex-tester` | **Category:** `text` | **Libraries:** Native `RegExp`

**URL State:** `{ pattern: string, flags: string, input: string }`

```typescript
// lib/tools/regex/index.ts
export function testRegex(pattern: string, flags: string, input: string) {
  if (!pattern) return { isValid: true, isMatch: false, matches: [], highlights: [] }
  try {
    new RegExp(pattern, flags)  // validate
    const globalFlags = flags.includes('g') ? flags : flags + 'g'
    const allMatches = [...input.matchAll(new RegExp(pattern, globalFlags))]
    const matches = allMatches.map(m => ({
      value: m[0], index: m.index!, end: m.index! + m[0].length,
      groups: m.groups ?? {}, captures: [...m].slice(1),
    }))
    return { isValid: true, isMatch: matches.length > 0, matches, highlights: matches.map(m => ({ start: m.index, end: m.end })) }
  } catch (e: any) {
    return { isValid: false, isMatch: false, matches: [], highlights: [], error: e.message }
  }
}
```

**UI Notes:** Flags as checkboxes (g, i, m, s, u, d). Inline match highlighting in textarea. Match chip list below. Always-visible cheatsheet sidebar. Common pattern library (email, URL, phone, IPv4, date).

---

### Tool 9: Cron Expression Builder
**Slug:** `cron-builder` | **Category:** `devops` | **Libraries:** `cronstrue` (~8KB), `cron-parser` (~15KB)

**URL State:** `{ expression: string, timezone: string }`

```typescript
// lib/tools/cron/index.ts
import cronstrue from 'cronstrue'
import parser from 'cron-parser'

export function parseCron(expression: string, timezone = 'UTC') {
  const trimmed = expression.trim()
  if (!trimmed) return { isValid: false, humanReadable: '', nextRuns: [], error: 'Empty expression' }
  try {
    const humanReadable = cronstrue.toString(trimmed, { use24HourTimeFormat: true })
    const interval = parser.parseExpression(trimmed, { tz: timezone })
    const nextRuns: Date[] = []
    for (let i = 0; i < 5; i++) nextRuns.push(interval.next().toDate())
    const [minute, hour, dayOfMonth, month, dayOfWeek] = trimmed.split(' ')
    return { isValid: true, humanReadable, nextRuns, parts: { minute, hour, dayOfMonth, month, dayOfWeek } }
  } catch (e: any) {
    return { isValid: false, humanReadable: '', nextRuns: [], error: e.message }
  }
}
```

**UI Notes:** Expression input + live human-readable translation. 5 labelled part inputs synced bidirectionally with main expression. Next 5 runs as timeline. Presets: `@hourly`, `@daily`, `@weekly`, `@monthly`. Natural language → cron conversion.

---

### Tool 10: Color Converter & Contrast Checker
**Slug:** `color-converter` | **Category:** `design` | **Libraries:** `culori` (~20KB, tree-shakeable)

**URL State:** `{ color: string, mode: 'convert'|'contrast', background: string }`

```typescript
// lib/tools/color/index.ts
import { parse, formatHex, formatRgb, formatHsl, formatCss, wcagContrast } from 'culori'

export function convertColor(input: string) {
  const parsed = parse(input)
  if (!parsed) return { isValid: false, error: 'Could not parse color' }
  return {
    isValid: true,
    hex:       formatHex(parsed) ?? '',
    rgb:       formatRgb(parsed) ?? '',
    hsl:       formatHsl(parsed) ?? '',
    oklch:     formatCss({ ...parsed, mode: 'oklch' } as any) ?? '',
    displayP3: formatCss({ ...parsed, mode: 'p3' } as any) ?? '',
    raw: { r: parsed.r ?? 0, g: parsed.g ?? 0, b: parsed.b ?? 0 },
  }
}
export function checkContrast(fg: string, bg: string) {
  const fgParsed = parse(fg), bgParsed = parse(bg)
  if (!fgParsed || !bgParsed) return null
  const ratio = wcagContrast(fgParsed, bgParsed)
  return { ratio: Math.round(ratio * 100) / 100, aa: ratio >= 4.5, aaa: ratio >= 7, aaLarge: ratio >= 3 }
}
```

**UI Notes:** Color picker + text input. Results table with copy buttons per row. Large swatch. OKLCH highlighted as "Modern CSS". Contrast checker with WCAG AA/AAA badges. Bonus keyword: `oklch converter`.

---

### Tool 11: LLM Token Counter ⭐ AI Era
**Slug:** `llm-token-counter` | **Category:** `ai-era` | **Libraries:** `js-tiktoken` (WASM ~2MB, Web Worker)

**URL State:** `{ input: string, model: string }`

**Model Pricing File:** `public/data/model-pricing.json` — updated via PR or scheduled GitHub Action.

```json
{
  "lastUpdated": "2026-02-01",
  "models": [
    { "id": "gpt-4o",            "encoding": "o200k_base", "contextWindow": 128000,  "inputPer1M": 2.50,  "outputPer1M": 10.00 },
    { "id": "gpt-4o-mini",       "encoding": "o200k_base", "contextWindow": 128000,  "inputPer1M": 0.15,  "outputPer1M": 0.60  },
    { "id": "o1",                "encoding": "o200k_base", "contextWindow": 200000,  "inputPer1M": 15.00, "outputPer1M": 60.00 },
    { "id": "o3-mini",           "encoding": "o200k_base", "contextWindow": 200000,  "inputPer1M": 1.10,  "outputPer1M": 4.40  },
    { "id": "claude-3-5-sonnet", "encoding": "cl100k_base","contextWindow": 200000,  "inputPer1M": 3.00,  "outputPer1M": 15.00 },
    { "id": "claude-3-5-haiku",  "encoding": "cl100k_base","contextWindow": 200000,  "inputPer1M": 0.80,  "outputPer1M": 4.00  },
    { "id": "gemini-2-0-flash",  "encoding": "cl100k_base","contextWindow": 1048576, "inputPer1M": 0.10,  "outputPer1M": 0.40  },
    { "id": "gemini-2-0-pro",    "encoding": "cl100k_base","contextWindow": 2000000, "inputPer1M": 1.25,  "outputPer1M": 5.00  }
  ]
}
```

**Web Worker:**
```typescript
// lib/tools/ai-tokens/worker.ts
import { get_encoding } from 'js-tiktoken'
self.onmessage = (e: MessageEvent<{ text: string; encoding: string }>) => {
  try {
    const enc = get_encoding(e.data.encoding as any)
    const tokens = enc.encode(e.data.text)
    const tokenIds = Array.from(tokens)
    enc.free()
    self.postMessage({ success: true, tokenCount: tokenIds.length, tokenIds })
  } catch (err: any) { self.postMessage({ success: false, error: err.message }) }
}

// Instantiate in component:
// const worker = useMemo(() => new Worker(new URL('@/lib/tools/ai-tokens/worker.ts', import.meta.url)), [])
// Terminate on unmount: return () => worker.terminate()
```

**UI Notes:** Large textarea input. Model selector (grouped by provider). Live token count. Context window fill bar (green < 75%, yellow 75–90%, orange 90–100%, red over limit). Cross-model comparison table (paste once, see all models). Token boundary highlighting toggle. Expected output tokens for cost calc. "Pricing last updated X days ago" note. Pro: exact Claude/Gemini via server API call.

---

### Tool 12: AI Model Cost Calculator ⭐ AI Era
**Slug:** `ai-cost-calculator` | **Category:** `ai-era` | **Libraries:** None (pure math)

**URL State:** `{ inputTokens: string, outputTokens: string, model: string, requests: string, period: 'per-request'|'per-day'|'per-month' }`

```typescript
// lib/tools/ai-cost/index.ts
export function calculateCost(params: { inputTokens: number; outputTokens: number; model: ModelConfig; requests: number }) {
  const { inputTokens, outputTokens, model, requests } = params
  const perReq = {
    input:  (inputTokens  / 1_000_000) * model.inputPer1M,
    output: (outputTokens / 1_000_000) * model.outputPer1M,
    total:  ((inputTokens / 1_000_000) * model.inputPer1M) + ((outputTokens / 1_000_000) * model.outputPer1M),
  }
  return { perRequest: perReq, perDay: { ...perReq, total: perReq.total * requests }, perMonth: { ...perReq, total: perReq.total * requests * 30 } }
}
```

**UI Notes:** Input/output tokens + requests per day + model selector. Per-request / per-day / per-month breakdown. "Compare across models" table. Budget reverse calculator: "I have $X/month → how many requests?"

---

### Tool 13: Case Converter
**Slug:** `case-converter` | **Category:** `text` | **Libraries:** Native

**URL State:** `{ input: string }`

```typescript
// lib/tools/case/index.ts
export const conversions: Record<string, (s: string) => string> = {
  'camelCase':       s => s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_,c) => c.toUpperCase()),
  'PascalCase':      s => s.replace(/(^\w|[^a-zA-Z0-9]\w)/g, c => c.replace(/[^a-zA-Z0-9]/,'').toUpperCase()),
  'snake_case':      s => s.replace(/\s+/g,'_').replace(/([A-Z])/g,'_$1').replace(/^_/,'').toLowerCase(),
  'SCREAMING_SNAKE': s => conversions['snake_case'](s).toUpperCase(),
  'kebab-case':      s => s.replace(/\s+/g,'-').replace(/([A-Z])/g,'-$1').replace(/^-/,'').toLowerCase(),
  'Title Case':      s => s.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()),
  'Sentence case':   s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(),
  'lowercase':       s => s.toLowerCase(),
  'UPPERCASE':       s => s.toUpperCase(),
  'dot.case':        s => conversions['snake_case'](s).replace(/_/g,'.'),
  'path/case':       s => conversions['snake_case'](s).replace(/_/g,'/'),
}
```

**UI Notes:** Single textarea input. All variants displayed simultaneously in a grid, each with a copy button.

---

### Tool 14: .env File Validator
**Slug:** `env-validator` | **Category:** `devops` | **Libraries:** Native

**URL State:** `{ input: string }`

```typescript
// lib/tools/env/index.ts
export function parseEnvFile(content: string) {
  const lines = content.split('\n')
  const keys = new Map<string, number>()
  const entries: Array<{ line: number; key: string; value: string; isValid: boolean; issues: string[] }> = []
  lines.forEach((rawLine, i) => {
    const trimmed = rawLine.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) { entries.push({ line: i+1, key: trimmed, value: '', isValid: false, issues: ['Missing = sign'] }); return }
    const key = trimmed.slice(0, eqIndex).trim()
    const value = trimmed.slice(eqIndex + 1).trim()
    const issues: string[] = []
    if (!/^[A-Z_][A-Z0-9_]*$/.test(key)) issues.push('Key should be UPPER_SNAKE_CASE')
    if (keys.has(key)) issues.push(`Duplicate key (first on line ${keys.get(key)})`)
    if (value.includes(' ') && !value.startsWith('"') && !value.startsWith("'")) issues.push('Value with spaces should be quoted')
    keys.set(key, i+1)
    entries.push({ line: i+1, key, value, isValid: issues.length === 0, issues })
  })
  return { entries, summary: { total: entries.length, valid: entries.filter(e => e.isValid).length, invalid: entries.filter(e => !e.isValid).length } }
}
```

**UI Notes:** Textarea input. Results table: line, key, value (masked by default), issues. Download fixed .env. Pro: compare two .env files side-by-side.

---

### Tool 15: OpenAPI / JSON Schema Validator
**Slug:** `openapi-validator` | **Category:** `devops` | **Libraries:** `ajv` (~30KB), `@readme/openapi-parser` (~50KB)

**URL State:** `{ input: string, format: 'json-schema'|'openapi-3', inputFormat: 'json'|'yaml' }`

**UI Notes:** CodeMirror with JSON/YAML mode. Clickable error list jumps to offending line. Success: endpoint count, schema count, security schemes.

---

### Tool 16: YAML ↔ JSON ↔ TOML Converter
**Slug:** `data-format-converter` | **Category:** `data-formats` | **Libraries:** `js-yaml` (~20KB), `@iarna/toml` (~15KB)

**URL State:** `{ input: string, from: 'json'|'yaml'|'toml', to: 'json'|'yaml'|'toml' }`

```typescript
// lib/tools/data-formats/index.ts
import yaml from 'js-yaml'
import toml from '@iarna/toml'
type Format = 'json' | 'yaml' | 'toml'
const parsers: Record<Format, (s: string) => unknown> = {
  json: s => JSON.parse(s), yaml: s => yaml.load(s), toml: s => toml.parse(s)
}
const serialisers: Record<Format, (d: unknown) => string> = {
  json: d => JSON.stringify(d, null, 2), yaml: d => yaml.dump(d, { indent: 2 }), toml: d => toml.stringify(d as any)
}
export function convertFormat(input: string, from: Format, to: Format): ToolResult {
  try {
    if (from === to) return { output: input, isValid: true }
    return { output: serialisers[to](parsers[from](input)), isValid: true }
  } catch (e: any) { return { output: '', isValid: false, error: { message: e.message } } }
}
```

**UI Notes:** Two format dropdowns with swap button. Side-by-side CodeMirror editors. Language modes auto-switch.

---

### Tool 17: CSV ↔ JSON Converter + Table Viewer
**Slug:** `csv-json-converter` | **Category:** `data-formats` | **Libraries:** `papaparse` (~25KB)

**URL State:** `{ mode: 'csv-to-json'|'json-to-csv', view: 'json'|'table', delimiter: 'comma'|'semicolon'|'tab', header: 'true'|'false' }`

**UI Notes:** CSV mode output toggles between JSON text and live sortable HTML table. File upload: Free 5MB, Pro 50MB. Auto-detect delimiter.

---

### Tool 18: JWT Decoder
**Slug:** `jwt-decoder` | **Category:** `security` | **Libraries:** None (Base64url + native JSON)

**URL State:** `{ token: string }`

```typescript
// lib/tools/jwt/index.ts
export function decodeJwt(token: string) {
  const parts = token.trim().split('.')
  if (parts.length !== 3) return { isValid: false, error: 'JWT must have 3 parts' }
  try {
    const decode = (p: string) => JSON.parse(atob(p.replace(/-/g,'+').replace(/_/g,'/')))
    const header = decode(parts[0]), payload = decode(parts[1])
    return {
      isValid: true, header, payload, signature: parts[2],
      isExpired: payload.exp ? payload.exp * 1000 < Date.now() : undefined,
      expiresAt: payload.exp ? new Date(payload.exp * 1000) : undefined,
      issuedAt:  payload.iat ? new Date(payload.iat * 1000) : undefined,
    }
  } catch (e: any) { return { isValid: false, error: 'Failed to decode token' } }
}
```

**UI Notes:** Colour-coded sections (header red, payload purple, signature blue). `exp`/`iat`/`nbf` shown as human-readable dates. Expiry badge ("Valid for 2h" or "⚠️ Expired 3d ago"). Privacy note: signature not verified, token stays local.

---

### Tool 19: HTML Entity Encoder / Decoder
**Slug:** `html-entity-tool` | **Category:** `web` | **Libraries:** Native `DOMParser`

**URL State:** `{ input: string, mode: 'encode'|'decode' }`

```typescript
// lib/tools/html-entities/index.ts
export function encodeHtmlEntities(input: string): string {
  return input.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;')
}
export function decodeHtmlEntities(input: string): string {
  return new DOMParser().parseFromString(input, 'text/html').documentElement.textContent ?? ''
}
```

**UI Notes:** Shows named (`&amp;`) and numeric (`&#38;`) variants. Reference table of common entities below tool.

---

### Tool 20: Lorem Ipsum Generator
**Slug:** `lorem-ipsum-generator` | **Category:** `generators` | **Libraries:** None

**URL State:** `{ type: 'paragraphs'|'sentences'|'words'|'bytes', count: string, mode: 'classic'|'developer', startWithLorem: 'true'|'false' }`

**UI Notes:** "Developer mode" generates technical-sounding placeholder text using programming terminology. Output appears live, copy button top right.

---

### Tool 21: Number Base Converter
**Slug:** `number-base-converter` | **Category:** `math` | **Libraries:** Native (`parseInt`, `toString`)

**URL State:** `{ value: string, fromBase: '2'|'8'|'10'|'16' }`

```typescript
// lib/tools/number-base/index.ts
export function convertBase(value: string, fromBase: number) {
  const decimal = parseInt(value, fromBase)
  if (isNaN(decimal)) return null
  return { binary: decimal.toString(2), octal: decimal.toString(8), decimal: decimal.toString(10), hex: decimal.toString(16).toUpperCase() }
}
```

**UI Notes:** Four simultaneous inputs (Binary, Octal, Decimal, Hex) — all update live when any changes. Bit length indicator (8/16/32/64-bit representation).

---

### Tool 22: JSON → TypeScript Interface Generator
**Slug:** `json-to-typescript` | **Category:** `code` | **Libraries:** Custom recursive (~50 lines)

**URL State:** `{ input: string, rootName: string, optionalFields: 'true'|'false' }`

```typescript
// lib/tools/json-to-ts/index.ts
export function jsonToTs(json: unknown, name: string, indent = 0): string {
  const pad = '  '.repeat(indent)
  if (Array.isArray(json)) {
    if (json.length === 0) return `${name}: unknown[]`
    return `${name}: Array<${jsonToTs(json[0], 'Item', indent).replace(/^Item: /, '')}>`
  }
  if (json === null)             return `${name}: null`
  if (typeof json === 'boolean') return `${name}: boolean`
  if (typeof json === 'number')  return `${name}: number`
  if (typeof json === 'string')  return `${name}: string`
  if (typeof json === 'object') {
    const lines = Object.entries(json as object).map(([k, v]) => {
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `"${k}"`
      return `${pad}  ${jsonToTs(v, safeKey, indent + 1)};`
    })
    return `{\n${lines.join('\n')}\n${pad}}`
  }
  return `${name}: unknown`
}
export function generateInterface(jsonString: string, rootName = 'Root'): ToolResult {
  try {
    const parsed = JSON.parse(jsonString)
    return { output: `interface ${rootName} ${jsonToTs(parsed, rootName, 0)}`, isValid: true }
  } catch (e: any) { return { output: '', isValid: false, error: { message: e.message } } }
}
```

**UI Notes:** Root name configurable. Optional fields toggle (adds `?`). CodeMirror output with TypeScript syntax highlighting.

---

### Tool 23: Markdown → HTML Preview
**Slug:** `markdown-preview` | **Category:** `text` | **Libraries:** `marked` (~20KB), `DOMPurify`

**URL State:** `{ input: string, view: 'preview'|'html' }`

**UI Notes:** Left: CodeMirror (Markdown mode). Right: rendered preview or raw HTML source. Sanitise with DOMPurify before rendering to prevent XSS.

---

### Tool 24: CSS Gradient Generator
**Slug:** `css-gradient-generator` | **Category:** `design` | **Libraries:** None (pure CSS + canvas)

**URL State:** `{ type: 'linear'|'radial'|'conic', angle: string, stops: string }`

**UI Notes:** Live gradient swatch. Drag-and-drop colour stops on gradient bar. CSS output as `background` shorthand. Presets gallery (20+ curated gradients). Copy as CSS, Tailwind class, or SVG.

---

### Tool 25: String Utilities
**Slug:** `string-utilities` | **Category:** `text` | **Libraries:** Native

**URL State:** `{ input: string, operation: string }`

```typescript
// lib/tools/string-utils/index.ts
export const operations: Record<string, (s: string) => string | object> = {
  'word-count':        s => ({ words: s.split(/\s+/).filter(Boolean).length, chars: s.length, lines: s.split('\n').length }),
  'reverse':           s => [...s].reverse().join(''),
  'slugify':           s => s.toLowerCase().trim().replace(/[^\w\s-]/g,'').replace(/\s+/g,'-'),
  'trim':              s => s.trim(),
  'remove-duplicates': s => [...new Set(s.split('\n'))].join('\n'),
  'sort-lines':        s => s.split('\n').sort().join('\n'),
  'byte-count':        s => new TextEncoder().encode(s).length.toString(),
  'uppercase':         s => s.toUpperCase(),
  'lowercase':         s => s.toLowerCase(),
}
```

**UI Notes:** Operation selector as tabs. Word count shows rich stat card. Each operation instant.

---

## 9. Monetisation — Ads

### Ad Network: EthicalAds

Use [EthicalAds](https://www.ethicalads.io/) exclusively. Reasons:
- Developer-focused advertisers (tech SaaS)
- GDPR compliant by design — no cookies, no consent banner
- Whitelisted by AdBlock Plus and most blockers
- Text-based ad units that respect tool UX
- Publisher CPM: ~$2.25–$2.75

**Apply for EthicalAds during Phase 2 (after first tools are live).** Approval requires a real site with developer-relevant content.

```tsx
// components/shell/EthicalAdsUnit.tsx
'use client'
export function EthicalAdsUnit() {
  return <div data-ea-publisher="toolhausdev" data-ea-type="text" data-ea-style="stickybox" className="ethical-ads-unit mb-6" />
}
// Root layout: <Script src="https://media.ethicalads.io/media/client/ethicalads.min.js" strategy="lazyOnload" />
// Pro users: body.is-pro .ethical-ads-unit { display: none; }
```

**Placement rules:**
- One ad unit per page (sidebar desktop, below tool mobile)
- Never inside tool UI
- Hidden for Pro users via CSS class

---

## 10. Monetisation — Pro Subscription

### Pricing

| Plan | Price | Notes |
|---|---|---|
| Monthly | $7/month | Lower barrier to try |
| Annual | $49/year | Push this — 41% saving, better LTV |

### Feature Matrix

| Feature | Free | Pro |
|---|---|---|
| All 25 tools | ✅ | ✅ |
| Ads shown | ✅ | ❌ removed |
| Tool history (last 50) | ❌ | ✅ |
| Saved named snippets | ❌ | ✅ |
| Max file upload | 5MB | 50MB |
| Batch processing | Limited | Full |
| API access | ❌ | ✅ |
| Exact Claude/Gemini tokens | ❌ | ✅ |
| Browser extension all tools | ❌ | ✅ |
| Early access to new tools | ❌ | ✅ |

### Pro API

```
Base: https://toolhaus.dev/api/pro/
Auth: Bearer token (generated in /dashboard)
Rate: 1,000 requests/day

POST /api/pro/tools/[slug]   Body: { input, options }  → { output, isValid }
GET  /api/pro/history        → last 50 entries
POST /api/pro/history        Body: { toolSlug, input }
GET  /api/pro/snippets       → saved snippets
POST /api/pro/snippets       Body: { toolSlug, name, input }
```

### Revenue Projections (Combined Model)

| Monthly Visits | EthicalAds | Pro Subs (2%) | Total |
|---|---|---|---|
| 50K | ~$100 | ~$700 (10 users) | **~$800** |
| 250K | ~$625 | ~$3,500 (50 users) | **~$4,125** |
| 500K | ~$1,300 | ~$7,000 (100 users) | **~$8,300** |
| 1M | ~$2,750 | ~$14,000 (200 users) | **~$16,750** |

---

## 11. Authentication & Payments

### Clerk Setup

```bash
pnpm add @clerk/nextjs
```

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
const isProtectedRoute = createRouteMatcher(['/api/pro/(.*)', '/dashboard/(.*)'])
export default clerkMiddleware((auth, req) => { if (isProtectedRoute(req)) auth().protect() })
export const config = { matcher: ['/((?!_next|.*\\..*).*)'] }
```

### Stripe Products

Create in Stripe Dashboard:
- **Product:** Toolhaus Pro
  - **Price 1:** $7.00 / month recurring → `STRIPE_MONTHLY_PRICE_ID`
  - **Price 2:** $49.00 / year recurring → `STRIPE_YEARLY_PRICE_ID`

### Checkout Flow

```
User clicks "Go Pro"
    ↓
POST /api/pro/checkout { priceId }
    ↓
Create Stripe Checkout session (Clerk userId in metadata)
    ↓
Redirect to Stripe hosted checkout
    ↓
Success: Stripe webhook → POST /api/webhooks/stripe
    ↓
Verify signature → update Turso (plan: 'pro') + Clerk publicMetadata
    ↓
Redirect to /dashboard
```

```typescript
// app/api/webhooks/stripe/route.ts
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { clerkClient } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!
  const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const clerkUserId = session.metadata?.clerkUserId
    await db.execute({ sql: 'INSERT OR REPLACE INTO users (clerk_id, plan, stripe_customer_id) VALUES (?,?,?)', args: [clerkUserId, 'pro', session.customer] })
    await (await clerkClient()).users.updateUserMetadata(clerkUserId, { publicMetadata: { plan: 'pro' } })
  }
  if (event.type === 'customer.subscription.deleted') {
    // Downgrade: update Turso plan='free', update Clerk publicMetadata plan='free'
  }
  return Response.json({ received: true })
}
```

### Turso Schema

```sql
CREATE TABLE users (
  clerk_id           TEXT PRIMARY KEY,
  plan               TEXT NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  created_at         INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at         INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE tool_history (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  clerk_id   TEXT NOT NULL REFERENCES users(clerk_id),
  tool_slug  TEXT NOT NULL,
  input      TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX idx_history ON tool_history(clerk_id, tool_slug, created_at DESC);

CREATE TABLE saved_snippets (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  clerk_id   TEXT NOT NULL REFERENCES users(clerk_id),
  tool_slug  TEXT NOT NULL,
  name       TEXT NOT NULL,
  input      TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
```

---

## 12. Browser Extension — Phase 2

**Target:** Chrome (Manifest V3) first, then Firefox.  
**Timeline:** Begin after web hub reaches 100K monthly visits (~Month 4–6).  
**Monetisation:** Free install. Pro features unlock with same subscription as web app.

### Manifest V3

```json
{
  "manifest_version": 3,
  "name": "Toolhaus",
  "version": "1.0.0",
  "description": "Developer tools in your browser. Right-click any text to run a Toolhaus tool.",
  "permissions": ["contextMenus", "storage", "activeTab"],
  "action": { "default_popup": "popup/index.html" },
  "background": { "service_worker": "service-worker.js" },
  "content_scripts": [{ "matches": ["<all_urls>"], "js": ["content-script.js"] }]
}
```

### Context Menu Actions

```typescript
// service-worker.ts
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: 'toolhaus-root', title: 'Toolhaus', contexts: ['selection'] })
  ;[
    { id: 'decode-base64',     title: 'Decode as Base64' },
    { id: 'convert-timestamp', title: 'Convert Timestamp' },
    { id: 'format-json',       title: 'Format as JSON' },
    { id: 'count-tokens',      title: 'Count LLM Tokens' },
    { id: 'decode-jwt',        title: 'Decode JWT' },
    { id: 'convert-color',     title: 'Convert Color' },
    { id: 'hash-sha256',       title: 'Hash (SHA-256)' },
  ].forEach(a => chrome.contextMenus.create({ ...a, parentId: 'toolhaus-root', contexts: ['selection'] }))
})

chrome.contextMenus.onClicked.addListener((info) => {
  const slugMap: Record<string, string> = {
    'decode-base64': 'base64-tool', 'convert-timestamp': 'timestamp-converter',
    'format-json': 'json-formatter', 'count-tokens': 'llm-token-counter',
    'decode-jwt': 'jwt-decoder', 'convert-color': 'color-converter', 'hash-sha256': 'hash-generator',
  }
  const slug = slugMap[info.menuItemId as string]
  if (slug) chrome.tabs.create({ url: `https://toolhaus.dev/tools/${slug}?input=${encodeURIComponent(info.selectionText ?? '')}` })
})
```

### Popup App

- React + Vite (separate build)
- Shows 5 pinned tools (configurable in extension settings)
- Minimal single-input / single-output per tool
- Signs in via Clerk to sync Pro status and pinned tools
- Shares tool logic from `packages/tool-sdk` — no code duplication

### Architecture Note

The monorepo structure in Part 1 already accommodates this. Tool logic lives in `packages/tool-sdk` and is shared between the web app and extension without duplication.

---

## 13. Deployment & Infrastructure

### Vercel Configuration

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
    },
    { "source": "/api/(.*)", "headers": [{ "key": "Cache-Control", "value": "no-store" }] }
  ]
}
```

### Monthly Infrastructure Cost

| Service | Plan | Cost |
|---|---|---|
| Vercel | Pro | $20/month |
| Turso | Starter → Scaler | $0–$29/month |
| Clerk | Free < 10K MAU | $0–$25/month |
| Plausible | Starter | $9/month |
| Domain | toolhaus.dev | ~$15/year |
| **Total** | | **~$30–$55/month** |

Stripe: 2.9% + $0.30 per transaction (usage-based).

---

## 14. Build Sequence

### Phase 1 — Foundation (Days 1–5)
- [ ] Turborepo monorepo with pnpm
- [ ] Next.js 15 + TypeScript strict + Tailwind CSS v4 + shadcn/ui
- [ ] `packages/tool-sdk` shared types
- [ ] Tools registry (`lib/tools-registry.ts`)
- [ ] ToolShell, Navbar, Footer, Sidebar components
- [ ] ⌘K command palette (Fuse.js, client-side)
- [ ] SEO infrastructure (generateMetadata, schema generators, sitemap, robots)
- [ ] Deploy to Vercel, configure toolhaus.dev domain
- [ ] Plausible analytics

### Phase 2 — Core Tools (Days 6–18)
Build in SEO priority order:
- [ ] Tool 1: JSON Formatter (+ tree view)
- [ ] Tool 2: Base64 (text + file)
- [ ] Tool 4: Timestamp Converter (+ live clock)
- [ ] Tool 6: Hash Generator (all algos + file)
- [ ] Tool 3: UUID/ULID/NanoID
- [ ] Tool 5: URL Encoder/Parser
- [ ] Tool 13: Case Converter
- [ ] Tool 21: Number Base Converter
- [ ] Tool 19: HTML Entity Encoder
- [ ] Tool 20: Lorem Ipsum Generator
- [ ] Tool 25: String Utilities
- [ ] Tool 23: Markdown Preview

### Phase 3 — AI Era Tools (Days 19–26)
- [ ] Tool 11: LLM Token Counter (Web Worker + WASM)
- [ ] Tool 12: AI Cost Calculator
- [ ] `public/data/model-pricing.json` + update mechanism

### Phase 4 — Remaining Tools (Days 27–35)
- [ ] Tool 7: Text Diff
- [ ] Tool 8: Regex Tester (+ cheatsheet)
- [ ] Tool 9: Cron Builder
- [ ] Tool 10: Color Converter + Contrast
- [ ] Tool 16: YAML/JSON/TOML
- [ ] Tool 17: CSV/JSON + Table
- [ ] Tool 18: JWT Decoder
- [ ] Tool 22: JSON → TypeScript
- [ ] Tool 24: CSS Gradient Generator
- [ ] Tool 14: .env Validator
- [ ] Tool 15: OpenAPI Validator

### Phase 5 — Monetisation (Days 36–42)
- [ ] EthicalAds integration (apply for approval at Phase 2)
- [ ] Clerk auth setup
- [ ] Stripe products + pricing page
- [ ] Checkout flow + webhook handler
- [ ] Turso schema + database client
- [ ] Pro feature flags (ad removal, history, batch limits)
- [ ] /dashboard page (history, snippets, API key)
- [ ] Pro API routes

### Phase 6 — SEO Content Layer (Days 43–48)
- [ ] FAQ content for every tool (minimum 3 Q&As per tool)
- [ ] About section for every tool page (200–400 words)
- [ ] Related tools grids
- [ ] Submit sitemap to Google Search Console
- [ ] Google Search Console property setup

### Phase 7 — Polish & Launch (Days 49–55)
- [ ] Core Web Vitals audit
- [ ] Accessibility audit (keyboard nav, ARIA)
- [ ] Mobile responsiveness for all tools
- [ ] /about and /privacy pages
- [ ] Show HN on Hacker News
- [ ] Share on relevant developer communities

### Phase 8 — Browser Extension (Month 4+)
- [ ] Scaffold `apps/extension`
- [ ] Popup mini-app (React + Vite)
- [ ] Context menu service worker
- [ ] Chrome Web Store submission
- [ ] Firefox port

---

## 15. Environment Variables

```bash
# .env.local

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...

# Turso
TURSO_DATABASE_URL=libsql://toolhaus-....turso.io
TURSO_AUTH_TOKEN=eyJhbGc...

# Anthropic (Pro: exact Claude token counts)
ANTHROPIC_API_KEY=sk-ant-...

# Plausible
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=toolhaus.dev

# App
NEXT_PUBLIC_APP_URL=https://toolhaus.dev
```

---

## Quick Reference

### All 25 Tool Slugs

```
json-formatter          base64-tool             uuid-generator
timestamp-converter     url-tool                hash-generator
text-diff               regex-tester            cron-builder
color-converter         llm-token-counter       ai-cost-calculator
case-converter          env-validator           openapi-validator
data-format-converter   csv-json-converter      jwt-decoder
html-entity-tool        lorem-ipsum-generator   number-base-converter
json-to-typescript      markdown-preview        css-gradient-generator
string-utilities
```

### Key Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| URL state | nuqs | Shareable links; no server cost; SEO benefit |
| Ad network | EthicalAds | Developer CPM; blocker-safe; no GDPR popup |
| Auth | Clerk | Fastest to implement; webhooks work with Stripe |
| Database | Turso | SQLite simplicity; Pro data only, minimal schema |
| Tokeniser | js-tiktoken WASM | Official, accurate, fully client-side |
| Code editor | CodeMirror 6 | Lighter than Monaco; works on mobile |
| Analytics | Plausible | No cookie banner; matches privacy positioning |
| Hosting | Vercel | Zero-config Next.js; Edge network; ISR |
| Monorepo | Turborepo | Shared packages between web + extension |

---

*Part 2 of 2 — Toolhaus.dev — 2026-02-28*  
*See Part 1: Toolhaus_Handoff_Part1_Architecture.md for stack, repository structure, registry, SEO and shell.*
