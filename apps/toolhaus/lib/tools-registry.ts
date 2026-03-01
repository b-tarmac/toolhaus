import { lazy } from "react";
import type { ToolConfig, ToolCategory } from "@portfolio/tool-sdk";

const defaultSchema = {
  faqs: [
    {
      question: "Is my data safe?",
      answer:
        "Yes. All processing happens in your browser. No data is sent to Toolhaus servers.",
    },
    {
      question: "Does this tool work offline?",
      answer:
        "Yes. Once the page is loaded, all processing happens locally in your browser.",
    },
    {
      question: "Can I share my results?",
      answer:
        "Yes. Tool inputs and outputs are stored in the URL, so you can share the link with anyone.",
    },
  ],
  appCategory: "DeveloperApplication" as const,
};

export const tools: ToolConfig[] = [
  {
    slug: "json-formatter",
    name: "JSON Formatter & Validator",
    shortName: "JSON",
    description:
      "Format, validate and minify JSON online — processed entirely in your browser. Supports 2-space, 4-space and tab indentation.",
    category: "data-formats",
    tags: ["json", "formatter", "validator", "beautifier", "minifier", "lint"],
    component: lazy(() =>
      import("@/components/tools/JsonFormatter").then((m) => ({
        default: m.default,
      }))
    ),
    relatedTools: [
      "data-format-converter",
      "openapi-validator",
      "text-diff",
      "json-to-typescript",
    ],
    keywordsForSeo: [
      "json formatter",
      "json beautifier",
      "json validator online",
      "json minifier",
    ],
    schema: {
      ...defaultSchema,
      faqs: [
        {
          question: "What is the maximum JSON size?",
          answer:
            "There is no hard limit. Files above 50MB may be slow due to browser memory. All processing happens in your browser.",
        },
        {
          question: "Which indentation styles are supported?",
          answer:
            "2-space, 4-space, and tab indentation. Minify removes all whitespace. The tree view helps explore nested structures visually.",
        },
        {
          question: "Does it validate JSON syntax?",
          answer:
            "Yes. Invalid JSON is highlighted with line and column numbers. The tool shows parse errors so you can fix them quickly.",
        },
      ],
    },
  },
  {
    slug: "base64-tool",
    name: "Base64 Encoder / Decoder",
    shortName: "Base64",
    description:
      "Encode and decode Base64 strings. Supports text and file input. URL-safe variant available.",
    category: "encoding",
    tags: ["base64", "encode", "decode", "base64url"],
    component: lazy(() =>
      import("@/components/tools/Base64Tool").then((m) => ({
        default: m.default,
      }))
    ),
    relatedTools: ["url-tool", "hash-generator", "jwt-decoder"],
    keywordsForSeo: ["base64 encode", "base64 decode", "base64url"],
    schema: {
      ...defaultSchema,
      faqs: [
        {
          question: "What is Base64 encoding used for?",
          answer:
            "Base64 converts binary data into ASCII text, making it safe for transmission in JSON, URLs, email, and other text-only contexts. Common uses include embedding images in data URLs, encoding API credentials, and storing binary data in databases.",
        },
        {
          question: "What is the difference between Base64 and Base64URL?",
          answer:
            "Base64URL replaces + and / with - and _ respectively, and omits padding. This makes the output safe for use in URLs and filenames without additional encoding.",
        },
        {
          question: "Is my data sent to a server when encoding or decoding?",
          answer:
            "No. All Base64 encoding and decoding happens entirely in your browser. Your data never leaves your device.",
        },
      ],
    },
  },
  {
    slug: "uuid-generator",
    name: "UUID / ULID / NanoID Generator",
    shortName: "UUID",
    description:
      "Generate UUID v4, ULID, and NanoID identifiers. Supports bulk generation.",
    category: "generators",
    tags: ["uuid", "ulid", "nanoid", "id", "generator"],
    component: lazy(() =>
      import("@/components/tools/UuidGenerator").then((m) => ({
        default: m.default,
      }))
    ),
    relatedTools: ["hash-generator", "lorem-ipsum-generator"],
    keywordsForSeo: ["uuid generator", "ulid generator", "nanoid generator"],
    schema: {
      ...defaultSchema,
      faqs: [
        {
          question: "When should I use UUID vs ULID vs NanoID?",
          answer:
            "UUID v4 is widely supported and good for distributed systems. ULID is time-sortable and compact (26 chars). NanoID is shorter (21 chars) and URL-safe—ideal when brevity matters.",
        },
        {
          question: "Are generated IDs cryptographically secure?",
          answer:
            "UUID v4 and NanoID use cryptographically secure random sources. ULID uses the current timestamp plus random data. All are suitable for unique identifiers in production.",
        },
        {
          question: "How many IDs can I generate at once?",
          answer:
            "Free users can generate up to 100 IDs per batch. Pro users can generate up to 10,000 IDs at once for bulk operations.",
        },
      ],
    },
  },
  {
    slug: "timestamp-converter",
    name: "Unix Timestamp Converter",
    shortName: "Timestamp",
    description:
      "Convert Unix timestamps to human-readable dates and vice versa. Supports multiple timezones.",
    category: "date-time",
    tags: ["timestamp", "unix", "date", "timezone", "epoch"],
    component: lazy(() =>
      import("@/components/tools/TimestampConverter").then((m) => ({
        default: m.default,
      }))
    ),
    relatedTools: ["cron-builder", "jwt-decoder"],
    keywordsForSeo: [
      "unix timestamp converter",
      "epoch converter",
      "timestamp to date",
    ],
    schema: {
      ...defaultSchema,
      faqs: [
        {
          question: "What is a Unix timestamp?",
          answer:
            "A Unix timestamp is the number of seconds since January 1, 1970 00:00:00 UTC (the Unix epoch). It's a standard way to represent dates in programming and databases.",
        },
        {
          question: "Does this tool support milliseconds?",
          answer:
            "Yes. Unix timestamps can be in seconds (10 digits) or milliseconds (13 digits). The tool automatically detects and converts both formats.",
        },
        {
          question: "Can I convert dates to timestamps for different timezones?",
          answer:
            "Yes. The tool supports all standard timezones via the Intl API. You can convert any date to its Unix timestamp in your chosen timezone.",
        },
      ],
    },
  },
  {
    slug: "url-tool",
    name: "URL Encoder / Decoder / Parser",
    shortName: "URL",
    description:
      "Encode, decode, and parse URLs. Extract query parameters and URL components.",
    category: "web",
    tags: ["url", "encode", "decode", "parse", "query"],
    component: lazy(() =>
      import("@/components/tools/UrlTool").then((m) => ({
        default: m.default,
      }))
    ),
    relatedTools: ["base64-tool", "html-entity-tool"],
    keywordsForSeo: ["url encoder", "url decoder", "url parser online"],
    schema: {
      ...defaultSchema,
      faqs: [
        {
          question: "When do I need to URL-encode a string?",
          answer:
            "URL encoding (percent-encoding) is required when a string contains spaces, special characters, or non-ASCII characters that must be safely transmitted in a URL. Query parameters and path segments often need encoding.",
        },
        {
          question: "Can I edit query parameters after parsing?",
          answer:
            "Yes. Pro users can edit query parameters in a table view and see the updated URL in real time. Free users can encode and decode URLs.",
        },
        {
          question: "What's the difference between encode and decode?",
          answer:
            "Encode converts special characters to percent-encoded form (e.g. space → %20). Decode reverses this, converting %XX sequences back to their original characters.",
        },
      ],
    },
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    shortName: "Hash",
    description:
      "Generate MD5, SHA-1, SHA-256, SHA-384, SHA-512 hashes. Supports text and file input.",
    category: "security",
    tags: ["hash", "md5", "sha", "checksum"],
    component: lazy(() =>
      import("@/components/tools/HashGenerator").then((m) => ({
        default: m.default,
      }))
    ),
    relatedTools: ["base64-tool", "jwt-decoder"],
    keywordsForSeo: ["hash generator", "sha256", "md5 online"],
    schema: {
      ...defaultSchema,
      faqs: [
        {
          question: "Which hash algorithm should I use?",
          answer:
            "For security (passwords, signatures), use SHA-256 or SHA-512. MD5 and SHA-1 are deprecated for security but still used for checksums and non-cryptographic integrity checks.",
        },
        {
          question: "Can I hash files, not just text?",
          answer:
            "Yes. Drag and drop a file or use the file picker. The tool supports hashing binary files. Free tier allows files up to 5MB; Pro supports up to 50MB.",
        },
        {
          question: "Is hashing done in my browser?",
          answer:
            "Yes. All hashing uses the Web Crypto API and runs entirely in your browser. Your data is never uploaded to any server.",
        },
      ],
    },
  },
  {
    slug: "text-diff",
    name: "Text Diff / Compare",
    shortName: "Diff",
    description:
      "Compare two text strings visually. Split and unified view. Syntax highlighting.",
    category: "text",
    tags: ["diff", "compare", "text"],
    component: lazy(() =>
      import("@/components/tools/TextDiff").then((m) => ({
        default: m.default,
      }))
    ),
    relatedTools: ["json-formatter", "regex-tester"],
    keywordsForSeo: ["text diff", "compare text", "diff checker"],
    schema: {
      ...defaultSchema,
      faqs: [
        {
          question: "What's the difference between split and unified view?",
          answer:
            "Split view shows the two texts side by side with changes highlighted. Unified view combines both in a single diff format (like git diff), showing additions and deletions inline.",
        },
        {
          question: "Can I compare JSON or code?",
          answer:
            "Yes. The tool supports syntax highlighting for JSON and common languages. Paste any text—config files, code, or plain text—and compare visually.",
        },
        {
          question: "Is the comparison done locally?",
          answer:
            "Yes. All diff computation happens in your browser. Your text is never sent to any server, so you can safely compare sensitive or proprietary content.",
        },
      ],
    },
  },
  {
    slug: "regex-tester",
    name: "Regex Tester",
    shortName: "Regex",
    description:
      "Test regular expressions against sample text. Supports all flags. Pattern library included.",
    category: "text",
    tags: ["regex", "regular expression", "pattern", "test"],
    component: lazy(() =>
      import("@/components/tools/RegexTester").then((m) => ({
        default: m.default,
      }))
    ),
    relatedTools: ["text-diff", "string-utilities"],
    keywordsForSeo: ["regex tester", "regex online", "regular expression test"],
    schema: {
      ...defaultSchema,
      faqs: [
        {
          question: "What regex flags are supported?",
          answer:
            "All JavaScript regex flags: g (global), i (case-insensitive), m (multiline), s (dotall), u (unicode), and y (sticky). Toggle them with checkboxes for instant feedback.",
        },
        {
          question: "Is there a regex cheatsheet?",
          answer:
            "Yes. A built-in cheatsheet shows common patterns, anchors, quantifiers, and character classes. The pattern library includes ready-to-use regexes for email, URLs, and more.",
        },
        {
          question: "Does it highlight matches in real time?",
          answer:
            "Yes. As you type your pattern or sample text, matches are highlighted inline. Capturing groups are colour-coded for easier debugging.",
        },
      ],
    },
  },
  {
    slug: "cron-builder",
    name: "Cron Expression Builder",
    shortName: "Cron",
    description:
      "Build and validate cron expressions. See human-readable description and next 5 runs.",
    category: "devops",
    tags: ["cron", "schedule", "expression"],
    component: lazy(() =>
      import("@/components/tools/CronBuilder").then((m) => ({
        default: m.default,
      }))
    ),
    relatedTools: ["timestamp-converter", "env-validator"],
    keywordsForSeo: ["cron builder", "cron expression", "cron generator"],
    schema: {
      ...defaultSchema,
      faqs: [
        {
          question: "What cron format does this tool use?",
          answer:
            "Standard 5-field cron format: minute, hour, day of month, month, day of week. Supports * , - / and common extensions. Compatible with Linux cron, GitHub Actions, and most schedulers.",
        },
        {
          question: "Can I see when my cron will run next?",
          answer:
            "Yes. The tool shows the next 5 execution times based on your expression. It also provides a human-readable description (e.g. 'Every day at 3:00 AM').",
        },
        {
          question: "Does it support natural language input?",
          answer:
            "Yes. You can type expressions like 'every 15 minutes' or 'weekdays at 9am' and the tool will convert them to valid cron expressions.",
        },
      ],
    },
  },
  {
    slug: "color-converter",
    name: "Color Converter & Contrast Checker",
    shortName: "Color",
    description:
      "Convert between HEX, RGB, HSL, OKLCH. WCAG contrast checker included.",
    category: "design",
    tags: ["color", "hex", "rgb", "oklch", "contrast"],
    component: lazy(() =>
      import("@/components/tools/ColorConverter").then((m) => ({
        default: m.default,
      }))
    ),
    relatedTools: ["css-gradient-generator"],
    keywordsForSeo: ["color converter", "hex to rgb", "oklch converter"],
    schema: {
      ...defaultSchema,
      faqs: [
        {
          question: "What is OKLCH and why use it?",
          answer:
            "OKLCH is a perceptually uniform color space (Lightness, Chroma, Hue). It makes it easier to create harmonious palettes and predict how colors will look when adjusted. Modern CSS supports OKLCH natively.",
        },
        {
          question: "How does the WCAG contrast checker work?",
          answer:
            "Enter foreground and background colors to see contrast ratios. The tool shows pass/fail for WCAG AA and AAA (normal and large text). Essential for accessible design.",
        },
        {
          question: "Which color formats are supported?",
          answer:
            "HEX (#fff, #ffffff), RGB, HSL, OKLCH, and P3 (display-p3) for wide-gamut displays. All conversions update in real time as you edit any field.",
        },
      ],
    },
  },
  {
    slug: "llm-token-counter",
    name: "LLM Token Counter",
    shortName: "Tokens",
    description:
      "Count tokens for GPT-5, GPT-4.1, Claude 4, Gemini 2.5 and more. Supports multiple models.",
    category: "ai-era",
    tags: ["llm", "token", "gpt", "claude", "ai"],
    component: lazy(() =>
      import("@/components/tools/LlmTokenCounter").then((m) => ({
        default: m.default,
      }))
    ),
    isAiEra: true,
    relatedTools: ["ai-cost-calculator", "json-formatter"],
    keywordsForSeo: ["llm token counter", "gpt token count", "claude tokens"],
    schema: {
      ...defaultSchema,
      faqs: [
        {
          question: "How accurate is the token count?",
          answer:
            "We use the same tokenisation as OpenAI (tiktoken) via js-tiktoken. Counts match OpenAI's API for GPT models. Claude and Gemini use similar tokenisation; counts are approximate but useful for budgeting.",
        },
        {
          question: "Does token counting run in my browser?",
          answer:
            "Yes. Tokenisation runs in a Web Worker using WASM. Your text never leaves your device. No API calls are made for counting.",
        },
        {
          question: "Can I compare token counts across models?",
          answer:
            "Yes. Select multiple models to see a comparison table. Different models have different token limits, so this helps you stay within context windows.",
        },
      ],
    },
  },
  {
    slug: "ai-cost-calculator",
    name: "AI Model Cost Calculator",
    shortName: "AI Cost",
    description:
      "Calculate costs for GPT-4, Claude, Gemini and other models. Per-request and monthly estimates.",
    category: "ai-era",
    tags: ["ai", "cost", "gpt", "claude", "pricing"],
    component: lazy(() =>
      import("@/components/tools/AiCostCalculator").then((m) => ({
        default: m.default,
      }))
    ),
    isAiEra: true,
    relatedTools: ["llm-token-counter"],
    keywordsForSeo: ["ai cost calculator", "gpt cost", "claude pricing"],
    schema: {
      ...defaultSchema,
      faqs: [
        {
          question: "Where do the pricing data come from?",
          answer:
            "Pricing is sourced from official provider documentation (OpenAI, Anthropic, Google, etc.) and stored in model-pricing.json. We update regularly but always verify against provider pricing pages.",
        },
        {
          question: "Can I calculate monthly costs?",
          answer:
            "Yes. Enter your expected usage (requests per day, avg tokens) to get per-request, daily, and monthly cost estimates. There's also a budget reverse calculator.",
        },
        {
          question: "Are input and output tokens priced differently?",
          answer:
            "Yes. Most providers charge more for output tokens. The calculator accounts for both and lets you set different input/output token counts.",
        },
      ],
    },
  },
  {
    slug: "case-converter",
    name: "Case Converter",
    shortName: "Case",
    description:
      "Convert text between camelCase, PascalCase, snake_case, kebab-case, and more.",
    category: "text",
    tags: ["case", "camel", "snake", "kebab"],
    component: lazy(() =>
      import("@/components/tools/CaseConverter").then((m) => ({
        default: m.default,
      }))
    ),
    relatedTools: ["string-utilities", "slugify"],
    keywordsForSeo: ["case converter", "camel case", "snake case converter"],
    schema: {
      ...defaultSchema,
      faqs: [
        {
          question: "How many case formats are supported?",
          answer:
            "11 formats: Sentence case, lower case, UPPER CASE, Capital Case, aLtErNaTiNg, camelCase, PascalCase, snake_case, kebab-case, and more. All update live as you type.",
        },
        {
          question: "Can I convert variable names or API keys?",
          answer:
            "Yes. Paste JSON keys, environment variable names, or any text. The tool preserves structure while converting casing—ideal for refactoring or API integration.",
        },
        {
          question: "Does it work with multi-line text?",
          answer:
            "Yes. Convert entire paragraphs, code snippets, or lists. Each line is processed according to the selected format.",
        },
      ],
    },
  },
  {
    slug: "env-validator",
    name: ".env File Validator",
    shortName: ".env",
    description:
      "Validate .env files. Detect duplicate keys, invalid format, and best practices.",
    category: "devops",
    tags: ["env", "dotenv", "validator"],
    component: lazy(() =>
      import("@/components/tools/EnvValidator").then((m) => ({
        default: m.default,
      }))
    ),
    relatedTools: ["cron-builder", "openapi-validator"],
    keywordsForSeo: ["env validator", "dotenv validator"],
    schema: {
      ...defaultSchema,
      faqs: [
        {
          question: "What does the validator check for?",
          answer:
            "Duplicate keys, invalid KEY=value format, UPPER_SNAKE_CASE convention, and common mistakes. It also flags potentially sensitive values that might be exposed.",
        },
        {
          question: "Are my .env values sent to a server?",
          answer:
            "No. Validation runs entirely in your browser. Sensitive values are masked in the UI. Your secrets never leave your device.",
        },
        {
          question: "Can I validate multi-line values?",
          answer:
            "Yes. The validator supports quoted values, escaped characters, and multi-line env vars. It follows standard .env parsing rules.",
        },
      ],
    },
  },
  {
    slug: "openapi-validator",
    name: "OpenAPI / JSON Schema Validator",
    shortName: "OpenAPI",
    description:
      "Validate OpenAPI 3 and JSON Schema documents. JSON and YAML support.",
    category: "devops",
    tags: ["openapi", "swagger", "json schema", "api"],
    component: lazy(() =>
      import("@/components/tools/OpenApiValidator").then((m) => ({
        default: m.default,
      }))
    ),
    relatedTools: ["json-formatter", "data-format-converter"],
    keywordsForSeo: ["openapi validator", "swagger validator", "json schema"],
    schema: {
      ...defaultSchema,
      faqs: [
        {
          question: "Which OpenAPI versions are supported?",
          answer:
            "OpenAPI 3.0 and 3.1. The validator also supports standalone JSON Schema (Draft-04, Draft-07, 2019-09, 2020-12). Paste JSON or YAML.",
        },
        {
          question: "Can I validate $ref references?",
          answer:
            "Yes. The validator resolves internal $ref references. External references require the document to be self-contained or use fetchable URLs.",
        },
        {
          question: "How do I fix validation errors?",
          answer:
            "Errors are listed with paths (e.g. paths./users.get.responses). Click an error to jump to the relevant section. Fix the issue and re-validate.",
        },
      ],
    },
  },
  {
    slug: "data-format-converter",
    name: "YAML ↔ JSON ↔ TOML Converter",
    shortName: "Formats",
    description:
      "Convert between YAML, JSON, and TOML formats. Bidirectional conversion.",
    category: "data-formats",
    tags: ["yaml", "json", "toml", "convert"],
    component: lazy(() =>
      import("@/components/tools/DataFormatConverter").then((m) => ({
        default: m.default,
      }))
    ),
    relatedTools: ["json-formatter", "csv-json-converter"],
    keywordsForSeo: ["yaml to json", "json to yaml", "toml converter"],
    schema: {
      ...defaultSchema,
      faqs: [
        {
          question: "Which formats can I convert between?",
          answer:
            "YAML, JSON, and TOML. Edit in any pane and the others update in real time. Useful for config files, CI/CD, and API specs.",
        },
        {
          question: "Does it preserve data types?",
          answer:
            "Yes. Numbers, booleans, null, arrays, and nested objects are preserved. TOML has some type constraints (e.g. keys must be strings) that may affect round-trip conversion.",
        },
        {
          question: "Can I convert GitHub Actions or Docker Compose YAML?",
          answer:
            "Yes. Paste any valid YAML, JSON, or TOML. The tool handles complex structures including multi-document YAML.",
        },
      ],
    },
  },
  {
    slug: "csv-json-converter",
    name: "CSV ↔ JSON Converter",
    shortName: "CSV",
    description:
      "Convert between CSV and JSON. Table view with sorting. Auto-detect delimiter.",
    category: "data-formats",
    tags: ["csv", "json", "convert", "table"],
    component: lazy(() =>
      import("@/components/tools/CsvJsonConverter").then((m) => ({
        default: m.default,
      }))
    ),
    relatedTools: ["data-format-converter", "json-formatter"],
    keywordsForSeo: ["csv to json", "json to csv", "csv converter"],
    schema: {
      ...defaultSchema,
      faqs: [
        {
          question: "Does it auto-detect the CSV delimiter?",
          answer:
            "Yes. The tool detects comma, semicolon, tab, and pipe delimiters. You can also manually select the delimiter if auto-detect is wrong.",
        },
        {
          question: "Can I sort and edit the table view?",
          answer:
            "Yes. Click column headers to sort. The table is editable—change values and see the JSON/CSV update. Great for data wrangling.",
        },
        {
          question: "What CSV formats are supported?",
          answer:
            "Standard CSV with optional headers. Handles quoted fields, escaped commas, and multi-line values. Output can be array of objects or array of arrays.",
        },
      ],
    },
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    shortName: "JWT",
    description:
      "Decode and inspect JWT tokens. View header, payload, and expiry. No verification.",
    category: "security",
    tags: ["jwt", "token", "decode", "base64"],
    component: lazy(() =>
      import("@/components/tools/JwtDecoder").then((m) => ({
        default: m.default,
      }))
    ),
    relatedTools: ["base64-tool", "hash-generator"],
    keywordsForSeo: ["jwt decoder", "jwt decode", "jwt parser"],
    schema: {
      ...defaultSchema,
      faqs: [
        {
          question: "Does this tool verify JWT signatures?",
          answer:
            "No. This is a decoder only—it shows the header and payload. For signature verification you need your auth provider's tools or a library with the secret/key.",
        },
        {
          question: "What does the expiry badge show?",
          answer:
            "The exp (expiration) claim is parsed and displayed. You'll see whether the token is valid, expired, or expiring soon. Useful for debugging auth issues.",
        },
        {
          question: "Is my JWT sent to a server?",
          answer:
            "No. Decoding uses Base64 in your browser. JWTs are designed to be readable—the payload is base64url-encoded, not encrypted. Never paste tokens with sensitive data you wouldn't want visible.",
        },
      ],
    },
  },
  {
    slug: "html-entity-tool",
    name: "HTML Entity Encoder / Decoder",
    shortName: "HTML",
    description:
      "Encode and decode HTML entities. Named and numeric variants.",
    category: "web",
    tags: ["html", "entity", "encode", "decode"],
    component: lazy(() =>
      import("@/components/tools/HtmlEntityTool").then((m) => ({
        default: m.default,
      }))
    ),
    relatedTools: ["url-tool", "base64-tool"],
    keywordsForSeo: ["html entity encoder", "html entity decoder"],
    schema: {
      ...defaultSchema,
      faqs: [
        {
          question: "When should I use HTML entities?",
          answer:
            "Use entities when displaying <, >, &, or quotes in HTML to avoid XSS and parsing errors. Also for special characters (é, ©) when you can't use UTF-8.",
        },
        {
          question: "What's the difference between named and numeric entities?",
          answer:
            "Named entities use &amp; or &copy;. Numeric use &#169; (decimal) or &#x00A9; (hex). Numeric entities work for any Unicode character; named entities only for common ones.",
        },
        {
          question: "Is there a reference table?",
          answer:
            "Yes. The tool includes a searchable reference of common HTML entities—arrows, symbols, accented letters, and more. Click to insert into your text.",
        },
      ],
    },
  },
  {
    slug: "lorem-ipsum-generator",
    name: "Lorem Ipsum Generator",
    shortName: "Lorem",
    description:
      "Generate placeholder text. Classic Lorem Ipsum or developer mode.",
    category: "generators",
    tags: ["lorem", "placeholder", "text"],
    component: lazy(() =>
      import("@/components/tools/LoremIpsumGenerator").then((m) => ({
        default: m.default,
      }))
    ),
    relatedTools: ["uuid-generator", "string-utilities"],
    keywordsForSeo: ["lorem ipsum generator", "placeholder text"],
    schema: {
      ...defaultSchema,
      faqs: [
        {
          question: "What is developer mode?",
          answer:
            "Developer mode generates placeholder text with code-like structure: variable names, function calls, JSON keys. Useful for mocking UI with realistic dev content.",
        },
        {
          question: "Can I control the length of generated text?",
          answer:
            "Yes. Specify words, sentences, or paragraphs. The generator produces the requested amount of Lorem Ipsum or developer-style placeholder text.",
        },
        {
          question: "Why use Lorem Ipsum instead of real text?",
          answer:
            "Lorem Ipsum doesn't distract with meaning—designers and developers can focus on layout and typography. It also avoids copyright issues with real content.",
        },
      ],
    },
  },
  {
    slug: "number-base-converter",
    name: "Number Base Converter",
    shortName: "Base",
    description:
      "Convert between binary, octal, decimal, and hexadecimal. All bases update live.",
    category: "math",
    tags: ["number", "binary", "hex", "decimal"],
    component: lazy(() =>
      import("@/components/tools/NumberBaseConverter").then((m) => ({
        default: m.default,
      }))
    ),
    relatedTools: ["string-utilities", "hash-generator"],
    keywordsForSeo: ["binary converter", "hex to decimal", "number base"],
    schema: {
      ...defaultSchema,
      faqs: [
        {
          question: "Which number bases are supported?",
          answer:
            "Binary (base 2), octal (base 8), decimal (base 10), and hexadecimal (base 16). Edit any field and the others update instantly. Handles negative numbers and large values.",
        },
        {
          question: "Is this useful for programming?",
          answer:
            "Yes. Convert hex color codes, bit flags, file permissions (octal), or debug numeric values. Essential for low-level programming and systems work.",
        },
        {
          question: "Does it handle invalid input?",
          answer:
            "Yes. Invalid characters for a base are highlighted. The tool shows which bases have valid values and which need correction.",
        },
      ],
    },
  },
  {
    slug: "json-to-typescript",
    name: "JSON → TypeScript Interface Generator",
    shortName: "JSON→TS",
    description:
      "Generate TypeScript interfaces from JSON. Configurable root name and optional fields.",
    category: "code",
    tags: ["json", "typescript", "interface", "generate"],
    component: lazy(() =>
      import("@/components/tools/JsonToTypescript").then((m) => ({
        default: m.default,
      }))
    ),
    relatedTools: ["json-formatter", "data-format-converter"],
    keywordsForSeo: ["json to typescript", "json to interface"],
    schema: {
      ...defaultSchema,
      faqs: [
        {
          question: "How does it handle nested objects?",
          answer:
            "The generator recursively creates interfaces for nested objects. Each level gets a descriptive interface name. You can configure the root interface name.",
        },
        {
          question: "Can I make all properties optional?",
          answer:
            "Yes. Toggle optional fields to add ? to every property. Useful when your JSON is a subset of the full schema or when building partial types.",
        },
        {
          question: "Does it infer union types?",
          answer:
            "Arrays with mixed types may produce union types. The tool analyses your JSON structure and generates accurate TypeScript that matches the data.",
        },
      ],
    },
  },
  {
    slug: "markdown-preview",
    name: "Markdown → HTML Preview",
    shortName: "Markdown",
    description:
      "Preview Markdown as HTML. Live preview with sanitized output.",
    category: "text",
    tags: ["markdown", "html", "preview"],
    component: lazy(() =>
      import("@/components/tools/MarkdownPreview").then((m) => ({
        default: m.default,
      }))
    ),
    relatedTools: ["html-entity-tool", "string-utilities"],
    keywordsForSeo: ["markdown preview", "markdown to html"],
    schema: {
      ...defaultSchema,
      faqs: [
        {
          question: "Which Markdown features are supported?",
          answer:
            "Headers, bold, italic, code, code blocks, lists, blockquotes, links, images, and tables. Uses the CommonMark spec. GitHub Flavored Markdown extensions like tables are supported.",
        },
        {
          question: "Is the HTML output safe from XSS?",
          answer:
            "Yes. Output is sanitized with DOMPurify before rendering. Scripts and dangerous attributes are stripped. Safe to use for user-generated content previews.",
        },
        {
          question: "Can I use this for README preview?",
          answer:
            "Yes. Paste README.md content to see how it will render on GitHub, npm, or documentation sites. Great for writing docs before committing.",
        },
      ],
    },
  },
  {
    slug: "css-gradient-generator",
    name: "CSS Gradient Generator",
    shortName: "Gradient",
    description:
      "Create linear, radial, and conic gradients. Live preview. Export as CSS or Tailwind.",
    category: "design",
    tags: ["css", "gradient", "design"],
    component: lazy(() =>
      import("@/components/tools/CssGradientGenerator").then((m) => ({
        default: m.default,
      }))
    ),
    relatedTools: ["color-converter"],
    keywordsForSeo: ["css gradient generator", "gradient generator"],
    schema: {
      ...defaultSchema,
      faqs: [
        {
          question: "Which gradient types are supported?",
          answer:
            "Linear, radial, and conic gradients. Add colour stops, drag to reorder, and adjust positions. Angle and position controls for fine-tuning.",
        },
        {
          question: "Can I export for Tailwind CSS?",
          answer:
            "Yes. Export as standard CSS, Tailwind arbitrary values, or SVG. Copy and paste directly into your project.",
        },
        {
          question: "Is there a live preview?",
          answer:
            "Yes. The gradient updates in real time as you add stops or change colours. See exactly how it will look before copying the code.",
        },
      ],
    },
  },
  {
    slug: "string-utilities",
    name: "String Utilities",
    shortName: "String",
    description:
      "Word count, reverse, slugify, sort lines, remove duplicates, and more.",
    category: "text",
    tags: ["string", "text", "utilities"],
    component: lazy(() =>
      import("@/components/tools/StringUtilities").then((m) => ({
        default: m.default,
      }))
    ),
    relatedTools: ["case-converter", "regex-tester"],
    keywordsForSeo: ["string utilities", "word count", "slugify"],
    schema: {
      ...defaultSchema,
      faqs: [
        {
          question: "What operations are available?",
          answer:
            "Word count, character count, reverse, slugify, sort lines, remove duplicates, trim, and more. Switch between operations via tabs. All run instantly.",
        },
        {
          question: "Can I process multi-line text?",
          answer:
            "Yes. Operations like sort lines and remove duplicates work on line-by-line basis. Word count and others handle paragraphs. Paste from any source.",
        },
        {
          question: "Is slugify URL-safe?",
          answer:
            "Yes. Slugify converts text to lowercase, replaces spaces with hyphens, and removes special characters. Output is safe for URLs and filenames.",
        },
      ],
    },
  },
];

export function getToolBySlug(slug: string): ToolConfig | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getToolsByCategory(cat: ToolCategory): ToolConfig[] {
  return tools.filter((t) => t.category === cat);
}

export const categories = [...new Set(tools.map((t) => t.category))] as ToolCategory[];
